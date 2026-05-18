export interface DefaultArticle {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  published: boolean;
  sortOrder: number;
  content: string;
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const TITLES: [string, string][] = [
  ["Getting Started with Red Tractor Compliance", "Getting Started"],
  ["Recording Spray Applications", "Sprays & Inputs"],
  ["Managing Your Field Register", "Fields & Crops"],
  ["Equipment Service, MOT & Calibration Records", "Equipment"],
  ["Livestock Movement Records", "Livestock"],
  ["Visitor Logging and Biosecurity Plan", "Biosecurity"],
  ["Staff Training & Certificates", "Staff & Training"],
  ["Inspection Preparation Checklist", "Inspections"],
  ["Understanding COSHH Requirements", "Risk & Waste"],
  ["Financial Record Keeping", "Financial"],
  ["Weather Station Setup", "Weather"],
  ["Document Management Best Practices", "Documents"],
  ["Biofuel / RTFO Compliance Overview", "Biofuel / RTFO"],
  ["ISCC Certification and Land Eligibility", "Biofuel / RTFO"],
  ["Recording Biofuel Deliveries and GHG Savings", "Biofuel / RTFO"],
  ["NVZ Rules, Applications and Risk Assessments", "Nutrient Management"],
  ["Nutrient Management Planning (NMP)", "Nutrient Management"],
  ["Soil Testing and Sampling Records", "Fields & Crops"],
  ["Harvest Records and Yield Tracking", "Fields & Crops"],
  ["Livestock Medicine Records and Withdrawal Periods", "Livestock"],
  ["Pest Control and Cleaning Records", "Biosecurity"],
  ["Using the Mobile App for Field Recording", "Mobile App"],
  ["Livestock Movement Reporting: Scotland, Wales and Northern Ireland", "Livestock"],
  ["Analytical Dashboards and Compliance Snapshots", "Dashboards"],
  ["Sharing Records with Advisors and Inspectors", "Getting Started"],
  ["Logging Field Operations", "Fields & Crops"],
  ["Logging Animal Mortality Records", "Livestock"],
  ["Feed Records and Traceability", "Livestock"],
  ["Water Quality Testing Records", "Livestock"],
  ["Environmental Management — Features, Schemes & Management Events", "Environmental"],
  ["Field Inspections — Logging, Action Flags & Resolution Tracking", "Inspections"],
  ["Farm Buildings & Areas Registry", "Getting Started"],
  ["Understanding Business Reports", "Dashboards"],
  ["SMS Text Alerts — Setup, Who Receives Them & Opting In", "Getting Started"],
  ["Waste Disposal Logging — Records, Carrier Licences & Legal Requirements", "Risk & Waste"],
  ["Week Ahead & Month Ahead — Your Compliance Planner", "Planning"],
  ["Task Board — Managing Staff Task Assignments", "Planning"],
  ["Individual Animal Register and Electronic Identification (EID)", "Livestock"],
  ["Milk Recording and Milk Records", "Livestock"],
  ["Mastitis Records and Treatment Logging", "Livestock"],
  ["Calving Records and Colostrum Management", "Livestock"],
  ["Dry Cow Therapy (DCT) Records", "Livestock"],
  ["Workshop & Asset Management — Overview", "Equipment"],
  ["Scanning QR Codes with the Mobile App", "Mobile App"],
  ["Generating QR Labels for Fields, Animals, and Storage", "Mobile App"],
  ["PAT Testing & Fire Extinguisher Records", "Equipment"],
  ["Workshop Risk Assessments & COSHH", "Risk & Waste"],
  ["Getting Started with Pig Production Records", "Pig Production"],
  ["Pig Movement and Identification", "Pig Production"],
  ["Getting Started with Poultry Production Records", "Poultry Production"],
  ["Salmonella, Biosecurity and Poultry Health Plans", "Poultry Production"],
  ["Getting Started with Fresh Produce Records", "Fresh Produce"],
  ["Pre-Harvest Intervals, MRLs and Residue Testing", "Fresh Produce"],
  ["Carbon & Sustainability Records", "Carbon & Sustainability"],
  ["Farm Diversification Records", "Diversification"],
  ["Water & Irrigation Management", "Water & Irrigation"],
  ["AI & Reproduction Records for Livestock", "Livestock"],
  ["Veterinary Prescriptions & Medicine Book", "Livestock"],
  ["SFI & Agri-Environment Actions", "Environmental"],
  ["Slurry & Manure Management Records", "Environmental"],
  ["Grain Storage Quality Records", "Equipment"],
  ["Fly-Tipping — Recording Incidents, Authority Reporting and Photo Evidence", "Environmental"],
  ["Unauthorized Encampments — Recording, Authority Action and Legal Remedies", "Environmental"],
  ["Crop Trials Register — Setting Up and Managing On-Farm Trials", "Fields & Crops"],
  ["Haulage & Transport — Module Overview", "Haulage"],
  ["Dispatch Plans — Planning and Managing Crop Movements", "Haulage"],
  ["Forward Contracts — Managing Grain Sales & Pricing", "Financial"],
  ["Grain Position — Tracking Your Crop Stock", "Haulage"],
  ["Tail Biting Risk Assessments — Pig Production", "Pig Production"],
  ["Farrowing & Sow Records — Pig Production", "Pig Production"],
  ["Broiler Welfare Indicators (BWI) — Poultry Production", "Poultry Production"],
  ["House Cleanout Records — Contractor Tracking, Disinfectant and Cost", "Poultry Production"],
  ["Right to Work Checks for Farm Employers", "Staff & Training"],
  ["Staff Management & System Access", "Staff & Training"],
  ["Thinning Records — Poultry Production", "Poultry Production"],
  ["Soil Sample Register — Understanding References and Status", "Fields & Crops"],
  ["AI & Reproduction Records — Cattle and Livestock", "Livestock"],
  ["Vet Prescriptions — Storing and Tracking Written Authorisations", "Livestock"],
  ["SFI / ELMS Agreements — Recording and Tracking Agri-Environment Schemes", "Environmental"],
  ["Slurry & Manure Management — Records and Closed Period Compliance", "Environmental"],
  ["Grain Storage Quality — Monitoring and Record Keeping", "Equipment"],
  ["Fresh Produce Module — Crop Records, Sprays, and Assurance", "Fresh Produce"],
  ["Carbon & Sustainability — Measuring and Recording Your Farm's Footprint", "Carbon & Sustainability"],
  ["Farm Diversification — Recording Non-Agricultural Activities", "Diversification"],
  ["Water & Irrigation — Abstraction, Usage, and Compliance Records", "Water & Irrigation"],
  ["Equipment Defect Reports — Tracking Faults and Repairs", "Equipment"],
  ["Testing Laboratories — Registering Labs and Linking Test Results", "Getting Started"],
  ["Pig Production Module — Overview", "Pig Production"],
  ["Poultry Production Module — Overview", "Poultry Production"],
  ["Fresh Produce Module — Overview", "Fresh Produce"],
  ["Carbon & Sustainability Module — Overview", "Carbon & Sustainability"],
  ["Farm Diversification Module — Overview", "Diversification"],
  ["Water & Irrigation Module — Overview", "Water & Irrigation"],
  ["AI & Reproduction Records — Livestock", "Livestock"],
  ["Sire Register — Recording Donor Bulls, Rams, Boars & Bucks", "Livestock"],
  ["Straw Inventory — Managing AI Semen Deliveries & Stock Levels", "Livestock"],
  ["Lambing Records — Red Tractor Sheep Assurance", "Livestock"],
  ["Vet Prescriptions & Medicines — Red Tractor Requirements", "Livestock"],
  ["SFI / ELMs Actions & Agreements — Environmental Module", "Environmental"],
  ["Slurry & Manure Management — Environmental Module", "Environmental"],
  ["Grain Store Quality Management — Equipment Module", "Equipment"],
  ["Soil Sample Register — Format and Reference Numbers", "Fields & Crops"],
  ["Farm Insurance Register", "Financial"],
  ["Purchase Orders — Raising and Managing POs", "Financial"],
  ["Goods Received Notes (GRN) — Logging Deliveries and Linking to POs", "Financial"],
  ["Batch & Lot Traceability in Spray Application Records", "Sprays & Inputs"],
  ["Farm Planner — Week Ahead & Month Ahead View", "Planning"],
  ["Grants & Funding Register — Tracking FETF and Scheme Applications", "Financial"],
  ["Inspections Module — Tabs, Non-Conformances and Farm Assurance Certificates", "Inspections"],
  ["Risk Assessments — Using Hazard Templates and Recording COSHH Assessments", "Risk & Waste"],
  ["Waste Disposal — EWC Codes and Duty of Care", "Risk & Waste"],
  ["Documents Module — Red Tractor Required Documents Checklist", "Documents"],
  ["Crop Contracts — Recording Grain Marketing Agreements", "Financial"],
  ["Haulage Module — Movement Records, Grain Position and Haulier Directory", "Haulage"],
  ["Mobile App — Offline Data and How Reference Pickers Work", "Mobile App"],
  ["Fuel & Energy Management — HMRC Compliance, Oil Storage, LPG and Grid Energy", "Fuel & Energy"],
  ["Feed Management — UFAS/FEMAS Traceability, Medicated Feed and Stock Levels", "Feed Management"],
  ["Compliance & Plans — Feed Contingency Plan, Disease Log and Feed Recalls", "Feed Management"],
  ["Sales & Trading — Recording Farm Output", "Financial"],
  ["Continuous Soil Monitoring — Sensor Probes and Readings", "Fields & Crops"],
  ["Organic Compliance Overview & Certification Tracking", "Organic"],
  ["Recording Organic Inspections & Attaching Documents", "Organic"],
  ["Organic Input Register & Restricted Inputs", "Organic"],
  ["Field Conversion Tracker & Parallel Production", "Organic"],
  ["Organic Livestock — Herd Register Linkage & Conversion", "Organic"],
  ["Organic Livestock — Treatment Compliance (No Double Entry)", "Organic"],
  ["Organic Dairy — Herd Conversion & Milk Collection Records", "Organic Dairy"],
  ["Organic Dairy — Treatment Compliance & Organic Feed Records", "Organic Dairy"],
  ["TB Testing — Enhanced Data Capture & History", "Livestock"],
  ["Welfare Outcome Assessments — Scoring, Reporting & Mobile Recording", "Livestock"],
  ["Fallen Stock Records — Contractor, Veterinary Details & Invoice Tracking", "Livestock"],
  ["Sheep Dipping Records — Pesticide Certificates & Stock Usage", "Livestock"],
  ["Vet Prescriptions — Linking Treatments to Written Authorisations", "Livestock"],
  ["Department Management — Creating Departments & Assigning Staff", "Staff & Training"],
  ["Task Assignment — Filtering by Department & Viewing Department Tasks", "Staff & Training"],
  ["Contractor H&S File — Reviews, Compliance Tasks & Supplier Badges", "Risk & Waste"],
  ["Task Board — New Task Types & Filtering Completed Tasks by Date", "Planning"],
  ["PPE Register — Where to Find It & How the Three Sub-Registers Work", "Staff & Training"],
  ["PPE Stock Register — Supplier Traceability, Invoice Refs & Stock Levels", "Staff & Training"],
  ["PPE Issue Register — Issuing PPE to Staff & Recording Condition Checks", "Staff & Training"],
  ["PPE Risk Assessments — Recording Assessments Under PPE at Work Regulations 2022", "Staff & Training"],
  ["PPE Compliance Pack — Printing the Full PPE Register for Inspection", "Staff & Training"],
  ["PPE Staff Record — Printing an Individual Staff Member's PPE History", "Staff & Training"],
  ["Sheep Production Module — Overview and Getting Started", "Sheep Production"],
  ["Sheep Flock Register — Flocks are Registered in Livestock → Herds & Animals", "Sheep Production"],
  ["Sheep Tupping Records — Ram Selection, Service Dates and Scanning Expectation", "Sheep Production"],
  ["Sheep Scanning Records — Pregnancy Scanning, Litter Sizes and Expected Lambing", "Sheep Production"],
  ["Sheep Weigh-in and DLWG — Performance Recording and Target Tracking", "Sheep Production"],
  ["Sheep Shearing Records — Fleece Weight, Contractor Details and BWMB Traceability", "Sheep Production"],
  ["Red Tractor Sheep Assurance Checklist — Preparing for an Assessor Visit", "Sheep Production"],
  ["Beef Production Module — Overview and Getting Started", "Beef Production"],
  ["Beef Weigh-in and DLWG Records — Tracking Growth Performance", "Beef Production"],
  ["Beef Finishing Records — Entry Weight, Exit Weight and Deadweight Settlement", "Beef Production"],
  ["Beef Body Condition Scoring — Recording and Monitoring BCS on the 1–5 Scale", "Beef Production"],
  ["Medicated Feed Withdrawal Tracking — Recording Active Ingredients and Clearance Dates", "Feed Management"],
  ["Grain Drying Records — Logging Drying Events, Moisture Reduction and Costs", "Equipment"],
  ["Grain Quality Tests — Mycotoxin, Pesticide Residue, Specific Weight and Conditioning", "Equipment"],
  ["Training Competency Matrix — Staff × Certificate Traffic-Light Compliance View", "Staff & Training"],
  ["Red Tractor Audit Pack Generator — Assembling Evidence Packs for Assessor Visits", "Inspections"],
  ["NVZ Closed Period Automation — Countdown Widgets and Application Budget Remaining", "Nutrient Management"],
  ["Carbon Auto-Calculator — DEFRA 2023 Emission Factors and Scope 1, 2 and 3 Calculations", "Carbon & Sustainability"],
  ["Crop Rotation Planner — Field × Year Grid, OSR Interval Warnings and Sequence Planning", "Fields & Crops"],
  ["Labour Management — Setup Order, Rota, Timesheet Submission & Approval Workflow", "Staff & Training"],
  ["Labour Management — Timesheet Approval, SMS Notifications & Submission Status Grid", "Staff & Training"],
  ["Labour Management — Mobile Leave Requests, Pending Approval Panel & SMS Notifications", "Staff & Training"],
  ["Labour Management — Holiday Planner, Conflict Detection and Month-by-Month Calendar View", "Staff & Training"],
  ["Labour Management — Printable Blank Leave Request Form (FT-LR-01) and Paper Submission Workflow", "Staff & Training"],
  ["Labour Management — Actual Attendance Recording, Discrepancy Flags and Bradford Factor Sickness Analysis", "Staff & Training"],
  ["Labour Management — Department Grouping and Colour-Coded Section Headers Across All Six Tabs", "Staff & Training"],
  ["Livestock Deadweight Sales — Linking Kill Sheets to Off-Farm Movement Records (BCMS Audit Trail)", "Sales & Trading"],
  ["Livestock Mart / Auction Sales — Linking Sale Records to Off-Farm Movement Records (LIS Audit Trail)", "Sales & Trading"],
  ["TB Test to Movement Record Linkage — APHA Pre-Movement Testing Evidence and Cross-Compliance", "Livestock & Feed Management"],
  ["Grain Sale Call-Off to Forward Contract Linkage — Traceability from Merchant Contract to Weighbridge", "Sales & Trading"],
  ["Benchmarking Panels — AHDB and Andersons Performance Comparisons", "Finance & Business"],
  ["NVZ Budget Calculator — Per-Field Nitrogen Budget vs DEFRA Field Limit", "Nutrient Management"],
  ["Multi-Farm Consolidated Dashboard — Group Compliance Overview Across Holdings", "Dashboards"],
  ["Settlement Notes — Recording Grain and Livestock Settlement Documents", "Financial"],
  ["Inspector Mode — Advisor Portal Filtered Compliance View", "Getting Started"],
  ["Smart Date Validation — How Date Fields Work Across the Platform", "Getting Started"],
  ["Staff Auto-Populate — Operator and Assessor Fields Pre-Fill from Your Login", "Getting Started"],
  ["Viticulture Module Overview — Vine Register, Blocks, Phenology, Operations, Harvest & Scouting", "Viticulture"],
  ["Vine Register — UK Variety and Rootstock Selects, Removal Status and Audit Trail", "Viticulture"],
  ["Vineyard Block Management — Permanent Block Sites, Active Planting Lifecycle (Active, Suspended, Removed), Retire and Replant Workflows, and Full Planting History per Block", "Viticulture"],
  ["BBCH Phenology Records — Growth Stage Observation Log and Season Comparison", "Viticulture"],
  ["Canopy & Pruning Operations — Operation Types, Pruning Systems and Bud Count Records", "Viticulture"],
  ["Harvest Records — Yield, Must Chemistry (Brix, pH, TA, Potential Alcohol) and Botrytis Flag", "Viticulture"],
  ["Disease & Pest Scouting — Pressure Ratings, Xylella and Phytophthora Notifiable Organism Flags", "Viticulture"],
  ["Viticulture Mobile Screens — Vine Scouting, Phenology, Operations and Harvest with Active Block Picker", "Viticulture"],
  ["Winery Licensing — Premises Licence, Personal Licence, DPS and Expiry Status Records", "Viticulture"],
  ["Winery Excise & Duty Returns — HMRC Wine Duty Register, Payment Status and Return Period Tracking", "Viticulture"],
  ["Winery Tastings & Tours — Cellar Door Event Register, Attendee Counts and Session Revenue", "Viticulture"],
  ["Winery Age Verification (Challenge 25) — ID Check Register, Outcome Log and Compliance Audit Trail", "Viticulture"],
  ["Wine Production — SO\u2082 Compliance, Additive Records and Organic Wine Certification per Vintage", "Viticulture"],
  ["Organic Livestock — Feed Records Log, Date Defaults & Species-Filtered Herd Selector", "Organic"],
  ["Organic Livestock — Feed Derogations: Case Management, Correspondence Log & Document Storage", "Organic"],
  ["Organic Livestock — Outdoor Access Log, Herd Register Cascade & Compliance Status", "Organic"],
  ["Organic Dairy — Milk Collection Records, Feed Records & Daily Date Defaults", "Organic Dairy"],
  ["Organic Fresh Produce — Input Log, Supplier Lookup, Applied-By Staff & Date Defaults", "Organic"],
  ["Organic Fresh Produce — Input Derogations: Case Register, Correspondence Log & Document Storage", "Organic"],
  ["Organic Dairy — Feed Derogation Case Linking in Feed & Nutrition Records", "Organic Dairy"],
  ["Mobile App — FP Input Derogation Register: Viewing Cases and Logging Derogation-Required Inputs", "Mobile App"],
  ["Mobile App — Organic Farming Quick Capture: Herd Lookup, Outdoor Access & Treatment Recording", "Mobile App"],
  ["Organic Viticulture — Block Conversion Register: 3-Year Conversion Tracking and Certifying Body Records", "Organic Viticulture"],
  ["Organic Viticulture — Organic Input Log: Approved Products, Approval Status and Certifier References", "Organic Viticulture"],
  ["Organic Viticulture — Copper Register: Application Log and Running 28 kg Per 7-Year Limit Tracker", "Organic Viticulture"],
  ["Organic Viticulture — Input Derogations: Case Register, Correspondence Log and Availability Evidence", "Organic Viticulture"],
  ["Organic Viticulture — Wine Production Additives: SO2 Compliance, Additive Records and Organic Certification (Shared with Standard Viticulture)", "Organic Viticulture"],
  ["Organic Viticulture — Certificates: Vineyard and Wine Organic Certificate Register", "Organic Viticulture"],
  ["Mobile App — Organic Viticulture Derogation Register: Viewing Input Derogation Cases in the Field", "Mobile App"],
  ["Organic Livestock — Full Livestock Tab Access: Herds & Flocks, Animals, Vet Health Plans, Mortality, TB Tests and More", "Organic"],
  ["Organic Fresh Produce — Full Fresh Produce Tab Access: Crops, Water Tests, Harvest, Intake, Packhouse and Allergens", "Organic"],
  ["Organic Viticulture — Full Viticulture Tab Access: Vine Register, Block Lifecycle, Phenology, Pruning & Canopy, Harvest, Disease Scouting and Winery Compliance (Licensing, Excise & Duty, Tastings & Tours, Age Verification, Wine Production)", "Organic Viticulture"],
  ["Accident Book — Four-Stage Investigation Workflow", "Health, Safety & Risk"],
  ["Vet Health Plans — Recording Action Completion and Manager Sign-Off", "Livestock"],
  ["Livestock Mortality Records — Four-Stage Disposal Tracking", "Livestock"],
  ["Organic Viticulture — Input Derogations: Split New Case / Record Decision Workflow", "Organic Viticulture"],
  ["Sheep Disease Monitoring — Reportable Disease Flag and APHA Advisory", "Sheep Production"],
  ["Herd Health Follow-Up Tasks — Raising Tasks from Clinical Event Timeline Entries", "Livestock"],
  ["Poultry Cleanout Swab Testing — Food Safety Advisory and Do Not Restock Guidance", "Poultry Production"],
  ["Poultry Environmental Alarm Advisory — Corrective Action Before Next Flush Cycle", "Poultry Production"],
  ["Harvest Destination Type — Own Holding, Contract Processor and Grape Sale Selector", "Viticulture"],
  ["Harvest Botrytis Advisory — Amber Quality Alert and Task Raising on High Botrytis or Poor Condition", "Viticulture"],
];

const CONTENT: [string, string][] = [
  // 0 — Getting Started with Red Tractor Compliance
  [
    "An introduction to Red Tractor Compliance on BDE Farm Trac, covering the setup wizard, module selection, and how records map to scheme standards.",
    `<h2>Getting Started with Red Tractor Compliance</h2>
<p>BDE Farm Trac is built around the Red Tractor Combinable Crops, Beef &amp; Lamb, Dairy, Fresh Produce, and Poultry standards. The platform captures the evidence trail those schemes require — spray records, livestock movements, medicine withdrawal periods, staff certificates, and more — in a structured, auditable way that lets you hand over records to an assessor with confidence.</p>
<h3>Setting up your farm</h3>
<p>After registering, the four-step setup wizard guides you through:</p>
<ul>
<li><strong>Step 1 — Business details:</strong> trading name, contact email, phone, and address.</li>
<li><strong>Step 2 — Farm details:</strong> farm name, CPH number (County Parish Holding), postcode, and the farm sectors that apply (arable, beef, sheep, dairy, pigs, poultry, eggs, goats, equine, fresh produce, viticulture — tick as many as apply).</li>
<li><strong>Step 3 — Modules:</strong> choose additional modules alongside the required Red Tractor Compliance module.</li>
<li><strong>Step 4 — Review and subscribe:</strong> subscribe directly or go to the dashboard to explore first.</li>
</ul>
<h3>How records map to Red Tractor</h3>
<p>Each module is designed around a specific assurance standard. Spray applications map to the Crop Protection section. Medicine records cover the Veterinary Medicines section. Staff certificates satisfy the Operator Competency requirements. The Inspections module provides a structured pre-inspection self-assessment for each scheme.</p>
<h3>Adding additional holdings</h3>
<p>You can add multiple farm holdings to a single account at any time from Settings. Each holding has its own fields, staff, and records. Use the farm selector at the top of the sidebar to switch between them. The Group Dashboard shows a consolidated compliance view across all your holdings.</p>
<h3>Next steps</h3>
<p>Once setup is complete, work through the following in order: add your fields to the Field Register, add your staff and their certificates to Staff &amp; Training, then begin recording spray applications, livestock movements, and medicine treatments. The Compliance Dashboard shows which areas still need attention.</p>`,
  ],

  // 1 — Recording Spray Applications
  [
    "How to record a spray application in BDE Farm Trac, including operator certificates, product details, batch numbers, and weather conditions.",
    `<h2>Recording Spray Applications</h2>
<p>Spray application records are one of the most scrutinised elements of a Red Tractor Combinable Crops or Fresh Produce audit. BDE Farm Trac captures everything an assessor will look for in a single structured record.</p>
<h3>How to add a spray record</h3>
<p>Navigate to <strong>Sprays &amp; Inputs</strong> and click <strong>New Application</strong>. Complete the following sections:</p>
<ul>
<li><strong>Date and field:</strong> select the field from your registered field list. Multiple fields can be added to one record if the same product and dose was applied across all of them in a single pass.</li>
<li><strong>Operator:</strong> select from your staff list. If the operator's PA1/PA2/PA6 certificate is expired, a warning badge appears — the record can still be saved but the non-compliance is flagged.</li>
<li><strong>Product:</strong> search your product catalogue. The product's active ingredient, MAPP number, and label rates are carried forward automatically.</li>
<li><strong>Dose and water volume:</strong> enter the dose in the product's registered unit. The system checks the dose against the label maximum and warns if exceeded.</li>
<li><strong>Batch and lot number:</strong> enter the batch number from the container. This is linked to Goods Received Notes if the product was procured through the Trade Contacts &amp; Stock module, giving full batch traceability from supplier to field.</li>
<li><strong>Weather conditions:</strong> temperature, wind speed, wind direction, and rainfall. The Fetch Live button auto-fills current conditions from Open-Meteo.</li>
<li><strong>Growth stage (BBCH):</strong> required for some label approvals and for LEAF audits.</li>
</ul>
<h3>Withdrawal periods and pre-harvest intervals</h3>
<p>For each product on a food crop, the system calculates the earliest permitted harvest date from the application date and the product's label PHI. The harvest record is linked back to spray records for the same field to confirm the interval was observed.</p>
<h3>Exporting records</h3>
<p>All spray records export to CSV from the Export button. The file includes all fields in a format compatible with Red Tractor evidence packs and BASIS consultant reporting.</p>`,
  ],

  // 2 — Managing Your Field Register
  [
    "How to set up and maintain the Field Register in BDE Farm Trac, including field boundaries, soil type, NVZ status, and crop history.",
    `<h2>Managing Your Field Register</h2>
<p>The Field Register is the central reference for all field-level records on your farm. Fields must be registered before you can attach spray applications, harvest records, soil samples, or NVZ entries to them.</p>
<h3>Adding a field</h3>
<p>Navigate to <strong>Field &amp; Crop Management</strong> and click <strong>Add Field</strong>. The form captures:</p>
<ul>
<li><strong>Field name and reference:</strong> your internal name and an optional OS or BPS reference.</li>
<li><strong>Total area (ha):</strong> the cropped area in hectares to three decimal places.</li>
<li><strong>Soil type:</strong> Sandy, Sandy Loam, Medium (Loam), Heavy Clay, Peat, or Chalk — used by the NVZ module for closed period and application limit calculations.</li>
<li><strong>NVZ status:</strong> toggle on if the field falls within a Nitrate Vulnerable Zone. Required for NVZ record keeping.</li>
<li><strong>OS parcel reference:</strong> the Rural Payments Agency or Rural Payments Wales parcel identifier for subsidy cross-compliance records.</li>
<li><strong>GPS coordinates:</strong> used by the Weather module to fetch live conditions and by mapping integrations.</li>
</ul>
<h3>Crop history</h3>
<p>Each field carries a crop history table showing the crop grown in each season. This feeds the Crop Rotation Planner, which flags OSR break interval breaches and helps plan future rotations.</p>
<h3>Field status</h3>
<p>Fields can be marked as Active or Inactive. Inactive fields are hidden from pickers in spray, harvest, and NVZ forms but all their historical records are permanently retained. Reactivate a field at any time from the Field Register.</p>
<h3>Bulk import</h3>
<p>If you have an existing spreadsheet of field data, contact the support team for assistance with a bulk import via CSV. Fields imported this way appear immediately in all pickers across the platform.</p>`,
  ],

  // 3 — Equipment Service, MOT & Calibration Records
  [
    "How to record equipment services, MOTs, and calibration events in BDE Farm Trac to satisfy Red Tractor and BASIS audit requirements.",
    `<h2>Equipment Service, MOT & Calibration Records</h2>
<p>The Equipment &amp; Vehicle Management module keeps a full service, MOT, and calibration history for every machine on your farm. Red Tractor and BASIS require sprayer calibration records; the Health and Safety Executive requires vehicle roadworthiness records. BDE Farm Trac captures both in one place.</p>
<h3>Registering equipment</h3>
<p>Navigate to <strong>Equipment &amp; Vehicles</strong> and click <strong>Add Equipment</strong>. Record the equipment name, type (tractor, sprayer, combine, ATV, trailer, etc.), registration or serial number, manufacturer, model, year of manufacture, and current odometer reading.</p>
<h3>Recording a service</h3>
<p>Select the piece of equipment and click <strong>Add Service Record</strong>. Capture the service date, service type (full service, interim, inspection), mileage or hours at service, work carried out, parts replaced, cost, and the name of the workshop or mechanic. Attach the service invoice as a document.</p>
<h3>MOT records</h3>
<p>For road-registered vehicles, record the MOT date, pass or fail status, next due date, and any advisory items. An expiry warning appears on the Equipment Register 30 days before the next MOT is due.</p>
<h3>Sprayer calibration (NSTS)</h3>
<p>For sprayers, record the NSTS test date, the approved test centre, the next test due date (every three years under UK law), and the test certificate number. The sprayer's NSTS status is shown on every spray application record that uses that machine — a lapsed test is flagged as a non-compliance.</p>
<h3>Defect reports</h3>
<p>Pre-use defect checks can be logged from the mobile app or the dashboard. Each defect report captures the reporter, the defect description, urgency rating, and resolution status. Open defects appear as an action card on the Equipment page until marked as resolved.</p>`,
  ],

  // 4 — Livestock Movement Records
  [
    "How to record on-farm and off-farm livestock movements in BDE Farm Trac to comply with BCMS, ScotEID, and APHA reporting requirements.",
    `<h2>Livestock Movement Records</h2>
<p>Every movement of cattle, sheep, pigs, or goats on or off your holding must be recorded and, for cattle and pigs, reported to the relevant authority within the required reporting window. BDE Farm Trac captures the movement data needed for BCMS (cattle), CTS/ScotMoves (Scotland), LIS (sheep in England and Wales), and AML (pig) compliance.</p>
<h3>Recording a movement</h3>
<p>Navigate to <strong>Livestock &amp; Feed Management → Movements</strong> and click <strong>New Movement</strong>. Select the movement type:</p>
<ul>
<li><strong>On — Purchase/Transfer In:</strong> animals arriving from another holding.</li>
<li><strong>Off — Sale/Transfer Out:</strong> animals leaving for sale, slaughter, or another holding.</li>
<li><strong>On — Birth:</strong> home-born animals added to the register.</li>
<li><strong>Off — Death:</strong> animals that have died or been culled on farm.</li>
</ul>
<p>Record the species, number of animals, the origin or destination CPH, the movement date, the vehicle registration, the haulier name, and the AML licence number where applicable. For sheep movements, the flock tag prefix is captured. For cattle, individual ear tag numbers are entered or scanned.</p>
<h3>Reporting deadlines</h3>
<p>Cattle movements must be reported to BCMS within three days of the event. Pig movements must be reported using an eAML2 document within three days. The platform flags outstanding movement records that are approaching or past their reporting deadline with an amber or red badge.</p>
<h3>Linking to sales records</h3>
<p>Off-farm movements can be linked to deadweight kill sheets or mart sale records in the Finance &amp; Business module, creating a complete chain from BCMS movement to settlement document for Red Tractor traceability requirements.</p>`,
  ],

  // 5 — Visitor Logging and Biosecurity Plan
  [
    "How to log farm visitors and maintain a biosecurity plan in BDE Farm Trac to meet Red Tractor and APHA biosecurity requirements.",
    `<h2>Visitor Logging and Biosecurity Plan</h2>
<p>Red Tractor, Lion Quality, and APHA biosecurity guidance all require farms to maintain a record of visitors and a documented biosecurity plan. BDE Farm Trac provides both in the Biosecurity section of your Compliance &amp; Plans module.</p>
<h3>Logging a visitor</h3>
<p>Navigate to <strong>Compliance &amp; Plans → Biosecurity → Visitor Log</strong> and click <strong>Add Visitor</strong>. Record:</p>
<ul>
<li><strong>Name and organisation:</strong> full name and the company or authority they represent.</li>
<li><strong>Purpose of visit:</strong> vet, assessor, contractor, delivery, family, or other.</li>
<li><strong>Date and time in/out:</strong> captured at the point of entry.</li>
<li><strong>Areas accessed:</strong> free text describing which buildings or fields were visited.</li>
<li><strong>Previous farm visit:</strong> toggle and number of days since last farm visit — critical for APHA biosecurity and AI outbreak risk management.</li>
<li><strong>Biosecurity measures observed:</strong> vehicle disinfection, footwear change, protective clothing — tick each measure applied.</li>
</ul>
<h3>Biosecurity plan</h3>
<p>The Biosecurity Plan tab holds your standing biosecurity procedures. Record vehicle disinfection protocols, exclusion zones, clothing requirements, and downtime periods between holdings. The plan document can be printed for display at the farm entrance or attached as a PDF from your Documents module.</p>
<h3>Downtime tracking</h3>
<p>For poultry farms, the Cleanouts tab records the downtime period between flocks. The biosecurity plan specifies your minimum downtime and the system calculates whether the actual downtime met that standard for each house.</p>`,
  ],

  // 6 — Staff Training & Certificates
  [
    "How to record staff qualifications, training events, and certificate expiry dates in BDE Farm Trac to satisfy Red Tractor and FACTS requirements.",
    `<h2>Staff Training & Certificates</h2>
<p>The Staff &amp; Training module maintains a complete competency record for every person on your farm. Red Tractor requires evidence that all operators hold the certificates required for the activities they undertake — spray operators must hold PA1/PA2/PA6, forklift operators must be licensed, and all staff must have received induction and relevant safety training.</p>
<h3>Adding a certificate</h3>
<p>Navigate to <strong>Staff &amp; Training → Certificates</strong> and select the staff member. Click <strong>Add Certificate</strong> and record:</p>
<ul>
<li><strong>Certificate type:</strong> PA1, PA2, PA6, PA6W, FACTS, BASIS, forklift, first aid, chainsaw, ATV, or a custom type.</li>
<li><strong>Issuing body:</strong> Lantra, NPTC, BASIS, or other accrediting organisation.</li>
<li><strong>Certificate number:</strong> the reference printed on the certificate.</li>
<li><strong>Issue date and expiry date.</strong></li>
</ul>
<p>Attach a scan of the certificate using the document attachment feature. The certificate status is shown as green (valid), amber (expiring within 90 days), or red (expired).</p>
<h3>Training events</h3>
<p>One-off training sessions can be recorded separately from certificates — induction sessions, toolbox talks, manual handling awareness, and similar events that do not result in a certificate but still need to be documented for audit purposes.</p>
<h3>Training Competency Matrix</h3>
<p>The Competency Matrix tab shows a grid of staff members against certificate types. Each cell is colour-coded — green (valid), amber (expiring), red (expired or not held). A filter lets you show only spray operator certificates, useful for confirming all operators are compliant before a spray programme begins.</p>
<h3>Expiry alerts</h3>
<p>SMS text alerts and in-platform notifications are sent automatically when a certificate is within 90 days of expiry. The certificate holder and the farm manager both receive the alert.</p>`,
  ],

  // 7 — Inspection Preparation Checklist
  [
    "How to use the Inspections module in BDE Farm Trac to prepare for Red Tractor, APHA, or assurance scheme assessor visits.",
    `<h2>Inspection Preparation Checklist</h2>
<p>The Inspections module provides a structured framework for preparing for and recording the outcome of farm assurance visits, APHA inspections, local authority checks, and other formal assessments. It helps you identify gaps before an assessor arrives and produces a clean evidence summary for them to review.</p>
<h3>Self-assessment checklist</h3>
<p>Navigate to <strong>Inspections → Self Assessment</strong> and select the scheme (Red Tractor Combinable Crops, Red Tractor Beef &amp; Lamb, Red Tractor Dairy, Red Tractor Poultry, Lion Quality, or other). The checklist presents every audit section with a compliant/non-compliant/not applicable toggle and a notes field.</p>
<p>Work through each section before the assessor arrives. The section header turns green when all items are marked compliant, amber for partial, and red for any outstanding non-compliances. The completed checklist can be printed as a pre-inspection document.</p>
<h3>Recording an inspection outcome</h3>
<p>After the visit, record the inspection date, inspecting body, assessor name, overall outcome (Pass, Conditional Pass, Fail), and any non-conformances raised. Each non-conformance has a description, the standard clause it relates to, a corrective action, a responsible person, and a target resolution date.</p>
<h3>Non-conformance tracking</h3>
<p>Outstanding non-conformances appear as action cards on the Inspections page until marked as resolved. Resolution notes and evidence can be attached to each non-conformance. The resolution is timestamped so you can show the assessor that corrective action was taken within the required timeframe.</p>
<h3>Farm assurance certificates</h3>
<p>Upload your Red Tractor, Lion Quality, or other scheme certificates to the Certificates tab. Certificate expiry dates are tracked with amber (90 days) and red (expired) warnings.</p>`,
  ],

  // 8 — Understanding COSHH Requirements
  [
    "How COSHH assessments work in BDE Farm Trac and what information to record for each hazardous substance used on the farm.",
    `<h2>Understanding COSHH Requirements</h2>
<p>The Control of Substances Hazardous to Health Regulations 2002 (COSHH) require employers to assess the risk from every hazardous substance used on the farm and put in place controls to protect workers. BDE Farm Trac's COSHH module makes this straightforward by structuring assessments around each product in your spray catalogue and chemical store.</p>
<h3>Creating a COSHH assessment</h3>
<p>Navigate to <strong>Health, Safety &amp; Risk → COSHH Assessments</strong> and click <strong>New Assessment</strong>. Each assessment captures:</p>
<ul>
<li><strong>Product name and MAPP/HSE number:</strong> linked to your spray product catalogue where possible.</li>
<li><strong>Hazard classification:</strong> irritant, harmful, toxic, corrosive, or environmental hazard — drawn from the product SDS.</li>
<li><strong>Routes of exposure:</strong> inhalation, skin contact, ingestion, or eye contact.</li>
<li><strong>Control measures:</strong> PPE required (gloves, mask, goggles, coverall), ventilation requirements, engineering controls.</li>
<li><strong>Emergency procedures:</strong> first aid measures and spill response.</li>
<li><strong>Assessment date and assessor name:</strong> the person who completed the assessment.</li>
<li><strong>Review date:</strong> COSHH assessments must be reviewed when the substance, process, or worker group changes, and at least every five years.</li>
</ul>
<h3>Linking to spray records</h3>
<p>When a product is linked to a COSHH assessment, the assessment reference is shown on every spray application record using that product. This gives assessors a direct chain from the substance hazard assessment to the field application record.</p>
<h3>PPE requirements</h3>
<p>PPE requirements identified in COSHH assessments feed into the PPE Register in Staff &amp; Training, ensuring that the PPE specified as a control measure is actually issued to the operators who use the substance.</p>`,
  ],

  // 9 — Financial Record Keeping
  [
    "An overview of financial record keeping in BDE Farm Trac, covering purchase orders, grain sales, livestock sales, and input cost logging.",
    `<h2>Financial Record Keeping</h2>
<p>The Finance &amp; Business module covers the procurement and sales records that connect your compliance trail to your business accounts. It is not a full accounting system but is designed to capture the farm-specific financial documents that your accountant or agronomist will need and that Red Tractor auditors expect to see.</p>
<h3>Purchase Orders and procurement</h3>
<p>Raise Purchase Orders against registered suppliers in the Trade Contacts &amp; Stock module. Each PO has auto-generated reference numbers, line items with quantities and prices, a seven-stage status workflow, and a manager approval system for flagged products. Goods Received Notes are raised against open POs to record deliveries and update stock levels.</p>
<h3>Sales records</h3>
<p>The Finance module covers grain trading (spot, forward contract, ex-store), deadweight livestock sales with kill sheet attachment, mart and auction sales, milk statements, poultry batch settlements, egg sales, and direct farm gate sales. Each sale type has specific fields matching the settlement documents your buyer or processor provides.</p>
<h3>Input cost logging</h3>
<p>Log invoice costs by category — feed, seed, fertiliser, agrochemicals, fuel, and sundry — with supplier, VAT treatment, and invoice reference. These feed the gross margin analysis in the Business Reports tab.</p>
<h3>Business reports</h3>
<p>The Reports tab provides a gross margin analysis by crop, a full P&amp;L income statement, and an input cost breakdown by category. Year-on-year comparisons are available for up to five seasons. CSV export and Xero-compatible export are available for handoff to your accountant.</p>`,
  ],

  // 10 — Weather Station Setup
  [
    "How to set up weather stations and vehicle weather devices in BDE Farm Trac, including calibration tracking and live weather fetch.",
    `<h2>Weather Station Setup</h2>
<p>Accurate weather records are a requirement for spray application audit trails — Red Tractor and BASIS both expect temperature, wind speed, and rainfall to be logged with each application. The Weather module lets you register named stations, log manual readings, fetch live conditions automatically, and track device calibration.</p>
<h3>Registering a weather station</h3>
<p>Navigate to <strong>Weather Records → Device Register</strong> and click <strong>Add Device</strong>. Record the device name, manufacturer, model, serial number, installation type (fixed field, vehicle-mounted, or portable), last calibration date, and next calibration due date.</p>
<h3>Logging readings</h3>
<p>Go to <strong>Weather Records → Readings</strong> and click <strong>Add Reading</strong>. Enter the date, time, temperature (°C), rainfall (mm), wind speed (km/h), wind direction, relative humidity (%), and atmospheric pressure. The <strong>Fetch Live</strong> button uses your farm's GPS coordinates to retrieve current conditions from the Open-Meteo free weather service — no API key required.</p>
<h3>Vehicle station readings</h3>
<p>Vehicle-mounted devices are registered with their associated vehicle from the Equipment Register. A vehicle station reading links to both the vehicle (auto-populates the registration) and the device (auto-populates the serial number), providing a complete chain from the calibrated instrument to the logged reading.</p>
<h3>Calibration alerts</h3>
<p>Devices within 30 days of their calibration due date or already overdue are flagged with amber and red status badges on the Device Register. An amber alert banner appears at the top of the Device Register tab listing all devices requiring attention. The register can be printed for inclusion in an audit pack.</p>`,
  ],

  // 11 — Document Management Best Practices
  [
    "How to use the Documents module in BDE Farm Trac to store, organise, and retrieve the documents required for Red Tractor and other assurance audits.",
    `<h2>Document Management Best Practices</h2>
<p>The Documents module is a structured repository for all the farm policy documents, certificates, and reference materials that Red Tractor and other assurance schemes require you to hold and be able to produce at inspection.</p>
<h3>Required document checklist</h3>
<p>The Documents module includes a Red Tractor Required Documents Checklist showing which documents must be held for each scheme standard. Each item in the checklist links to the relevant document category in your repository. Work through the checklist before an inspection to confirm every required document is present and current.</p>
<h3>Uploading documents</h3>
<p>Click <strong>Upload Document</strong> and select the file (PDF, Word, image, or spreadsheet). Assign it a document type (Policy, Certificate, Plan, Risk Assessment, Scheme Document, or Other), a descriptive title, a version number, an issue date, and an optional review or expiry date. Documents approaching their review date are flagged with amber warnings.</p>
<h3>Document categories</h3>
<p>Documents are organised by type to make retrieval fast at audit. Common categories include: Biosecurity Plan, Waste Management Plan, Health and Safety Policy, Risk Assessments, Staff Training Records, Scheme Certificates, COSHH Assessments, and Agri-Environment Agreements.</p>
<h3>Best practice tips</h3>
<ul>
<li>Always assign an expiry or review date so documents do not silently go out of date.</li>
<li>Keep one live version of each policy document — archive superseded versions rather than deleting them, so the review history is retained.</li>
<li>Link certificates to staff records (for training certificates) or equipment records (for NSTS certificates) so they are visible in context as well as in the Documents module.</li>
</ul>`,
  ],

  // 12 — Biofuel / RTFO Compliance Overview
  [
    "An overview of how BDE Farm Trac supports Renewable Transport Fuel Obligation (RTFO) and ISCC biofuel compliance records.",
    `<h2>Biofuel / RTFO Compliance Overview</h2>
<p>The Biofuel / RTFO module supports farms that grow energy crops or supply agricultural waste for biofuel production and need to demonstrate compliance with the Renewable Transport Fuel Obligation (RTFO) Order 2007 and its ISCC (International Sustainability and Carbon Certification) requirements.</p>
<h3>What the module covers</h3>
<ul>
<li><strong>Land eligibility records:</strong> documenting that the land used for energy crop production meets ISCC eligibility criteria — not converted from high carbon stock land since January 2008, not peatland, protected area, or continuously forested land.</li>
<li><strong>Delivery records:</strong> logging biofuel feedstock deliveries with mass balance (tonnes), moisture content, and energy content.</li>
<li><strong>GHG savings calculations:</strong> recording the greenhouse gas savings achieved versus the fossil fuel comparator, using the RTFO default values or actual measured values where available.</li>
<li><strong>ISCC certification tracking:</strong> storing certification body, certificate number, scope, issue date, and expiry date with urgency warnings at 90 and 30 days.</li>
</ul>
<h3>Who needs this module</h3>
<p>Any farm supplying bioethanol feedstock (wheat, sugar beet, maize), biodiesel feedstock (oilseed rape, used cooking oil), or biomethane feedstock (agricultural slurries or crops) to a fuel supplier under the RTFO will need to provide GHG savings evidence to their buyer. This module provides the documentation trail required for ISCC chain-of-custody audits.</p>
<h3>Linking to existing records</h3>
<p>Field-level crop records from the Field &amp; Crop Management module can be referenced in land eligibility declarations, and fuel delivery records from the Fuel &amp; Energy module can be cross-referenced for on-farm consumption figures.</p>`,
  ],

  // 13 — ISCC Certification and Land Eligibility
  [
    "How to record ISCC certification details and land eligibility declarations in BDE Farm Trac for RTFO biofuel compliance.",
    `<h2>ISCC Certification and Land Eligibility</h2>
<p>ISCC (International Sustainability and Carbon Certification) is the most widely used certification scheme for demonstrating compliance with the UK Renewable Transport Fuel Obligation. Farms supplying biofuel feedstock to obligated fuel suppliers must hold a valid ISCC certificate and be able to show that all land used for feedstock production meets the eligibility criteria.</p>
<h3>Recording your ISCC certificate</h3>
<p>Navigate to <strong>Biofuel / RTFO → Certification</strong> and click <strong>Add Certificate</strong>. Record the certifying body (typically an ISCC-approved auditor), your certificate number, the certificate scope (which commodities and processes are covered), the issue date, and the expiry date. Attach the certificate document. Expiry warnings appear at 90 and 30 days before the certificate lapses.</p>
<h3>Land eligibility declarations</h3>
<p>For each parcel of land used for biofuel feedstock production, a land eligibility declaration must confirm that the land:</p>
<ul>
<li>Was not converted from primary forest, wetland, or peatland after January 2008.</li>
<li>Is not a protected area (designated under national or EU law for nature conservation).</li>
<li>Does not have a high biodiversity value (natural grassland, undisturbed forest).</li>
<li>Does not have a high carbon stock (continuously forested land, peatland).</li>
</ul>
<p>Record each declaration with the field parcel reference, declaration date, and the declarant's name. Attach any supporting evidence such as historical land use records or satellite imagery assessments.</p>
<h3>Annual audit preparation</h3>
<p>ISCC audits typically occur annually. Use the Biofuel / RTFO module to compile your land eligibility records, delivery records, and GHG savings calculations into a single evidence pack for your auditor.</p>`,
  ],

  // 14 — Recording Biofuel Deliveries and GHG Savings
  [
    "How to record biofuel feedstock deliveries and greenhouse gas savings calculations in BDE Farm Trac for RTFO reporting.",
    `<h2>Recording Biofuel Deliveries and GHG Savings</h2>
<p>For each delivery of biofuel feedstock from your farm to a processor or fuel supplier, you must provide a sustainability declaration that includes the mass of feedstock delivered, the crop type, the country of origin, and a greenhouse gas (GHG) emissions calculation showing the savings achieved versus the fossil fuel comparator.</p>
<h3>Recording a delivery</h3>
<p>Navigate to <strong>Biofuel / RTFO → Deliveries</strong> and click <strong>New Delivery</strong>. Complete the following fields:</p>
<ul>
<li><strong>Delivery date and reference:</strong> the date the feedstock was collected or delivered and the buyer's purchase reference.</li>
<li><strong>Commodity and variety:</strong> e.g. Wheat — KWS Extase, Oilseed Rape — DK Exstorm.</li>
<li><strong>Mass delivered (tonnes):</strong> from the weighbridge ticket. Attach the ticket as a document.</li>
<li><strong>Moisture and dry matter content (%).</strong></li>
<li><strong>Energy content (MJ/kg):</strong> use the RTFO default value for the commodity or a tested value from your laboratory.</li>
<li><strong>Buyer and destination facility.</strong></li>
</ul>
<h3>GHG savings calculation</h3>
<p>For each delivery, record the greenhouse gas emissions in gCO₂eq/MJ for the full production chain — cultivation, fertiliser production, processing, and transport. The platform compares this to the fossil fuel comparator (94 gCO₂eq/MJ for petrol/diesel) and calculates the GHG saving percentage. The RTFO minimum saving threshold is 65% for new installations and 50% for existing ones.</p>`,
  ],

  // 15 — NVZ Rules, Applications and Risk Assessments
  [
    "How to record nitrogen fertiliser applications, risk assessments, and closed period compliance in the NVZ module.",
    `<h2>NVZ Rules, Applications and Risk Assessments</h2>
<p>If any of your fields fall within a Nitrate Vulnerable Zone (NVZ), you must follow the Nitrates Action Programme regulations — keeping records of all nitrogen applications, observing closed periods, and staying within field-level nitrogen limits. BDE Farm Trac's NVZ module manages all of this in one place.</p>
<h3>Nitrogen application records</h3>
<p>Navigate to <strong>Nutrient Management → NVZ Applications</strong> and log every application of manufactured nitrogen fertiliser or organic manure to NVZ fields. Each record captures: field, date, material type (manufactured fertiliser, slurry, farmyard manure, sewage sludge), nitrogen content (kg N/tonne or kg N/m³), quantity applied, and calculated nitrogen applied (kg N/ha).</p>
<h3>Field nitrogen limits</h3>
<p>DEFRA sets a maximum total nitrogen limit per field based on soil type and the crop grown. The NVZ Budget Calculator shows the remaining budget for each field — the limit minus all applications logged to date. Fields approaching or exceeding their limit are highlighted in amber or red.</p>
<h3>Closed period records</h3>
<p>NVZ closed periods prohibit the spreading of certain materials during winter months. The platform displays a countdown to the closed period start date and a countdown to the end date. Applications logged during a closed period are flagged as a non-compliance.</p>
<h3>Risk assessments</h3>
<p>Before spreading on steeply sloping ground, near water, or in wet conditions, a risk assessment must be completed. Record the field, the spreading date, the conditions, and the control measures applied (e.g. application equipment, rate reduction, spread direction). These records satisfy the field risk assessment requirement of the Nitrates Regulations.</p>`,
  ],

  // 16 — Nutrient Management Planning (NMP)
  [
    "How to record and store Nutrient Management Plans (NMPs) in BDE Farm Trac, including plan details, review dates, and soil analysis linkage.",
    `<h2>Nutrient Management Planning (NMP)</h2>
<p>A Nutrient Management Plan (NMP) is a documented strategy for matching nutrient applications to crop requirements, taking account of available nutrients from soil, previous crops, and organic manures. It is required for farms in NVZs under the Nitrates Action Programme and is increasingly expected as evidence for Red Tractor, SFI, and agri-environment scheme compliance.</p>
<h3>Recording an NMP</h3>
<p>Navigate to <strong>Nutrient Management → Plans</strong> and click <strong>New Plan</strong>. Record the plan period (typically a crop year), the agronomist or FACTS adviser who prepared the plan, their FACTS qualification number, the plan preparation date, and the next review date. Attach the full NMP document as a PDF.</p>
<h3>Plan contents</h3>
<p>A compliant NMP should cover:</p>
<ul>
<li>Field-by-field soil analysis results (P, K, Mg, pH) and soil index.</li>
<li>Planned crops and expected yields for the coming season.</li>
<li>Available nitrogen from soil organic matter, previous crop, and organic manures.</li>
<li>Recommended nitrogen, phosphate, potash, and lime applications per field.</li>
<li>Organic manure plan — type, timing, and quantities of any slurry, FYM, or digestate applications.</li>
</ul>
<h3>Linking to soil samples</h3>
<p>Soil sample results recorded in the Soil Sampling module are automatically available to reference in your NMP. The soil index (0–4) for P, K, and Mg is shown alongside each field's NMP recommendations for cross-reference.</p>
<h3>Review and update</h3>
<p>NMPs should be reviewed annually and whenever there is a significant change in cropping or management. Record each review as a new plan version — the previous version is retained as part of the permanent audit trail.</p>`,
  ],

  // 17 — Soil Testing and Sampling Records
  [
    "How to record soil samples and test results in BDE Farm Trac, including sampling references, laboratory linkage, and index tracking.",
    `<h2>Soil Testing and Sampling Records</h2>
<p>Regular soil sampling is the foundation of a sound nutrient management programme. Red Tractor requires a documented soil sampling history; the NVZ regulations require soil pH records. BDE Farm Trac's Soil Sample Register provides a structured home for all sample records and their laboratory results.</p>
<h3>Recording a sample</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Soil Samples</strong> and click <strong>Add Sample</strong>. Each record captures:</p>
<ul>
<li><strong>Sample reference:</strong> your own reference number or the laboratory's unique sample ID.</li>
<li><strong>Field and sampling date.</strong></li>
<li><strong>Sampling depth (cm):</strong> typically 0–15 cm for arable soils or 0–7.5 cm for grassland.</li>
<li><strong>Laboratory:</strong> selected from your registered UKAS-accredited laboratory list in Trade Contacts &amp; Stock.</li>
<li><strong>Results:</strong> pH, P index (0–4), K index (0–4), Mg index (0–4), % organic matter, and any trace elements tested.</li>
<li><strong>Status:</strong> Awaiting Results, Results Received, or Actioned.</li>
</ul>
<h3>Soil index tracking</h3>
<p>The current P, K, Mg, and pH index for each field is shown on the field detail card. Fields at Index 0 or Index 4+ are highlighted as requiring attention in the Nutrient Management dashboard.</p>
<h3>Sampling frequency</h3>
<p>Red Tractor and FACTS guidance recommend sampling at least every four years on arable land and every five years on grassland. The sample date and the calculated next-due date are displayed on each field's record so overdue fields are visible at a glance.</p>`,
  ],

  // 18 — Harvest Records and Yield Tracking
  [
    "How to record grain and combinable crop harvest records in BDE Farm Trac, including yield per field, moisture, and grain position tracking.",
    `<h2>Harvest Records and Yield Tracking</h2>
<p>Harvest records provide the link between the field operations that produced the crop and the grain position and sales records that account for its disposal. BDE Farm Trac captures yield, quality, and storage data at harvest and connects it directly to your grain trading records.</p>
<h3>Recording a harvest</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Harvest Records</strong> and click <strong>Add Harvest</strong>. For each field (or field section) harvested, record:</p>
<ul>
<li><strong>Crop and variety.</strong></li>
<li><strong>Harvest date.</strong></li>
<li><strong>Area harvested (ha).</strong></li>
<li><strong>Gross yield (tonnes).</strong></li>
<li><strong>Moisture at harvest (%).</strong></li>
<li><strong>Estimated dry yield (tonnes):</strong> calculated automatically from gross yield and moisture.</li>
<li><strong>Destination store:</strong> linked to a storage location in the Grain &amp; Crop Storage module.</li>
<li><strong>Machine used.</strong></li>
</ul>
<h3>Grain position</h3>
<p>Once a harvest record is saved, the grain enters the Grain Position tracker. This shows total harvested, total moved out (sales and transfers), and current balance in store for each commodity. The balance updates in real time as stock movements are logged.</p>
<h3>Pre-harvest interval check</h3>
<p>The harvest record links to spray application records for the same field. If any application was made within the product's PHI, the record shows a warning that the pre-harvest interval may not have been met — this is a critical food safety check for fresh produce and malting barley crops.</p>`,
  ],

  // 19 — Livestock Medicine Records and Withdrawal Periods
  [
    "How to record veterinary medicine treatments in BDE Farm Trac, including withdrawal periods, batch numbers, and Red Tractor medicine book requirements.",
    `<h2>Livestock Medicine Records and Withdrawal Periods</h2>
<p>Medicine records are one of the most closely examined elements of a livestock farm assurance audit. BDE Farm Trac captures every treatment in a structured record that satisfies the Red Tractor medicine book requirements, and automatically calculates withdrawal periods to protect food safety.</p>
<h3>Recording a treatment</h3>
<p>Navigate to <strong>Livestock &amp; Feed Management → Medicines</strong> and click <strong>New Treatment</strong>. Each record captures:</p>
<ul>
<li><strong>Animal or group:</strong> individual ear tag (from the Individual Animal Register) or a group/pen description.</li>
<li><strong>Medicine name and batch number:</strong> the batch number must match the GRN receipt in Trade Contacts &amp; Stock for full batch traceability.</li>
<li><strong>Active ingredient and quantity administered.</strong></li>
<li><strong>Route of administration:</strong> oral, injection (IM/IV/SC), topical, or other.</li>
<li><strong>Treatment date and end date (for course treatments).</strong></li>
<li><strong>Administering person and veterinary authorisation reference.</strong></li>
<li><strong>Withdrawal period (days):</strong> pre-filled from the product's label for meat and milk.</li>
<li><strong>Withdrawal end date:</strong> calculated automatically. Animals cannot be sold for slaughter or milk supplied before this date.</li>
</ul>
<h3>Withdrawal period alerts</h3>
<p>Animals with an active withdrawal period are flagged in the Individual Animal Register with an amber badge. An SMS alert is sent when the withdrawal period is within three days of ending so movements and milk supply can be reinstated promptly.</p>
<h3>Vet authorisation</h3>
<p>For medicines used under a Veterinary Written Direction (VWD) or Cascade prescription, attach the vet's written authorisation to the treatment record. The Vet Prescriptions tab provides a dedicated register for all outstanding prescriptions with their expiry dates.</p>`,
  ],

  // 20 — Pest Control and Cleaning Records
  [
    "How to record pest control visits, rodenticide bait records, and farm cleaning events in BDE Farm Trac for Red Tractor and food safety audits.",
    `<h2>Pest Control and Cleaning Records</h2>
<p>Pest control and scheduled cleaning records are required by Red Tractor for combinable crops, poultry, and fresh produce schemes, and by food retailers for farm assurance. BDE Farm Trac's Biosecurity module provides structured records for both.</p>
<h3>Pest control visits</h3>
<p>Navigate to <strong>Compliance &amp; Plans → Pest Control</strong> and log each pest control visit or self-managed baiting programme. Record the visit date, contractor name (or farm staff if self-managed), target pest (rats, mice, rabbits, birds, or insects), control method (rodenticide bait, traps, shooting, or other), bait type and active ingredient, bait station locations and quantities placed, and any findings or evidence of activity.</p>
<h3>Rodenticide records</h3>
<p>For rodenticide programmes, Red Tractor requires a bait point map and usage records. Bait station identifiers can be entered as free text or linked to the Farm Buildings &amp; Areas Register. Record the quantity of bait placed and collected at each visit — this demonstrates responsible rodenticide use under the Campaign for Responsible Rodenticide Use (CRRU) guidelines.</p>
<h3>Cleaning and disinfection records</h3>
<p>Scheduled cleaning events for stores, handling equipment, vehicles, and farm buildings are logged separately. Each record captures the area cleaned, the cleaning date, the disinfectant product used, dilution rate, the person responsible, and whether the clean was pre-or post-harvest or pre- or post-crop. Photo attachments can be added as evidence.</p>`,
  ],

  // 21 — Using the Mobile App for Field Recording
  [
    "An overview of the BDE Farm Trac mobile app and how to use it for recording field operations, spray applications, livestock events, and viticulture records offline.",
    `<h2>Using the Mobile App for Field Recording</h2>
<p>The BDE Farm Trac mobile app (available on iOS and Android) extends the platform into the field, allowing records to be created at the point of activity rather than re-entered from paper notes later. The app works fully offline — records created without a signal are stored locally and sync automatically when connectivity is restored.</p>
<h3>Getting started</h3>
<p>Download the app from the App Store or Google Play and sign in with your BDE Farm Trac account. The app detects your active farm and downloads reference data — fields, staff, animals, flocks, vine blocks, and stock products — for offline use. Pull down on any screen to refresh the cached reference data.</p>
<h3>What you can record</h3>
<ul>
<li>Spray applications (field, product, dose, operator, weather conditions)</li>
<li>Livestock movements, medicine treatments, and mortality records</li>
<li>Environmental and biosecurity logs (poultry, herd health)</li>
<li>Viticulture records (scouting, phenology, operations, harvest)</li>
<li>Staff timesheets and leave requests</li>
<li>Grain sales, livestock sales, and Purchase Orders</li>
<li>Task completion and status updates</li>
<li>QR code scanning for fields, animals, and storage locations</li>
</ul>
<h3>Offline behaviour</h3>
<p>Reference pickers (field list, animal register, staff list, vine block picker) all work from the locally cached data when offline. Records created offline are queued in the Pending Sync tray, visible in the top toolbar as a badge count. Once connectivity is restored, records are uploaded automatically in the background. The sync status of each record is shown in the record list.</p>`,
  ],

  // 22 — Livestock Movement Reporting: Scotland, Wales and Northern Ireland
  [
    "How livestock movement reporting requirements differ in Scotland, Wales, and Northern Ireland, and how BDE Farm Trac handles cross-border recording.",
    `<h2>Livestock Movement Reporting: Scotland, Wales and Northern Ireland</h2>
<p>While the core livestock movement data is the same across the UK, the reporting systems and regulatory bodies differ between the four nations. BDE Farm Trac records movements in a single format and the data can be used to complete reports to any of the relevant authorities.</p>
<h3>Scotland — ScotMoves+</h3>
<p>In Scotland, cattle movements are reported to ScotEID via the ScotMoves+ system. The BDE Farm Trac movement record captures all the data fields required for a ScotMoves+ submission — CPH numbers, ear tag lists, movement dates, haulier details, and AML reference numbers. Sheep movements in Scotland are reported to ScotMoves via the same system. Records in BDE Farm Trac can be exported to assist with manual ScotMoves entry.</p>
<h3>Wales — BCMS and EIDCymru</h3>
<p>Cattle movements in Wales are reported to BCMS in the same way as England. Sheep movements are managed through EIDCymru. The BDE Farm Trac sheep movement record captures flock number, animal count, movement date, source and destination CPH, and the Electronic Identification tag prefix required for EIDCymru submissions.</p>
<h3>Northern Ireland — APHIS</h3>
<p>In Northern Ireland, cattle movements are reported to DAERA via the APHIS system. BDE Farm Trac captures the herd number, individual ear tags, and movement details needed for APHIS submissions. Sheep are recorded through the Northern Ireland Sheep and Goat System (NISGS).</p>
<h3>General approach</h3>
<p>BDE Farm Trac records do not automatically submit to any authority system — they provide a complete, auditable record of every movement that you can use to check and confirm your authority submissions. Cross-reference the BDE Farm Trac movement log with your authority portal to confirm all movements have been reported within the required deadline.</p>`,
  ],

  // 23 — Analytical Dashboards and Compliance Snapshots
  [
    "How to use the BDE Farm Trac compliance dashboard, module snapshots, and analytics widgets to monitor your farm's compliance status at a glance.",
    `<h2>Analytical Dashboards and Compliance Snapshots</h2>
<p>The BDE Farm Trac dashboard gives you a real-time view of your farm's compliance status across all active modules. Rather than checking each module individually, the dashboard aggregates key indicators into a single overview so you can see where action is needed at a glance.</p>
<h3>The main compliance dashboard</h3>
<p>The main dashboard shows compliance status cards for each active module — spray records, livestock movements, medicine withdrawal periods, staff certificates, NVZ applications, and more. Each card shows the number of records requiring attention (overdue movements, expiring certificates, outstanding tasks) with colour-coded traffic-light indicators.</p>
<h3>Module snapshots</h3>
<p>Each module has its own summary view at the top of its page — typically four to six summary cards showing totals, recent activity, and outstanding items. For example, the Livestock page shows total animals on farm, recent movements, active withdrawal periods, and overdue health plan reviews.</p>
<h3>Analytics and charts</h3>
<p>Where data is available, trend charts show performance over time — DLWG tracking for beef and sheep, lay rate trends for poultry, rainfall and temperature patterns from weather records. These charts help identify performance issues early.</p>
<h3>Group dashboard</h3>
<p>For multi-farm accounts, the Group Dashboard shows a consolidated compliance status across all registered holdings. Each farm is shown as a card with its overall status and the count of outstanding items per category. Click through to any farm's individual dashboard from the group view.</p>`,
  ],

  // 24 — Sharing Records with Advisors and Inspectors
  [
    "How to give advisors, vets, and inspectors access to your BDE Farm Trac records using permanent advisor accounts and time-limited inspection sessions.",
    `<h2>Sharing Records with Advisors and Inspectors</h2>
<p>BDE Farm Trac provides two mechanisms for giving external parties access to your farm records: permanent advisor accounts for ongoing relationships with agronomists, vets, and FACTS advisers, and time-limited inspection sessions for Red Tractor assessors and auditors visiting your farm.</p>
<h3>Permanent advisor accounts</h3>
<p>Navigate to <strong>Settings → Advisor Access</strong> and click <strong>Invite Advisor</strong>. Enter the advisor's email address and name. Use the module scope selector (21 modules) to grant access only to the sections relevant to their role — an agronomist might need Sprays &amp; Inputs, Field &amp; Crop Management, and Soil Management, while a vet might need Livestock &amp; Feed Management and Medicine Records only. The advisor logs in with their own credentials and can only see the modules you have granted.</p>
<h3>Time-limited inspection sessions</h3>
<p>For assessor visits, generate a secure, expiring access link from <strong>Settings → Inspection Access</strong>. Set the expiry date (the visit date plus one day is typical), select the modules the assessor will need to review, and share the link. The link expires automatically after the set time. A full access log records every login, the timestamp, and which records were viewed during the session.</p>
<h3>Access log</h3>
<p>Every advisor and inspector login is recorded in a permanent access log with the date, time, and the name of the accessor. This provides an auditable trail of who has seen your farm records, satisfying GDPR data access obligations and Red Tractor requirements for record security.</p>`,
  ],

  // 25 — Logging Field Operations
  [
    "How to record cultivations, drilling, rolling, and other field operations in BDE Farm Trac to support your field management and agronomic records.",
    `<h2>Logging Field Operations</h2>
<p>The Field Operations log captures all mechanical operations carried out on each field — cultivations, drilling, rolling, inter-row hoeing, and other agronomic work. These records are used in gross margin analysis, support agronomic review, and provide the complete field history that Red Tractor assessors and LEAF auditors expect to see.</p>
<h3>Recording an operation</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Field Operations</strong> and click <strong>New Operation</strong>. Each record captures:</p>
<ul>
<li><strong>Operation type:</strong> Ploughing, Deep Cultivation, Subsoiling, Power Harrowing, Press, Drilling, Rolling, Inter-row Hoe, Desiccation, or Other.</li>
<li><strong>Field and area worked (ha).</strong></li>
<li><strong>Date and operator.</strong></li>
<li><strong>Machine used:</strong> selected from your Equipment Register.</li>
<li><strong>Working depth (cm):</strong> for cultivations.</li>
<li><strong>Seed variety and seed rate (kg/ha):</strong> for drilling operations.</li>
<li><strong>Notes.</strong></li>
</ul>
<h3>Linking to crop records</h3>
<p>Drilling operations are linked to the field's crop record for the season, confirming which variety was sown, at what seed rate, and on what date. This satisfies the crop record requirements for Red Tractor Combinable Crops and LEAF.</p>
<h3>Labour and cost tracking</h3>
<p>Operator time and contractor costs can be recorded against each operation. These feed the field gross margin analysis in the Finance &amp; Business module, letting you see the true cost of production by field and crop.</p>`,
  ],

  // 26 — Logging Animal Mortality Records
  [
    "How to record on-farm animal deaths in BDE Farm Trac, including cause, disposal method, and APHA reporting requirements.",
    `<h2>Logging Animal Mortality Records</h2>
<p>Every animal that dies on farm must be recorded — the cause of death, the disposal method, and the contractor or knacker involved. Red Tractor, APHA, and the Animal By-Products Regulations all require mortality records to be maintained. BDE Farm Trac provides a four-stage disposal tracking workflow to ensure every mortality is fully documented.</p>
<h3>Recording a mortality</h3>
<p>Navigate to <strong>Livestock &amp; Feed Management → Mortality Records</strong> and click <strong>New Mortality</strong>. Record:</p>
<ul>
<li><strong>Animal:</strong> individual ear tag (for tagged animals) or a group/cohort description.</li>
<li><strong>Date of death.</strong></li>
<li><strong>Cause of death:</strong> select from a list or enter as free text. For suspected notifiable disease, a red advisory banner appears prompting APHA contact.</li>
<li><strong>Vet attendance:</strong> toggle and vet name if a vet attended.</li>
<li><strong>Post-mortem carried out:</strong> toggle and results.</li>
</ul>
<h3>Disposal tracking</h3>
<p>The four disposal stages are: (1) Carcass collected — record the collection date, contractor name, and approval number; (2) Route confirmed — knacker, hunt kennel, incinerator, composting, or on-farm burial (where permitted); (3) Documentation received — waybill or receipt number; (4) Closed — the record is complete.</p>
<h3>BCMS notification</h3>
<p>For cattle deaths, the BCMS must be notified within seven days. The mortality record flags when this deadline is approaching. Individual animals marked as deceased in the Mortality module are automatically flagged in the Individual Animal Register.</p>`,
  ],

  // 27 — Feed Records and Traceability
  [
    "How to record feed deliveries, medicated feed, and feed traceability in BDE Farm Trac to meet UFAS/FEMAS and Red Tractor requirements.",
    `<h2>Feed Records and Traceability</h2>
<p>Feed records are a core Red Tractor requirement for all livestock enterprises. They provide traceability from the feed manufacturer or merchant to the animal, and are the primary evidence that only legally permitted feed materials have been used. BDE Farm Trac's Feed Management module captures UFAS/FEMAS-compliant feed delivery records with full traceability.</p>
<h3>Recording a feed delivery</h3>
<p>Navigate to <strong>Feed Management → Deliveries</strong> and click <strong>New Delivery</strong>. Each record captures:</p>
<ul>
<li><strong>Feed type and description:</strong> compound feed, straights, minerals, premix.</li>
<li><strong>Supplier:</strong> selected from your UFAS/FEMAS-accredited supplier list. The supplier's certification status and expiry date are shown.</li>
<li><strong>Delivery date and quantity (tonnes).</strong></li>
<li><strong>Batch number and delivery note reference:</strong> the batch number links forward to any medicated feed withdrawal tracking records.</li>
<li><strong>Assigned species and group.</strong></li>
</ul>
<h3>Medicated feed</h3>
<p>If the delivered feed contains a licensed additive (coccidiostat, zinc oxide at therapeutic level, or other permitted additive), toggle the Medicated Feed switch. The active ingredient, concentration, and withdrawal period are captured. The platform calculates the clearance date and flags animals fed medicated feed with an active withdrawal status in their records.</p>
<h3>Feed Contingency Plan</h3>
<p>The Feed Contingency Plan tab holds your documented plan for what to do if your primary feed supplier is unable to deliver — alternative suppliers, emergency contact details, and minimum stock level policy. Red Tractor requires this plan to be documented and reviewed annually.</p>`,
  ],

  // 28 — Water Quality Testing Records
  [
    "How to record water quality test results in BDE Farm Trac, including livestock drinking water tests and irrigation water tests for fresh produce.",
    `<h2>Water Quality Testing Records</h2>
<p>Clean, tested water is a legal requirement for livestock welfare and a food safety obligation for fresh produce irrigation. Red Tractor, Lion Quality, and GlobalG.A.P. all require documented water quality test results. BDE Farm Trac records tests from UKAS-accredited laboratories alongside the water source and sample details.</p>
<h3>Recording a water test</h3>
<p>Navigate to <strong>Livestock &amp; Feed Management → Water Quality</strong> (or <strong>Fresh Produce → Water Tests</strong> for irrigation water) and click <strong>New Test Record</strong>. Record:</p>
<ul>
<li><strong>Sample date and sample location:</strong> the water source tested (borehole, river, reservoir, mains supply).</li>
<li><strong>Laboratory:</strong> selected from your registered UKAS laboratory list.</li>
<li><strong>Parameters tested:</strong> total coliforms, E. coli, nitrates, pH, hardness, and any other parameters on the test certificate.</li>
<li><strong>Results and pass/fail status:</strong> compared against the Drinking Water Inspectorate (DWI) standards for livestock water and EUREPGAP / GlobalG.A.P. limits for irrigation water.</li>
<li><strong>Actions taken:</strong> if a test fails, record the corrective action — filter replacement, UV treatment, mains supply switch, or other response.</li>
</ul>
<h3>Test frequency</h3>
<p>Red Tractor guidance recommends annual testing of all livestock water sources. Fresh produce irrigation water should be tested at the frequency specified by your assurance scheme, typically at the start of the irrigation season and after any contamination event. Overdue tests are flagged on the Water Quality dashboard card.</p>`,
  ],

  // 29 — Environmental Management — Features, Schemes & Management Events
  [
    "How the Environmental module in BDE Farm Trac captures agri-environment scheme records, SFI actions, and farm environmental management events.",
    `<h2>Environmental Management — Features, Schemes & Management Events</h2>
<p>The Environmental module covers all aspects of your farm's agri-environment obligations — Sustainable Farming Incentive (SFI) actions, Countryside Stewardship agreements, environmental feature management, and farm biodiversity records. It provides the evidence trail that Natural England, Rural Payments Agency, and scheme inspectors require.</p>
<h3>Agri-environment agreements</h3>
<p>Navigate to <strong>Environmental → Agreements</strong> to record your current agri-environment agreement details: scheme name, agreement reference, start and end date, total annual payment, and the options included. Each option is listed with its required management and the area or quantity committed.</p>
<h3>SFI actions</h3>
<p>SFI actions are recorded individually — each action captures the action code, the field or area it applies to, the start date, and the completion status. Evidence attachments (photographs, GPS measurements) can be added to each action. The action log provides a year-by-year record of what was done and when, ready for an RPA spot-check.</p>
<h3>Habitat and feature management</h3>
<p>Log management events for hedgerows, field margins, ponds, woodland, and other habitat features — cutting dates, tree planting, margin establishment, pond restoration. Each event links to the relevant agri-environment option to demonstrate the required management was carried out at the right time.</p>
<h3>Fly-tipping and encampments</h3>
<p>Fly-tipping incidents and unauthorised encampments can be logged with photographs, authority report references, and resolution status. These records support insurance claims and local authority enforcement actions.</p>`,
  ],

  // 30 — Field Inspections — Logging, Action Flags & Resolution Tracking
  [
    "How to record field-level inspections, raise action flags for non-compliant findings, and track resolution in BDE Farm Trac.",
    `<h2>Field Inspections — Logging, Action Flags & Resolution Tracking</h2>
<p>Field inspections — walk-over surveys, formal assurance inspections, APHA visits, and local authority checks — all generate findings that need to be documented, acted on, and closed out. BDE Farm Trac's Inspections module provides a structured workflow for all of these.</p>
<h3>Logging an inspection</h3>
<p>Navigate to <strong>Inspections → Field Inspections</strong> and click <strong>New Inspection</strong>. Record the inspection type, date, inspector name and organisation, the field or area inspected, and a summary of findings. Attach photographs or documents as evidence.</p>
<h3>Action flags</h3>
<p>For any non-compliant or concerning finding, raise an action flag. Each flag captures the issue description, the standard or regulation it relates to, the severity (advisory, minor non-conformance, major non-conformance), the responsible person assigned to resolve it, and the target resolution date.</p>
<h3>Resolution tracking</h3>
<p>Action flags remain open on the Inspections dashboard until marked as resolved. When resolving, record the corrective action taken, the date of resolution, and any supporting evidence. The resolution is timestamped and attributed to the person who closed it, providing a complete before-and-after audit trail.</p>
<h3>Non-conformance register</h3>
<p>All open non-conformances across all inspections are visible in the Non-Conformance Register tab. Filter by severity, responsible person, or overdue status to prioritise the most urgent items. The register can be exported to CSV for review at management meetings or for submission to your assurance body.</p>`,
  ],

  // 31 — Farm Buildings & Areas Registry
  [
    "How to register farm buildings and operational areas in BDE Farm Trac and link them to biosecurity, pest control, and operational records.",
    `<h2>Farm Buildings & Areas Registry</h2>
<p>The Farm Buildings &amp; Areas Registry is a named list of all structures and operational zones on your holding — livestock buildings, grain stores, chemical stores, machinery sheds, poultry houses, and other areas. Registering buildings and areas creates a consistent reference that other modules use to link records to specific locations.</p>
<h3>Adding a building or area</h3>
<p>Navigate to <strong>Settings → Farm Buildings &amp; Areas</strong> and click <strong>Add Building</strong>. Record the name, type (livestock building, grain store, chemical store, machinery shed, poultry house, processing facility, or other), and an optional grid reference or description of the location. Each building or area receives a unique identifier that appears in pickers across the platform.</p>
<h3>How buildings are used across the platform</h3>
<ul>
<li><strong>Biosecurity &amp; pest control:</strong> bait station locations reference registered buildings.</li>
<li><strong>Poultry production:</strong> flocks and flock placements are assigned to a registered house.</li>
<li><strong>Livestock movements:</strong> animals are recorded as housed in registered buildings for winter housing records.</li>
<li><strong>Slurry and manure:</strong> slurry stores reference registered locations for capacity and emptying records.</li>
<li><strong>Grain storage:</strong> storage locations in the Grain &amp; Crop Storage module are associated with registered buildings.</li>
<li><strong>QR code labels:</strong> each building can have a printed QR code for rapid mobile scanning.</li>
</ul>
<h3>Deactivating buildings</h3>
<p>Buildings that are no longer in use can be marked as inactive, removing them from pickers while retaining all historical records that referenced them.</p>`,
  ],

  // 32 — Understanding Business Reports
  [
    "How to use BDE Farm Trac's business reporting tools, including gross margin analysis, P&L statements, and AHDB benchmarking panels.",
    `<h2>Understanding Business Reports</h2>
<p>The Business Reports section of the Finance &amp; Business module turns your farm's operational records into financial performance summaries. It covers gross margin analysis by crop and enterprise, a full profit and loss income statement, and a benchmarking panel comparing your performance against AHDB and Andersons industry standards.</p>
<h3>Gross margin analysis</h3>
<p>Navigate to <strong>Finance &amp; Business → Reports → Gross Margin</strong>. Select the crop year. The analysis calculates output (grain sales + any in-store valuation) minus variable costs (seed, fertiliser, agrochemicals, drying, levies) per hectare for each combinable crop. A side-by-side crop comparison shows which crops are delivering the best margin.</p>
<h3>Profit and loss statement</h3>
<p>The P&amp;L tab aggregates all sales (grain, livestock, milk, direct sales) as income and all input costs (feed, seed, fertiliser, fuel, labour, vet costs, machinery) as expenditure. The net result is your farm's operating profit or loss for the selected period. This can be exported to CSV or in Xero-compatible format for your accountant.</p>
<h3>Benchmarking panel</h3>
<p>The Benchmarking Panel compares your gross margin per hectare, cost of production, and overhead cost per hectare against AHDB Farm Business Survey top-third, average, and bottom-third performance bands. Your farm's figure is shown alongside the benchmark, colour-coded to indicate where you sit in the distribution. Benchmarks are updated annually when AHDB publishes new data.</p>`,
  ],

  // 33 — SMS Text Alerts — Setup, Who Receives Them & Opting In
  [
    "How to configure SMS text alerts in BDE Farm Trac, including who receives alerts, what triggers them, and how to opt individual users in or out.",
    `<h2>SMS Text Alerts — Setup, Who Receives Them & Opting In</h2>
<p>BDE Farm Trac's SMS Text Alerts module sends instant text messages to opted-in farm users when critical compliance events occur. This ensures important alerts reach people even when they are away from a computer or do not have the mobile app open.</p>
<h3>What triggers an SMS alert</h3>
<ul>
<li>Livestock movement reporting deadlines approaching (BCMS, eAML2)</li>
<li>Medicine withdrawal periods ending within three days</li>
<li>Staff certificates expiring within 90 days</li>
<li>Water quality test failures</li>
<li>Overdue NVZ applications or closed period breaches</li>
<li>Farm assurance certificate expiry warnings</li>
<li>Task assignments (the assigned staff member receives an SMS)</li>
<li>Notifiable disease suspicions (critical APHA alerts)</li>
<li>High-pressure disease scouting findings in the Viticulture module</li>
</ul>
<h3>Opting in</h3>
<p>Navigate to <strong>Settings → SMS Alerts</strong>. Each farm user must opt in individually by entering and verifying their UK mobile number. Only verified numbers receive SMS alerts — this prevents alerts being sent to wrong numbers.</p>
<h3>Who receives which alerts</h3>
<p>Module-level alerts (certificate expiry, movement deadlines) are sent to all opted-in managers on the account. Task assignment alerts go only to the person assigned the task. Critical disease alerts (APHA notification triggers) go to all opted-in users.</p>
<h3>Push notifications</h3>
<p>Staff who have the mobile app installed also receive a push notification when a task is assigned to them. Tapping the notification opens the Task Inbox directly. Push notifications work alongside SMS — both are sent for task assignments.</p>`,
  ],

  // 34 — Waste Disposal Logging — Records, Carrier Licences & Legal Requirements
  [
    "How to record waste disposal events in BDE Farm Trac, including carrier licence verification, waste classification codes, and duty of care documentation.",
    `<h2>Waste Disposal Logging — Records, Carrier Licences & Legal Requirements</h2>
<p>The Environmental Protection Act 1990 and the Waste (England and Wales) Regulations 2011 require farms to maintain a duty of care record for every transfer of controlled waste from the holding. BDE Farm Trac's Waste Disposal module provides structured records for each waste collection event.</p>
<h3>Recording a waste disposal event</h3>
<p>Navigate to <strong>Health, Safety &amp; Risk → Waste Disposal</strong> and click <strong>New Disposal Record</strong>. Each record captures:</p>
<ul>
<li><strong>Waste type and description:</strong> agrochemical containers, tyres, oils and lubricants, electrical waste, scrap metal, farm plastics, clinical waste, or other.</li>
<li><strong>EWC (European Waste Catalogue) code:</strong> the six-digit code classifying the waste stream. Common farm codes are shown as a reference list in the form.</li>
<li><strong>Quantity and unit (kg, litres, or items).</strong></li>
<li><strong>Waste contractor:</strong> the collection company name and their Environment Agency (or SEPA/NRW) waste carrier licence number.</li>
<li><strong>Collection date.</strong></li>
<li><strong>Destination facility:</strong> the licensed waste transfer station, incinerator, or recycler.</li>
<li><strong>Transfer note or consignment note reference.</strong></li>
</ul>
<h3>Carrier licence verification</h3>
<p>You are legally required to check that your waste carrier holds a valid licence before handing over controlled waste. Record the carrier's licence number for each collection. If the same contractor is used regularly, register them in the Supplier Directory with their licence number and expiry date — you will be alerted when the licence is due for renewal.</p>`,
  ],

  // 35 — Week Ahead & Month Ahead — Your Compliance Planner
  [
    "How to use the Week Ahead and Month Ahead planner views in BDE Farm Trac to manage upcoming compliance deadlines, tasks, and operational priorities.",
    `<h2>Week Ahead & Month Ahead — Your Compliance Planner</h2>
<p>The Farm Planner provides a forward-looking view of everything requiring attention in the coming days and weeks — approaching compliance deadlines, scheduled tasks, staff rota, agri-environment management dates, and key livestock events such as expected calvings and expected lambing dates from scanning records.</p>
<h3>Week Ahead view</h3>
<p>Navigate to <strong>Planner → Week Ahead</strong>. The view shows seven days from today with compliance alerts and tasks organised by day. Each item shows its source module (e.g. Livestock — withdrawal period ending), the specific action required, and a link to the underlying record. Tasks assigned to specific staff members are shown under the relevant day with the assignee's name.</p>
<h3>Month Ahead view</h3>
<p>The Month Ahead calendar gives a broader view of the current month. Each day shows a dot or count badge if events are due. Click any day to expand it and see the full list. The Month Ahead view is particularly useful for planning around NVZ closed periods, sprayer calibration due dates, and certificate renewal deadlines.</p>
<h3>What appears in the planner</h3>
<ul>
<li>Medicine withdrawal periods ending within 7 days</li>
<li>Staff certificate expiry within 90 days</li>
<li>BCMS and eAML movement reporting deadlines</li>
<li>NVZ closed period start and end dates</li>
<li>Expected scanning and lambing dates from sheep records</li>
<li>Agri-environment management deadlines from the Environmental module</li>
<li>Tasks due on specific dates from the Task Board</li>
<li>Equipment MOT and NSTS calibration due dates</li>
</ul>
<h3>Printing the planner</h3>
<p>Use the Print button to produce a formatted week or month planner suitable for pinning in the office or farm office.</p>`,
  ],

  // 36 — Task Board — Managing Staff Task Assignments
  [
    "How to use the Task Board in BDE Farm Trac to assign, track, and complete compliance and operational tasks across your farm team.",
    `<h2>Task Board — Managing Staff Task Assignments</h2>
<p>The Task Board is BDE Farm Trac's centralised task management system. It allows managers to assign compliance and operational tasks to any staff member, set due dates, and track completion — all from one place. Tasks created from module-level advisories (medicine withdrawals, disease flags, scouting concerns) are pre-populated with the relevant record details so the assignee has full context.</p>
<h3>Creating a task</h3>
<p>Navigate to <strong>Planner → Task Board</strong> and click <strong>New Task</strong>. Fill in the task title, description, assigned staff member, module (to categorise the task), due date, and priority (Low, Normal, or High). Alternatively, tasks created from the Raise Task dialog within a specific module (e.g. after saving a disease scouting record) are pre-filled with the record details and the module is set automatically.</p>
<h3>Task types</h3>
<p>Tasks can be categorised by type: General, APHA Notification, Vet Call, Spray Review, Equipment Check, Staff Action, and others. The type determines the icon shown on the task card and allows filtering by category on the board.</p>
<h3>Task Inbox (mobile)</h3>
<p>When a task is assigned to a staff member, they receive an SMS notification and a push notification on the mobile app. Tapping the notification opens the Task Inbox — a filtered view of all tasks assigned to the logged-in user, sorted by due date. Staff can mark tasks as In Progress or Completed directly from the mobile app.</p>
<h3>Filtering and completing tasks</h3>
<p>Filter the Task Board by assignee, module, priority, or status. Completed tasks can be hidden or filtered by completion date. All completed tasks are permanently retained in the task history for audit purposes.</p>`,
  ],

  // 37 — Individual Animal Register and Electronic Identification (EID)
  [
    "How to use the Individual Animal Register in BDE Farm Trac, including ear tag recording, EID scanning, and cross-module traceability.",
    `<h2>Individual Animal Register and Electronic Identification (EID)</h2>
<p>The Individual Animal Register (IAR) is the definitive on-farm record of each tagged animal — its birth date, breed, ear tag numbers, current location, and status. BDE Farm Trac's IAR is linked to movement records, medicine treatments, and mortality records so every event in an animal's life is traceable from a single record.</p>
<h3>Adding an animal</h3>
<p>Navigate to <strong>Livestock → Individual Animals</strong> and click <strong>Add Animal</strong>. Record the primary ear tag (UK format), any additional tags (management tag, EID transponder number), species and breed, sex, date of birth, dam and sire (if known from your Sire Register), and the current herd or flock the animal belongs to. Home-bred animals can be added directly from a calving or lambing record.</p>
<h3>EID scanning</h3>
<p>The mobile app supports EID transponder scanning. In the field, open the Animal Register picker on any mobile record form and tap the scan icon to read the transponder. The matching animal is looked up automatically from the register, eliminating manual tag entry errors.</p>
<h3>QR code labels</h3>
<p>Each animal can have a QR code label generated from the Animal Register. Scanning the QR code opens the animal's full record in the mobile app — useful for rapid medicine administration checks at housing or scanning times.</p>
<h3>Cross-module traceability</h3>
<p>The IAR is the hub for animal traceability. Medicine treatment records, movement records, and mortality records all link back to individual animals by ear tag. When an animal is sold, its complete treatment history and movement history can be retrieved instantly for the buyer or slaughterhouse.</p>`,
  ],

  // 38 — Milk Recording and Milk Records
  [
    "How to record milk production, somatic cell counts, and monthly milk statements in BDE Farm Trac for dairy and Red Tractor Dairy compliance.",
    `<h2>Milk Recording and Milk Records</h2>
<p>The Livestock module's dairy records section captures monthly milk statements, regular milk recording (CIS or other scheme), and the SCC and bacterial count results that are required for Red Tractor Dairy and most milk buyer quality schemes.</p>
<h3>Monthly milk statements</h3>
<p>Navigate to <strong>Finance &amp; Business → Sales → Milk Statements</strong> and click <strong>New Statement</strong>. Each monthly entry records the milk buyer, the volume supplied (litres), the base price per litre (pence), butterfat (%), protein (%), somatic cell count (SCC, cells/ml), bactoscan result, quality bonus or penalty applied, transport deduction, and net payment. These feed the income statement in Business Reports.</p>
<h3>Milk recording</h3>
<p>For herds enrolled in a milk recording scheme (CIS, independent recorder, or own-herd recording), individual cow yields can be recorded on each test day. The recording captures the cow's ear tag, test date, milk yield (kg), fat %, protein %, and SCC. Individual SCC results above 200,000 cells/ml are flagged for mastitis review — this links to the Mastitis Records module.</p>
<h3>SCC threshold management</h3>
<p>Bulk tank SCC above 200,000 cells/ml triggers a compliance warning in the dashboard. Persistent high SCC is a Red Tractor Dairy non-conformance and may result in milk price penalties from your processor. The SCC trend chart in the Milk Recording section shows bulk tank SCC month by month for the current year.</p>`,
  ],

  // 39 — Mastitis Records and Treatment Logging
  [
    "How to record mastitis cases and treatment events in BDE Farm Trac, linking them to the Individual Animal Register and medicine records.",
    `<h2>Mastitis Records and Treatment Logging</h2>
<p>Mastitis is the most costly health condition in UK dairy herds. Structured mastitis records allow you to track incidence rates, identify repeat offenders, monitor the effectiveness of your dry cow therapy programme, and provide the treatment evidence required by Red Tractor Dairy and your milk buyer.</p>
<h3>Recording a mastitis case</h3>
<p>Navigate to <strong>Livestock → Mastitis Records</strong> and click <strong>New Case</strong>. Each record links to the animal's ear tag in the Individual Animal Register and captures:</p>
<ul>
<li><strong>Date of detection and clinical signs:</strong> clinical (visible changes to milk) or subclinical (elevated SCC only).</li>
<li><strong>Quarters affected:</strong> LF, RF, LR, RR.</li>
<li><strong>Milk SCC on detection.</strong></li>
<li><strong>Sample taken for culture:</strong> toggle, and laboratory result when received.</li>
<li><strong>Treatment administered:</strong> linked to a medicine treatment record in the Medicine Records section (pre-fills the intramammary product and withdrawal period).</li>
<li><strong>Treatment response:</strong> cured, chronic, or culled.</li>
</ul>
<h3>Mastitis incidence tracking</h3>
<p>The Mastitis summary shows the number of cases per 100 cows per year (the industry standard incidence rate measure), the top quarter affected, and the most common causative organism from culture results. The 90-day repeat case rate is also calculated — cows with more than three cases in 12 months are highlighted for culling consideration.</p>`,
  ],

  // 40 — Calving Records and Colostrum Management
  [
    "How to record calving events, calving ease scores, and colostrum management in BDE Farm Trac for dairy and suckler herd compliance.",
    `<h2>Calving Records and Colostrum Management</h2>
<p>Calving records are a core requirement for Red Tractor Dairy and Red Tractor Beef &amp; Lamb. They document the birth of each calf, the ease of calving, any intervention required, and the colostrum management actions taken in the critical first hours of life — all of which influence calf survival and subsequent performance.</p>
<h3>Recording a calving</h3>
<p>Navigate to <strong>Livestock → Calving Records</strong> and click <strong>New Calving</strong>. Capture:</p>
<ul>
<li><strong>Dam ear tag:</strong> links to the dam's record in the Individual Animal Register.</li>
<li><strong>Calving date and time.</strong></li>
<li><strong>Ease of calving score:</strong> 1 (no assistance), 2 (slight assistance), 3 (moderate assistance), 4 (major difficulty), 5 (caesarean).</li>
<li><strong>Calf details:</strong> sex, tag number applied, breed, birth weight (if weighed).</li>
<li><strong>Presentation:</strong> normal anterior, posterior, or other.</li>
<li><strong>Intervention:</strong> type of assistance given and who attended.</li>
<li><strong>Vet called:</strong> toggle and vet name.</li>
</ul>
<h3>Colostrum management</h3>
<p>The calving record includes a Colostrum section covering the time of first colostrum (target: within two hours of birth), the volume fed (target: at least 3 litres for a dairy calf or allow suck for a suckler calf), and whether the colostrum was tested using a refractometer (Brix score recorded). A Brix reading below 22% indicates poor quality colostrum that should be supplemented from a frozen store.</p>`,
  ],

  // 41 — Dry Cow Therapy (DCT) Records
  [
    "How to record dry cow therapy (DCT) decisions and treatments in BDE Farm Trac, including selective DCT justification and withdrawal period tracking.",
    `<h2>Dry Cow Therapy (DCT) Records</h2>
<p>Dry cow therapy records are required by Red Tractor Dairy and are scrutinised closely by milk buyers as part of responsible use of antibiotics programmes. Selective DCT — treating only cows that meet clinical criteria rather than blanket treating all cows at drying off — is now standard practice, and documented justification for each drying-off decision is expected.</p>
<h3>Recording a DCT event</h3>
<p>Navigate to <strong>Livestock → Dry Cow Therapy</strong> and click <strong>New DCT Record</strong>. Each record links to the cow's ear tag and captures:</p>
<ul>
<li><strong>Dry-off date.</strong></li>
<li><strong>Expected calving date.</strong></li>
<li><strong>SCC at drying off:</strong> the individual cow SCC from the most recent milk recording.</li>
<li><strong>Mastitis history in the current lactation:</strong> number of cases and quarters affected.</li>
<li><strong>DCT decision:</strong> Antibiotic DCT, Teat sealant only (no antibiotic), or No DCT. For selective DCT protocols, the decision field requires a justification note.</li>
<li><strong>Products used:</strong> antibiotic tube and/or teat sealant, with batch numbers and withdrawal periods pre-filled from the Medicine Records catalogue.</li>
<li><strong>Person administering and vet authorisation reference.</strong></li>
</ul>
<h3>Withdrawal period tracking</h3>
<p>The intramammary antibiotic withdrawal period for milk runs from the expected calving date, not the dry-off date. The platform calculates the earliest safe date to enter the milk supply after calving based on the product's withdrawal period.</p>`,
  ],

  // 42 — Workshop & Asset Management — Overview
  [
    "An overview of the Workshop & Asset Management module in BDE Farm Trac, covering asset registration, service history, defect reporting, and depreciation.",
    `<h2>Workshop & Asset Management — Overview</h2>
<p>The Workshop &amp; Asset Management module extends the Equipment Register with a full asset lifecycle view — acquisition cost, depreciation, workshop job cards, and a defect reporting workflow. It is particularly useful for farms with on-farm workshops, machinery rings, or larger fleets where tracking workshop time and asset value matters.</p>
<h3>Asset register</h3>
<p>Each piece of equipment in the Equipment Register can be assigned an acquisition date, purchase price, and depreciation method (straight-line over a chosen number of years). The current book value is calculated automatically and shown on the asset card, ready for inclusion in your farm's balance sheet.</p>
<h3>Workshop job cards</h3>
<p>Navigate to <strong>Equipment → Workshop Jobs</strong> to log each workshop job — planned service, breakdown repair, or modification. Each job card captures the machine, the fault description or planned job type, the date raised, estimated hours, actual hours, parts used, and the job status (Open, In Progress, or Completed). Job cards can be assigned to a named mechanic for workload tracking.</p>
<h3>Defect reports</h3>
<p>Operators report defects from the mobile app by selecting the machine and entering the defect description. The defect appears as an open item in the Workshop Jobs list and can be escalated to a full job card. The pre-use check log captures whether a defect was identified before the machine was used — important for H&amp;S compliance.</p>
<h3>PAT testing and fire extinguishers</h3>
<p>The PAT Testing tab tracks portable appliance test records for all electrical equipment used on the farm. The Fire Extinguisher tab records each extinguisher's location, type, last service date, and next service due date — these are annual legal requirements.</p>`,
  ],

  // 43 — Scanning QR Codes with the Mobile App
  [
    "How to use the BDE Farm Trac mobile app to scan QR codes for fields, animals, storage locations, and buildings.",
    `<h2>Scanning QR Codes with the Mobile App</h2>
<p>BDE Farm Trac generates unique QR codes for fields, individual animals, storage locations, and farm buildings. Scanning a QR code in the field opens that item's record instantly — no searching or typing required. This speeds up data entry significantly when recording spray applications, medicine treatments, or stock movements at the point of activity.</p>
<h3>How to scan a QR code</h3>
<p>Open the BDE Farm Trac mobile app and tap the QR scanner icon in the top toolbar. Point the camera at the code. If the device is online, the app resolves the item immediately and opens its record. If offline, the item is looked up from the locally cached reference data.</p>
<h3>What you can scan</h3>
<ul>
<li><strong>Field labels:</strong> scan a field stake or gate label to open the field's record and log a spray application, soil sample, or field operation directly against that field.</li>
<li><strong>Animal tags:</strong> scan a QR code printed for an individual animal to open its medicine treatment history, add a new treatment, or record a health observation.</li>
<li><strong>Storage locations:</strong> scan a grain store or chemical store QR code to view the current stock balance and log a stock movement.</li>
<li><strong>Equipment:</strong> scan a machine's QR label to open its service history and log a defect report.</li>
</ul>
<h3>Generating and printing QR labels</h3>
<p>QR labels are generated from the corresponding register page. For fields, use the Field Register. For animals, use the Individual Animal Register. Labels are printed as A5 or A4 sheets with the QR code and the item name for easy identification. Use weatherproof label materials for outdoor use.</p>`,
  ],

  // 44 — Generating QR Labels for Fields, Animals, and Storage
  [
    "How to generate and print QR code labels for fields, animals, and storage locations in BDE Farm Trac.",
    `<h2>Generating QR Labels for Fields, Animals, and Storage</h2>
<p>QR code labels provide a fast way to connect physical farm locations and assets to their digital records in BDE Farm Trac. Once a QR label is printed and placed on a gate, tag, or store door, any user with the mobile app can scan it to open the relevant record immediately.</p>
<h3>Generating a field label</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Field Register</strong> and open the field detail. Click <strong>Generate QR Label</strong>. The label downloads as a PDF containing the QR code, the field name, the OS parcel reference, and the field area. Print on a weatherproof label or laminate an A5 sheet for gate mounting.</p>
<h3>Generating an animal label</h3>
<p>Navigate to <strong>Livestock → Individual Animals</strong> and open the animal's record. Click <strong>Generate QR Label</strong>. The label shows the QR code alongside the primary ear tag number, species and breed, and date of birth. Print on adhesive label stock or on a durable card for pen-side mounting.</p>
<h3>Generating a storage location label</h3>
<p>Navigate to <strong>Grain &amp; Crop Storage → Locations</strong> and open the location record. Click <strong>Generate QR Label</strong>. The label shows the store name, location type, and current commodity. Print and fix to the store door or silo access panel.</p>
<h3>Best practice</h3>
<ul>
<li>Regenerate labels if the item's key details change (e.g. field renamed, animal retagged).</li>
<li>Mount labels at a consistent height for ease of scanning from the mobile app camera.</li>
<li>Laminate or use UV-resistant printing for outdoor labels to ensure the QR code remains scannable throughout the season.</li>
</ul>`,
  ],

  // 45 — PAT Testing & Fire Extinguisher Records
  [
    "How to record PAT test results and fire extinguisher service records in BDE Farm Trac as part of your health and safety documentation.",
    `<h2>PAT Testing & Fire Extinguisher Records</h2>
<p>Portable appliance testing (PAT) and fire extinguisher servicing are annual health and safety requirements for farm businesses. BDE Farm Trac's Equipment module provides registers for both, ensuring expiry dates are tracked and nothing slips through without a servicing record.</p>
<h3>PAT testing records</h3>
<p>Navigate to <strong>Equipment → PAT Testing</strong> and click <strong>Add PAT Record</strong>. For each electrical appliance tested, record:</p>
<ul>
<li><strong>Appliance name and type</strong> (kettle, extension lead, power tool, welder, etc.)</li>
<li><strong>Location:</strong> linked to a registered building from the Farm Buildings &amp; Areas Registry.</li>
<li><strong>Test date and next test due date.</strong></li>
<li><strong>Test result:</strong> Pass or Fail.</li>
<li><strong>Tester name and PAT tester serial number.</strong></li>
</ul>
<p>Failed appliances are flagged with a red status badge and should be taken out of service immediately. The record stores the remedial action taken.</p>
<h3>Fire extinguisher records</h3>
<p>Navigate to <strong>Equipment → Fire Extinguishers</strong> and click <strong>Add Extinguisher</strong>. Record the extinguisher type (water, CO₂, dry powder, foam, wet chemical), its location, the last service date, and the next service due date. Extinguishers approaching or past their service date are flagged in amber or red. Annual service is required under BS 5306-3. The record can be attached to a service certificate from the contractor.</p>`,
  ],

  // 46 — Workshop Risk Assessments & COSHH
  [
    "How to record workshop-specific risk assessments and COSHH assessments for chemicals used in farm maintenance activities.",
    `<h2>Workshop Risk Assessments & COSHH</h2>
<p>Farm workshops contain hazardous substances (oils, solvents, welding gases, battery acid) and dangerous activities (welding, grinding, hydraulic work) that require both COSHH assessments for substances and general risk assessments for activities. BDE Farm Trac's Health, Safety &amp; Risk module covers both.</p>
<h3>Workshop risk assessments</h3>
<p>Navigate to <strong>Health, Safety &amp; Risk → Risk Assessments</strong> and click <strong>New Assessment</strong>. Select the hazard category (Workshop / Machinery) and complete the five-step risk assessment:</p>
<ol>
<li><strong>Identify the hazard:</strong> describe the activity and the hazards it presents.</li>
<li><strong>Who might be harmed:</strong> operators, bystanders, visitors.</li>
<li><strong>Current controls:</strong> existing PPE, guards, training, and procedures.</li>
<li><strong>Residual risk rating:</strong> Low, Medium, or High after current controls.</li>
<li><strong>Further controls required:</strong> additional measures to reduce residual risk.</li>
</ol>
<h3>Workshop COSHH assessments</h3>
<p>Workshop chemicals — engine oil, hydraulic fluid, antifreeze, brake cleaner, welding flux — require COSHH assessments under the COSHH Regulations 2002. Create a COSHH assessment for each substance used in the workshop, referencing the product Safety Data Sheet (SDS) for hazard classification, exposure limits, and emergency procedures. Attach the SDS as a document to the assessment record.</p>
<h3>Toolbox talks</h3>
<p>Risk assessments can be used as the basis for a recorded toolbox talk. Log the talk in Staff &amp; Training → Training Events, attaching the risk assessment as the subject document and recording the staff members who attended.</p>`,
  ],

  // 47 — Getting Started with Pig Production Records
  [
    "An introduction to the Pig Production module in BDE Farm Trac, covering herd registration, movement records, farrowing, and health records.",
    `<h2>Getting Started with Pig Production Records</h2>
<p>The Pig Production module provides the records required for Red Tractor Pigs scheme compliance — movement reporting via eAML2, health plans, PRRS and tail biting risk assessments, farrowing records, and medicine records with withdrawal tracking. It sits alongside the core Livestock &amp; Feed Management module where individual animal records, movements, and medicines are recorded.</p>
<h3>Registering your pig herd</h3>
<p>Pig herds are registered in <strong>Livestock → Herds &amp; Animals</strong>. Add your herd with its APHA herd designation (Outdoor, Indoor, Free Range), the current herd size, and the production system (Farrow-to-finish, Weaner production, Finishing only, or Sow herd). All Pig Production records link back to this registered herd.</p>
<h3>Movement reporting</h3>
<p>Pig movements must be reported using an eAML2 document within three days. The BDE Farm Trac Livestock Movement record captures all eAML2 fields — sending and receiving CPH numbers, number and species of pigs, transport vehicle, haulier name, and the AML licence number. The completed movement data is available to reference when submitting to your Agriculture and Horticulture Development Board (AHDB) eAML2 portal.</p>
<h3>Health plans and biosecurity</h3>
<p>Annual vet-signed health plans are stored in the Health Plans tab. Red Tractor Pigs requires an annual health plan covering PRRS, PCV2, tail biting risk, and biosecurity. The PRRS vaccination programme and tail biting risk assessment each have their own structured record forms in the Pig Production module.</p>`,
  ],

  // 48 — Pig Movement and Identification
  [
    "How pig movement reporting and individual identification records work in BDE Farm Trac for eAML2 and Red Tractor Pigs compliance.",
    `<h2>Pig Movement and Identification</h2>
<p>All pig movements in England must be reported via the eAML2 (electronic Animal Movement Licence) system within three days. BDE Farm Trac records all movement data in a format that corresponds directly to the eAML2 fields, making it straightforward to reference when completing your authority submissions.</p>
<h3>eAML2 requirements</h3>
<p>An eAML2 document must be completed for every movement of pigs — on-farm, off-farm, and to slaughter. Required information includes:</p>
<ul>
<li>Departure holding CPH and destination CPH.</li>
<li>Number and species (pigs).</li>
<li>Date of movement.</li>
<li>Haulier name and vehicle registration.</li>
<li>AML licence number.</li>
<li>Health declaration (confirming no clinical signs of notifiable disease observed).</li>
</ul>
<h3>Recording a pig movement</h3>
<p>Navigate to <strong>Livestock → Movements</strong> and select Pigs as the species. Select the movement type (On — Purchase, Off — Sale, Off — Slaughter, On — Birth, Off — Death). Complete all eAML2 fields. The record is saved with a timestamp and is retrievable for the five-year period required by the regulations.</p>
<h3>Slap mark identification</h3>
<p>Pigs are identified by their registered slap mark (herd mark) rather than individual ear tags. Record the herd mark, movement batch size, and — where relevant for breeding pigs — individual sow ear tags from the Individual Animal Register. Finishing pigs are typically recorded as batch movements without individual identification.</p>`,
  ],

  // 49 — Getting Started with Poultry Production Records
  [
    "An introduction to the Poultry Production module in BDE Farm Trac, covering flock registration, placements, environmental logs, and cleanout records.",
    `<h2>Getting Started with Poultry Production Records</h2>
<p>The Poultry Production module supports broiler, layer, turkey, duck, and speciality poultry enterprises. It captures the records required by Red Tractor Poultry, the Lion Quality Code of Practice, and APHA biosecurity requirements. It links to the core Livestock &amp; Feed Management module for medicines, movements, and mortality records.</p>
<h3>Registering your flock</h3>
<p>Poultry flocks are registered in <strong>Livestock → Herds &amp; Animals</strong>. Add each flock with its species, breed or strain, house assignment (linked to the Farm Buildings &amp; Areas Registry), and production type (broiler, layer, free range, organic). All Poultry Production records reference this registered flock.</p>
<h3>Placement and depletion records</h3>
<p>Navigate to <strong>Poultry Production → Placements</strong> to record each new placement: placement date, number of birds placed, chick weight, hatchery or supplier, and flock number. Depletion records log the collection of birds for slaughter — date, number of birds collected, total flock weight, and the processor or haulier details.</p>
<h3>Environmental logs</h3>
<p>Daily environmental logs record house temperature (min/max), relative humidity, ammonia (ppm), CO₂ (ppm), ventilation rate, and lighting hours. Ammonia levels above 20 ppm are flagged automatically as a Red Tractor threshold breach. When an alarm is activated during a monitoring period, an amber advisory appears prompting investigation and corrective action documentation.</p>
<h3>Cleanout records</h3>
<p>Each house cleanout is recorded with the disinfectant used, DEFRA approval number, dilution rate, contact time, contractor details (if applicable), and swab testing results. See the dedicated Cleanout Records article for full details.</p>`,
  ],

  // 50 — Salmonella, Biosecurity and Poultry Health Plans
  [
    "How to record Salmonella NCP testing, biosecurity programmes, and poultry health plans in BDE Farm Trac for Red Tractor and Lion Quality compliance.",
    `<h2>Salmonella, Biosecurity and Poultry Health Plans</h2>
<p>Salmonella control is a central requirement of the Lion Code of Practice and Red Tractor Poultry standards. BDE Farm Trac provides dedicated records for the National Control Programme (NCP) testing requirements, your on-farm biosecurity programme, and annual vet-signed health plans.</p>
<h3>Salmonella NCP testing</h3>
<p>Navigate to <strong>Poultry Production → Salmonella Testing</strong> to log each NCP test event. Record the test date, flock, sample type (boot swabs, dust swabs, environmental swabs), the laboratory used, and the result for each Salmonella serotype (SE4b, ST, SHV, SIN, STV). Positive results are flagged in red and trigger a mandatory action card. All NCP test records must be retained for at least three years under the Zoonoses Regulations.</p>
<h3>Biosecurity records</h3>
<p>The Biosecurity tab logs each biosecurity assessment carried out on your poultry unit — the assessment date, the assessor, the areas assessed, any deficiencies found, and the corrective actions applied. Red Tractor requires a documented biosecurity plan and evidence of regular self-assessment.</p>
<h3>Poultry health plans</h3>
<p>Annual vet-signed health plans are stored in the Health Plans tab. The plan must be signed by a named vet and reviewed each year. Key plan contents include vaccination programmes, disease risk management, water quality protocols, and the vet's biosecurity recommendations. Attach the signed plan as a PDF and record the plan date and next review date.</p>
<h3>Downtime between placements</h3>
<p>The cleanout record captures the date the house was cleaned, and the subsequent placement record captures the next placement date. The system calculates the actual downtime in days between the two events — this is compared against your target minimum downtime documented in the biosecurity plan.</p>`,
  ],

  // 51 — Getting Started with Fresh Produce Records
  [
    "An introduction to the Fresh Produce module in BDE Farm Trac, covering crop registration, spray records, water testing, and harvest records for Red Tractor and GlobalG.A.P.",
    `<h2>Getting Started with Fresh Produce Records</h2>
<p>The Fresh Produce module provides the records required for Red Tractor Fresh Produce, LEAF, GlobalG.A.P., and retailer assurance schemes — crop and variety registration, spray application and PHI records, irrigation water quality testing, harvest records with grade and pack-out data, cold store temperatures, and allergen traceability.</p>
<h3>Crop registration</h3>
<p>Navigate to <strong>Fresh Produce → Crops</strong> and register each crop for the current season. Assign the crop type (salad leaves, brassicas, root vegetables, soft fruit, top fruit, etc.), variety, field or block, planting or sowing date, target harvest date, and growing system (open field, polytunnel, glasshouse).</p>
<h3>Spray records</h3>
<p>Fresh produce spray records use the same Sprays &amp; Inputs module as combinable crops but with additional fields for operator glove change records and re-entry intervals (REI). The harvest record for each crop links back to spray records for that field and checks that no product has been harvested before its PHI has expired — the food safety check that inspectors are most focused on.</p>
<h3>Water testing</h3>
<p>Irrigation water quality test records are held in the Water Quality tab. Required tests include E. coli, total coliforms, and — for overhead irrigation — Cryptosporidium and Giardia for some scheme standards. Test results link to the crop records using irrigation water from that source.</p>
<h3>Harvest and pack-out records</h3>
<p>The Harvest tab captures total yield, marketable yield, and reject rate per crop and per harvest date. Pack-out records add the grade, pack size, packing date, and batch code — which provides the traceability chain required by retailers for recall management.</p>`,
  ],

  // 52 — Pre-Harvest Intervals, MRLs and Residue Testing
  [
    "How BDE Farm Trac tracks pre-harvest intervals (PHIs), maximum residue levels (MRLs), and residue test results for fresh produce food safety compliance.",
    `<h2>Pre-Harvest Intervals, MRLs and Residue Testing</h2>
<p>Pre-harvest intervals (PHIs) are legally binding periods that must elapse between the last application of a pesticide product and the harvest of the crop. Maximum Residue Levels (MRLs) are the maximum concentrations of pesticide residues legally permitted in food. BDE Farm Trac tracks both to help you demonstrate food safety compliance at every stage.</p>
<h3>PHI tracking</h3>
<p>When a spray application record is saved for a fresh produce crop, the system calculates the earliest permitted harvest date by adding the product's PHI (from the MAPP label) to the application date. This earliest harvest date is shown on the spray record and on the crop's record. The harvest record is cross-referenced against all spray applications for the same crop — if the harvest date is before the calculated PHI end date for any product, a red food safety warning is generated.</p>
<h3>MRL compliance</h3>
<p>The spray product catalogue includes the active ingredient and the relevant MRL reference for common food crops. If your assurance scheme or retailer requires a MRL risk assessment, the spray records provide the application rate, timing, and PHI data needed to calculate theoretical residue levels.</p>
<h3>Residue testing records</h3>
<p>Navigate to <strong>Fresh Produce → Residue Testing</strong> to log results from independent residue testing — either your own monitoring programme or a retailer-requested test. Record the sample date, crop and batch, laboratory used, substances tested, results (mg/kg), and whether each result is below, at, or above the applicable MRL. Failed tests trigger a mandatory corrective action record.</p>`,
  ],

  // 53 — Carbon & Sustainability Records
  [
    "How to record carbon audits, sequestration, sustainability actions, and biodiversity net gain records in BDE Farm Trac's Carbon & Sustainability module.",
    `<h2>Carbon & Sustainability Records</h2>
<p>The Carbon &amp; Sustainability module provides structured records for farm carbon measurement, sequestration actions, renewable energy, and biodiversity net gain — the data that an increasing number of retailers, assurance schemes, and lenders are requesting as part of their sustainability reporting requirements.</p>
<h3>Carbon audits</h3>
<p>Navigate to <strong>Carbon &amp; Sustainability → Carbon Audits</strong> and click <strong>New Audit</strong>. Each annual audit record captures gross emissions (tCO₂e) by category — enteric fermentation, manure management, fuel and transport, synthetic fertiliser, purchased feed, and purchased electricity — and sequestration credits from woodland, hedgerows, permanent grassland, and organic matter additions. The net farm footprint (gross minus sequestration) is displayed in tCO₂e per year and per hectare.</p>
<h3>Carbon Auto-Calculator</h3>
<p>The Auto-Calculator tab automatically aggregates your logged fuel consumption, fertiliser applications, and livestock numbers and applies DEFRA 2023 greenhouse gas conversion factors to calculate your Scope 1, Scope 2, and Scope 3 emissions without manual data entry.</p>
<h3>Sustainability actions</h3>
<p>Log actions from your sustainability plan — each with the action description, estimated tCO₂e saving, responsible person, target completion date, and status. The running total of committed savings is shown against your baseline and net-zero trajectory.</p>
<h3>Biodiversity net gain</h3>
<p>BNG records capture habitat creation with area, habitat type, condition score (on the statutory BNG metric scale), and estimated biodiversity units gained. These records support Environment Act 2021 BNG obligations and can be submitted as evidence to local planning authorities.</p>`,
  ],

  // 54 — Farm Diversification Records
  [
    "How to record diversification enterprise activities in BDE Farm Trac, including glamping, farm shop, equine, and shooting records.",
    `<h2>Farm Diversification Records</h2>
<p>The Farm Diversification module captures non-agricultural business activities that take place on the farm — tourism and accommodation, farm shop operations, equine and livery services, and shooting days. These records support planning permission compliance, food hygiene requirements, and accurate income reporting for farm business accounts.</p>
<h3>Diversification enterprise register</h3>
<p>Navigate to <strong>Farm Diversification → Enterprises</strong> and register each non-agricultural enterprise. Record the enterprise type (glamping, B&amp;B, farm shop, food processing, events venue, equine livery, shooting, or other), the planning permission reference, and the consent status and expiry date.</p>
<h3>Farm shop records</h3>
<p>The Farm Shop tab provides a product catalogue with selling price, cost price, and reorder level. A sales log records each transaction with product, quantity, customer name, and payment method. Stock levels decrement automatically on each sale and increment with every purchase logged. Low-stock and out-of-stock alerts are sent via SMS if the SMS Alerts module is active.</p>
<h3>Equine and livery records</h3>
<p>The Equine tab logs vaccination, worming, farrier, and dental records for all horses on the holding — whether your own or clients' horses. Each health event captures the product name, batch number, administering person, and next due date.</p>
<h3>Shooting records</h3>
<p>Each shoot day is logged with shoot type, number of guns, per-species bag counts (pheasant, partridge, grouse, duck, woodcock), game dealer name, and income received. These records support income returns and compliance with the Code of Good Shooting Practice.</p>`,
  ],

  // 55 — Water & Irrigation Management
  [
    "How to record water abstraction licences, meter readings, irrigation events, and EA compliance records in BDE Farm Trac.",
    `<h2>Water & Irrigation Management</h2>
<p>The Water &amp; Irrigation module manages all aspects of on-farm water use — source registration, abstraction licence tracking, meter readings, irrigation events, soil moisture deficit monitoring, and pump maintenance records. Environment Agency (EA) licence conditions require metered abstraction records, and Red Tractor Fresh Produce requires irrigation event records linked to each crop.</p>
<h3>Water source register</h3>
<p>Navigate to <strong>Water &amp; Irrigation → Sources</strong> and register each water source on your holding — boreholes, watercourses, reservoirs, and mains supply connections. Record the source name, type, GPS coordinates, and whether an abstraction licence applies.</p>
<h3>Abstraction licence records</h3>
<p>For each licensed abstraction point, record the licence holder, EA licence reference, annual allocation (m³), licence conditions (maximum daily rate, time-of-year restrictions), and licence expiry date. Abstraction volume logged against each source is compared to the licence allocation — a warning is shown when usage approaches the annual limit.</p>
<h3>Meter readings and usage logs</h3>
<p>Log regular meter readings (daily or weekly as required by your licence condition) with the date, meter reading, and calculated volume drawn since the last reading. The running annual total is displayed against the allocation.</p>
<h3>Irrigation events</h3>
<p>Each irrigation event links to a field, a crop, the water source, the volume applied (m³), the irrigation method (overhead spray, drip, trickle, boom), and the crop growth stage. These records satisfy the irrigation traceability requirement of Red Tractor Fresh Produce and GlobalG.A.P.</p>`,
  ],

  // 56 — AI & Reproduction Records for Livestock
  [
    "How to record artificial insemination (AI), natural service, and reproduction events in BDE Farm Trac for cattle, sheep, and other livestock.",
    `<h2>AI & Reproduction Records for Livestock</h2>
<p>The AI &amp; Reproduction module captures every breeding event on your farm — artificial insemination, embryo transfer, and natural service — providing the traceability records required by breed societies, assurance schemes, and performance recording organisations.</p>
<h3>Recording an AI</h3>
<p>Navigate to <strong>Livestock → AI &amp; Reproduction → AI Records</strong> and click <strong>New AI Record</strong>. Each record captures:</p>
<ul>
<li><strong>Female animal:</strong> selected from the Individual Animal Register by ear tag.</li>
<li><strong>Insemination date.</strong></li>
<li><strong>Sire:</strong> selected from the Sire Register (donor bull, ram, or boar) or entered as free text for a commercial straw.</li>
<li><strong>Straw number and batch:</strong> linked to the Straw Inventory for stock tracking.</li>
<li><strong>Technician:</strong> the person who carried out the insemination (yourself, a vet, or an AI technician).</li>
<li><strong>Repeat service:</strong> toggle if this is a repeat service to the same female.</li>
<li><strong>Expected calving/lambing/farrowing date:</strong> calculated automatically from the insemination date and species gestation period.</li>
</ul>
<h3>Straw Inventory</h3>
<p>The Straw Inventory tracks semen deliveries — sire, breed, AI company, quantity received, storage location (liquid nitrogen tank), and current stock level. Stock decrements automatically each time a straw is used in an AI record, providing a running balance for ordering decisions.</p>`,
  ],

  // 57 — Veterinary Prescriptions & Medicine Book
  [
    "How to manage veterinary prescriptions (VWDs and VPDs) and the farm medicine book in BDE Farm Trac for Red Tractor and VMR compliance.",
    `<h2>Veterinary Prescriptions & Medicine Book</h2>
<p>The Veterinary Medicines Regulations 2013 require farmers to keep a written record of every veterinary medicine used on farm for at least five years. This record — the farm medicine book — must include the product name, the batch number, the quantity used, the animal(s) treated, the date of treatment, the administering person, the vet authorisation details, and the withdrawal period observed. BDE Farm Trac's Medicine Records module is this medicine book in digital form.</p>
<h3>Medicine records</h3>
<p>See the dedicated <em>Livestock Medicine Records and Withdrawal Periods</em> article for full instructions on recording individual treatments. Each treatment record captures all fields required for the medicine book under the VMR 2013.</p>
<h3>Vet prescriptions register</h3>
<p>Navigate to <strong>Livestock → Vet Prescriptions</strong> to maintain a register of all current Veterinary Written Directions (VWDs) and Veterinary Prescription Documents (VPDs). Each prescription record captures the vet's name and practice, the medicine name, the licensed species and indication, the authorised dose, the issue date, the expiry date, and any conditions of use. Attach the original prescription document as a PDF.</p>
<h3>Linking treatments to prescriptions</h3>
<p>When recording a medicine treatment under a prescription, link the treatment record to the relevant VWD from the prescription register. This creates a clear chain from the vet's authorisation to the specific treatment events carried out under it — satisfying both the VMR requirement and the Red Tractor medicines trail.</p>`,
  ],

  // 58 — SFI & Agri-Environment Actions
  [
    "How to record Sustainable Farming Incentive (SFI) actions, Countryside Stewardship options, and other agri-environment scheme activities in BDE Farm Trac.",
    `<h2>SFI & Agri-Environment Actions</h2>
<p>The Environmental module provides a comprehensive record-keeping framework for all agri-environment scheme activities — Sustainable Farming Incentive (SFI) actions, Countryside Stewardship (CS) options, Higher Level Stewardship (HLS) legacy agreements, and other national or local schemes. These records support RPA payment claims and are the evidence required for scheme inspections.</p>
<h3>Recording an SFI action</h3>
<p>Navigate to <strong>Environmental → SFI Actions</strong> and click <strong>New Action</strong>. Each record captures the SFI action code (e.g. CSAM1, CAHL3, NUM3), the field or parcel reference, the area or length committed (ha or m), the start date of the action, the management events carried out, and the completion status.</p>
<h3>Management event logs</h3>
<p>For each action, log the individual management events that demonstrate the action has been delivered — grass cutting dates, cover crop establishment and incorporation dates, hedgerow cutting periods observed, legume establishment records, soil testing results. Each event can have a photograph attached as visual evidence.</p>
<h3>Countryside Stewardship options</h3>
<p>CS options are recorded in the Agreements register. Each option shows the agreed area, annual payment rate, and the required management prescriptions. Management event logs for each option link back to the agreement record, providing a complete evidence trail from agreement commitment to on-the-ground delivery.</p>
<h3>RPA inspection preparation</h3>
<p>The SFI and CS records in BDE Farm Trac are formatted to provide the evidence RPA inspectors look for at a spot-check — dated management records, GPS-referenced field parcels, and photographic evidence. Export all records for a selected agreement to CSV for inclusion in an inspection evidence file.</p>`,
  ],

  // 59 — Slurry & Manure Management Records
  [
    "How to record slurry and organic manure applications, store capacity, and closed period compliance in BDE Farm Trac.",
    `<h2>Slurry & Manure Management Records</h2>
<p>Slurry and organic manure applications are regulated by the Nitrates Regulations in NVZ areas and by the Water Resources (Control of Pollution) (Oil Storage) (England) Regulations more broadly. BDE Farm Trac records slurry store capacity, spreading events, and closed period compliance in a single module.</p>
<h3>Slurry store records</h3>
<p>Navigate to <strong>Environmental → Slurry &amp; Manure → Stores</strong> and register each slurry or slurry-adjacent store. Record the store type (concrete lagoon, above-ground tank, earth-banked lagoon, weeping wall store), capacity (m³), and the last structural integrity inspection date. NVZ regulations require sufficient capacity to hold six months' slurry for pig and poultry units and five months for cattle — the capacity check confirms compliance.</p>
<h3>Spreading records</h3>
<p>For each spreading event, record the field, date, organic material type (cattle slurry, pig slurry, farmyard manure, poultry manure, digestate, or other), dry matter content (%), application method (splash plate, trailing shoe, injection), application rate (m³/ha or t/ha), and calculated nitrogen applied (kg N/ha). This feeds the NVZ nitrogen budget for the field.</p>
<h3>Closed period compliance</h3>
<p>The NVZ closed periods for slurry spreading (typically 1 October to 31 January for most livestock slurries in England) are shown as a countdown on the Environmental dashboard. Applications made during the closed period are automatically flagged as a regulatory breach. The upcoming closed period start date triggers a reminder seven days in advance.</p>`,
  ],

  // 60 — Grain Storage Quality Records
  [
    "How to record grain store temperature, moisture monitoring, and pest inspection records in BDE Farm Trac for Red Tractor and assured merchant requirements.",
    `<h2>Grain Storage Quality Records</h2>
<p>Grain quality monitoring in store is a requirement for Red Tractor Combinable Crops and TASCC (Trade Assurance Scheme for Combinable Crops) certification. BDE Farm Trac records temperature probing, moisture monitoring, pest inspections, and fumigation events for each grain store and storage location.</p>
<h3>Temperature probing</h3>
<p>Navigate to <strong>Equipment → Grain Storage Quality → Temperature Records</strong> and log each temperature probe reading. Record the store or location, the probe position (top, middle, bottom), the date, the temperature (°C), and any abnormal readings or odours noted. Grain temperatures above 15°C in summer or rapid temperature increases require immediate investigation — these are flagged with amber warnings.</p>
<h3>Moisture monitoring</h3>
<p>Log moisture content checks — the date, the store, the sample position, the moisture (%), and the moisture meter used. Grain above safe storage moisture for the commodity (typically 15% for wheat and barley) is flagged as at risk of heating and mycotoxin development.</p>
<h3>Pest inspections</h3>
<p>Record each pest inspection — date, inspector, pests found (weevils, moths, beetles, rodents), level of infestation, and any treatment applied. TASCC requires a minimum frequency of weekly inspections during the storage period.</p>
<h3>Drying records</h3>
<p>The Grain Drying tab logs each drying event with intake moisture, target moisture, tonnes dried, fuel consumed, cost, and moisture reduction achieved. These records are used in cost-of-production calculations in the Business Reports module.</p>`,
  ],

  // 61 — Fly-Tipping — Recording Incidents, Authority Reporting and Photo Evidence
  [
    "How to record fly-tipping incidents, report them to the local authority, and attach photo evidence in BDE Farm Trac.",
    `<h2>Fly-Tipping — Recording Incidents, Authority Reporting and Photo Evidence</h2>
<p>Fly-tipping on agricultural land is a criminal offence under the Environmental Protection Act 1990. As the landowner, you are responsible for clearing the waste — but documenting the incident thoroughly is essential for recovering costs from insurers, supporting a local authority investigation, and protecting yourself from liability for waste you did not deposit.</p>
<h3>Recording an incident</h3>
<p>Navigate to <strong>Environmental → Fly-Tipping</strong> and click <strong>New Incident</strong>. Record:</p>
<ul>
<li><strong>Discovery date and location:</strong> field, track, gateway, or building — linked to the Farm Buildings &amp; Areas Registry or Field Register.</li>
<li><strong>Waste description:</strong> type (household waste, construction waste, tyres, hazardous material, etc.), estimated volume or weight, and any identifying information in the waste.</li>
<li><strong>Photographs:</strong> attach photographs showing the waste, any tyre tracks, and the wider area. GPS-tagged photos from the mobile app are automatically timestamped.</li>
<li><strong>Authority reported to:</strong> local authority environmental health, police, Environment Agency (for hazardous waste).</li>
<li><strong>Report reference number:</strong> obtained from the authority at the time of reporting.</li>
<li><strong>Clearance details:</strong> who cleared the waste, cost of clearance, and any insurance claim reference.</li>
</ul>
<h3>Why this record matters</h3>
<p>A documented incident record with photographs, reporting references, and clearance costs is the evidence needed for an insurance claim. It also helps the local authority build a picture of repeat offenders in your area and supports enforcement action.</p>`,
  ],

  // 62 — Unauthorized Encampments — Recording, Authority Action and Legal Remedies
  [
    "How to record unauthorised encampment incidents and the authority actions taken in BDE Farm Trac.",
    `<h2>Unauthorized Encampments — Recording, Authority Action and Legal Remedies</h2>
<p>Unauthorised encampments on agricultural land cause significant disruption and can result in significant waste disposal costs. Documenting the incident, the authority responses, and all associated costs from the outset creates the evidence trail needed for court orders, insurance claims, and local authority support.</p>
<h3>Recording an encampment</h3>
<p>Navigate to <strong>Environmental → Encampments</strong> and click <strong>New Record</strong>. Log the date of discovery, the location on your holding, a description of the encampment (number of vehicles, estimated number of people), and photographs from the mobile app. Record any damage to fences, gates, or locks caused at the time of entry.</p>
<h3>Authority actions</h3>
<p>Document each step of the authority engagement process:</p>
<ul>
<li><strong>Police contact:</strong> date, officer name and collar number, and the force's response.</li>
<li><strong>Local authority contact:</strong> date, officer name, and whether a Section 77 or 78 notice was issued.</li>
<li><strong>Legal action:</strong> injunction application date, court hearing date, and order issued.</li>
</ul>
<h3>Costs and clearance</h3>
<p>Record all costs associated with the incident — legal fees, bailiff costs, waste clearance contractor, and any repair costs. These are needed for a civil claim or insurance recovery. Attach invoices from contractors and solicitors as supporting documents.</p>`,
  ],

  // 63 — Crop Trials Register — Setting Up and Managing On-Farm Trials
  [
    "How to set up and manage on-farm crop variety trials and input trials in BDE Farm Trac.",
    `<h2>Crop Trials Register — Setting Up and Managing On-Farm Trials</h2>
<p>The Crop Trials Register allows you to formally document on-farm trial work — variety comparison trials, fungicide efficacy trials, nitrogen rate trials, and other agronomic experiments. A well-documented trial record provides the evidence needed to validate agronomic decisions and contributes to BASIS CPD requirements for agronomists reviewing the results.</p>
<h3>Setting up a trial</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Crop Trials</strong> and click <strong>New Trial</strong>. Record the trial name, trial type (variety, fungicide, herbicide, nitrogen rate, biostimulant, or other), crop year, and the lead agronomist or BASIS adviser. Define the trial treatments (e.g. Treatment A: 150 kg N/ha, Treatment B: 180 kg N/ha, Untreated control).</p>
<h3>Field allocation</h3>
<p>Assign each trial plot to a field section, recording the plot dimensions (ha) and GPS boundary where known. For replicated trials, record all replicates with their field positions. The field-level spray and fertiliser records for trial plots are linked back to the trial so the full management history of each treatment is captured.</p>
<h3>Measurements and results</h3>
<p>Record interim measurements (plant counts, disease ratings, BBCH stages) and final yield results (t/ha, moisture, specific weight) for each treatment. The trial summary calculates the yield difference between treatments and the estimated gross margin impact per hectare, allowing a simple economic evaluation of the trial outcome.</p>`,
  ],

  // 64 — Haulage & Transport — Module Overview
  [
    "An overview of the Haulage & Transport module in BDE Farm Trac, covering haulier directory, movement records, dispatch plans, and grain position tracking.",
    `<h2>Haulage & Transport — Module Overview</h2>
<p>The Haulage &amp; Transport module records every grain and crop movement on and off your farm — from field to store, store to merchant, and direct to processor. It provides the movement audit trail required by TASCC, Red Tractor, and merchant contract terms, and drives the grain position tracker that shows what you have in each location at any point in time.</p>
<h3>Haulier directory</h3>
<p>Navigate to <strong>Haulage → Hauliers</strong> to maintain a directory of the road hauliers you use for grain movements. Record the company name, driver name, vehicle registration, and operator licence number. The haulier is selected from this directory when logging a movement, auto-populating the vehicle and licence details on the movement record.</p>
<h3>Movement records</h3>
<p>Each grain movement record captures the date, commodity, source location (field or store), destination location (store, merchant, processor), quantity (tonnes), moisture, grade, and weighbridge ticket reference. Attach the weighbridge ticket or delivery note as a document. The movement updates the source and destination stock balances in real time.</p>
<h3>Dispatch plans</h3>
<p>Dispatch Plans allow you to plan crop movements in advance — set a target load count, tonnage per load, and target dates for a batch of movements from a store to a buyer. As individual movement records are logged against the plan, the plan's progress bar shows loads completed, tonnes moved, and remaining balance.</p>
<h3>Grain position</h3>
<p>The Grain Position tab shows total harvested, total moved, and current balance for each commodity, aggregated across all storage locations. Year filter and location filter allow you to drill down to a specific store or crop year.</p>`,
  ],

  // 65 — Dispatch Plans — Planning and Managing Crop Movements
  [
    "How to create and manage dispatch plans for grain movements in BDE Farm Trac, tracking load counts, tonnage, and completion progress.",
    `<h2>Dispatch Plans — Planning and Managing Crop Movements</h2>
<p>Dispatch Plans are used to manage a series of grain or crop movements from a store to a buyer or processor over a defined period. They turn a series of individual movement records into a coordinated delivery programme with visible progress tracking.</p>
<h3>Creating a dispatch plan</h3>
<p>Navigate to <strong>Haulage → Dispatch Plans</strong> and click <strong>New Plan</strong>. Record:</p>
<ul>
<li><strong>Commodity and variety.</strong></li>
<li><strong>Source storage location.</strong></li>
<li><strong>Buyer or destination facility.</strong></li>
<li><strong>Target quantity (tonnes).</strong></li>
<li><strong>Target start and end date for the delivery programme.</strong></li>
<li><strong>Planned load count and target tonnes per load.</strong></li>
<li><strong>Forward contract linkage:</strong> link to an open forward contract so call-off tonnage is tracked against the contract balance.</li>
</ul>
<h3>Logging movements against the plan</h3>
<p>When logging individual movement records, select the relevant dispatch plan in the plan linkage field. The movement is added to the plan's progress. The plan card shows a progress bar with tonnes moved, loads completed, and remaining tonnage outstanding.</p>
<h3>Plan completion</h3>
<p>When the target tonnage has been delivered, mark the plan as Complete. The final record set is retained permanently and can be exported to CSV for submission to your merchant or processor as delivery confirmation. The linked forward contract balance is updated to reflect the completed call-off.</p>`,
  ],

  // 66 — Forward Contracts — Managing Grain Sales & Pricing
  [
    "How to record and manage grain forward contracts in BDE Farm Trac, tracking committed tonnage, call-offs, and contract completion.",
    `<h2>Forward Contracts — Managing Grain Sales & Pricing</h2>
<p>Forward contracts allow you to sell grain at an agreed price for future delivery, giving price certainty ahead of harvest. BDE Farm Trac's forward contract register tracks each contract from agreement to full delivery, linking every grain sale call-off to the parent contract for complete traceability.</p>
<h3>Recording a forward contract</h3>
<p>Navigate to <strong>Finance &amp; Business → Grain Contracts</strong> and click <strong>New Contract</strong>. Record the buyer, commodity, contracted tonnage, agreed price (£/tonne), base grade specification, contract period start and end, and the merchant contract reference number. Attach the signed contract document.</p>
<h3>Call-off linkage</h3>
<p>When recording a grain sale, select <em>Forward Contract</em> as the sale type. A Linked Forward Contract picker appears, showing all open contracts filtered by commodity. Selecting the contract links the sale (call-off) to the parent record. The contract's progress bar updates to show called-off tonnage, remaining tonnage, and the percentage completed.</p>
<h3>Contract progress tracking</h3>
<p>The Contracts register shows each contract's status — Open, Partially Called-Off, Fully Delivered, or Expired. A green contract badge appears on each linked grain sale row in the sales table. The full list of call-offs and their weighbridge ticket numbers is visible from the contract record, providing the end-to-end audit trail from merchant contract to weighbridge delivery.</p>`,
  ],

  // 67 — Grain Position — Tracking Your Crop Stock
  [
    "How the Grain Position tracker in BDE Farm Trac shows harvested tonnage, stock movements, and current balance by commodity and location.",
    `<h2>Grain Position — Tracking Your Crop Stock</h2>
<p>The Grain Position tracker gives you a real-time view of how much grain or combinable crop you have in store at any location, at any point in the marketing year. It is updated automatically each time a harvest record, stock movement, or grain sale is logged.</p>
<h3>Understanding the position summary</h3>
<p>Navigate to <strong>Haulage → Grain Position</strong>. For each commodity (wheat, barley, OSR, beans, peas, oats, etc.) the position shows:</p>
<ul>
<li><strong>Total harvested:</strong> the sum of all harvest records for the current crop year.</li>
<li><strong>Total moved out:</strong> grain sales, transfers to merchant storage, and off-farm dispatches.</li>
<li><strong>Current balance:</strong> harvested minus moved out — what should be in your stores right now.</li>
</ul>
<h3>Location-level view</h3>
<p>The location filter breaks the position down by individual store or merchant position. This shows the balance in each grain store, silo, or off-farm merchant position separately — useful when selling from a specific store or reconciling a merchant statement.</p>
<h3>Year filter</h3>
<p>The crop year filter defaults to the current year. Select a previous year to review the full position history — particularly useful when comparing yield and marketing performance year on year.</p>
<h3>Reconciliation</h3>
<p>Compare the BDE Farm Trac position against your physical stocktake results or merchant storage statements. Any discrepancy should prompt a review of movement records to identify missing deliveries or data entry errors. The stock movement audit trail in the Grain &amp; Crop Storage module shows every intake, dispatch, and transfer with its date and reference for systematic reconciliation.</p>`,
  ],

  // 68 — Tail Biting Risk Assessments — Pig Production
  [
    "How to record tail biting risk assessments and management responses in BDE Farm Trac for Red Tractor Pigs scheme compliance.",
    `<h2>Tail Biting Risk Assessments — Pig Production</h2>
<p>Tail biting is a significant welfare concern in pig production and a key focus of Red Tractor Pigs scheme assessment. A documented risk assessment and management plan, updated at least annually, is required to demonstrate that the risk has been identified and that appropriate preventive measures are in place.</p>
<h3>Recording a risk assessment</h3>
<p>Navigate to <strong>Pig Production → Tail Biting Risk Assessments</strong> and click <strong>New Assessment</strong>. The assessment covers the key risk factors identified in the AHDB/BPex tail biting guidance:</p>
<ul>
<li><strong>Stocking density:</strong> current kg/m² and assessment of whether it meets the Welfare of Farmed Animals Regulations minimum.</li>
<li><strong>Thermal environment:</strong> temperature and draught risk at pig level.</li>
<li><strong>Feed and water provision:</strong> feeder space, water point ratio, and feed access observations.</li>
<li><strong>Enrichment:</strong> rooting and manipulation material provided — type, quantity, and quality assessment.</li>
<li><strong>Health status:</strong> current disease burden, respiratory or enteric challenge level.</li>
<li><strong>Tail length:</strong> current tail docking policy — Red Tractor requires a documented justification for docking and evidence of continuous tail biting monitoring if tails are docked.</li>
</ul>
<h3>Risk score and actions</h3>
<p>Based on the assessment, record an overall risk score (Low, Medium, or High) and the specific management actions taken to address identified risk factors. Set a review date — the assessment must be reviewed whenever an outbreak occurs and at least annually.</p>`,
  ],

  // 69 — Farrowing & Sow Records — Pig Production
  [
    "How to record farrowing events, litter sizes, sow performance, and weaning records in BDE Farm Trac for Red Tractor Pigs.",
    `<h2>Farrowing & Sow Records — Pig Production</h2>
<p>Farrowing records are the foundation of sow productivity monitoring. They capture the key performance indicators — total born, born alive, stillborn, mummies, litter birth weight, and weaning results — that drive management decisions around culling, feed strategy, and genetic selection.</p>
<h3>Recording a farrowing</h3>
<p>Navigate to <strong>Pig Production → Farrowing Records</strong> and click <strong>New Farrowing</strong>. Each record captures:</p>
<ul>
<li><strong>Sow ear tag:</strong> linked to the Individual Animal Register.</li>
<li><strong>Farrowing date and time.</strong></li>
<li><strong>Parity number.</strong></li>
<li><strong>Total born, born alive, stillborn, and mummies.</strong></li>
<li><strong>Average birth weight (kg):</strong> if litter is weighed at birth.</li>
<li><strong>Intervention:</strong> farrowing assistance type if required.</li>
<li><strong>Fostering:</strong> piglets moved to or from another sow — record the numbers moved and the recipient sow.</li>
</ul>
<h3>Weaning records</h3>
<p>When the litter is weaned, record the weaning date, number of piglets weaned, total litter weight at weaning, and average weaning weight. The weaning-to-service interval is calculated automatically from the weaning date and the sow's subsequent service record. This feeds the sow productivity summary showing litters per sow per year and piglets weaned per sow per year.</p>`,
  ],

  // 70 — Broiler Welfare Indicators (BWI) — Poultry Production
  [
    "How to record Broiler Welfare Indicator (BWI) results in BDE Farm Trac for Red Tractor Poultry and Lion Code compliance.",
    `<h2>Broiler Welfare Indicators (BWI) — Poultry Production</h2>
<p>Broiler Welfare Indicators (BWIs) are a set of outcome-based measures assessed at slaughter that reflect the welfare of the flock during rearing. Red Tractor Poultry requires producers to monitor their BWI results and take action when results fall below threshold levels. BDE Farm Trac records BWI data at the flock level and flags results requiring investigation.</p>
<h3>BWI measures</h3>
<p>The standard BWI assessment at slaughter captures:</p>
<ul>
<li><strong>Gait score (walking ability):</strong> percentage of birds scoring 3+ on the Bristol Gait Score (indicating lameness).</li>
<li><strong>Hock burns:</strong> percentage of birds with hock burn lesions graded 1–3.</li>
<li><strong>Footpad dermatitis (FPD):</strong> percentage with severe footpad lesions (score 2).</li>
<li><strong>Breast blisters and skin lesions.</strong></li>
<li><strong>Culls and dead on arrival (DOA).</strong></li>
</ul>
<h3>Recording BWI results</h3>
<p>Navigate to <strong>Poultry Production → BWI Records</strong> and click <strong>New BWI Record</strong>. Select the flock and the kill date. Enter the percentages for each welfare indicator as provided by the processing plant. Results above the Red Tractor threshold for any indicator are flagged in red and trigger a mandatory corrective action record.</p>
<h3>Trend analysis</h3>
<p>The BWI summary chart shows each indicator's trend across the last six crops for the selected house. Persistent high hock burn rates often indicate litter quality issues; high gait scores may indicate nutritional or health challenges. The trend view helps identify root causes that should be addressed in the next crop plan.</p>`,
  ],

  // 71 — House Cleanout Records — Contractor Tracking, Disinfectant and Cost
  [
    "How to record poultry house cleanouts in BDE Farm Trac, including disinfectant compliance, contractor details, swab testing, and the food safety advisory.",
    `<h2>House Cleanout Records — Contractor Tracking, Disinfectant and Cost</h2>
<p>House cleanouts are a critical biosecurity control for poultry producers and a key area of focus for Red Tractor Poultry and Salmonella NCP auditors. BDE Farm Trac records every cleanout with the detail required to demonstrate a compliant disinfection procedure was carried out.</p>
<h3>Recording a cleanout</h3>
<p>Navigate to <strong>Poultry Production → Cleanouts</strong> and click <strong>New Cleanout Record</strong>. Select whether the cleanout was carried out by <em>Farm Staff</em> or a <em>Contractor</em>.</p>
<ul>
<li><strong>Farm staff cleanout:</strong> record who completed the cleanout and who verified it.</li>
<li><strong>Contractor cleanout:</strong> record the company name and whether they supplied their own materials.</li>
</ul>
<h3>Disinfectant details</h3>
<p>Record the DEFRA-approved disinfectant product name, its DEFRA approval number (from the approved disinfectants list on GOV.UK), the dilution rate applied, the contact time (minutes), and the standing time before restocking (hours). These are the core compliance fields a Red Tractor assessor and Salmonella NCP auditor will check.</p>
<h3>Swab testing and food safety advisory</h3>
<p>If pre-clean environmental swabs or post-clean verification swabs were taken, toggle <em>Swabs Taken</em> on and record the swab results when received. When swabs are recorded as taken, an amber food safety advisory appears on the record: <strong>do not restock until negative swab results have been received and confirmed by your vet or Salmonella NCP co-ordinator.</strong> This advisory ensures restocking is not rushed before microbiological clearance is confirmed.</p>
<h3>Cost and stock tracking</h3>
<p>Record the contractor cost (pence) and invoice reference if using a contractor. If using your own stock, log each product consumed by quantity — this decrements stock levels in the Trade Contacts &amp; Stock module and provides an audit trail of chemical usage. Attach photo evidence of the cleaned house.</p>`,
  ],

  // 72 — Right to Work Checks for Farm Employers
  [
    "How to record right to work checks for farm employees in BDE Farm Trac to comply with the Immigration, Asylum and Nationality Act 2006.",
    `<h2>Right to Work Checks for Farm Employers</h2>
<p>The Immigration, Asylum and Nationality Act 2006 requires all UK employers to check that every employee has the legal right to work in the UK before they begin work. Failure to carry out a compliant check and retain evidence can result in a civil penalty of up to £60,000 per illegal worker. BDE Farm Trac records right to work check details for each member of farm staff.</p>
<h3>Recording a right to work check</h3>
<p>Navigate to <strong>Staff &amp; Training → Staff Records</strong>, open the staff member's record, and click <strong>Right to Work</strong>. Record:</p>
<ul>
<li><strong>Check date:</strong> the date the document was examined (must be before the start of employment).</li>
<li><strong>Document type:</strong> British or Irish passport, Biometric Residence Permit (BRP), Share Code verification, or other acceptable document per the GOV.UK right to work list.</li>
<li><strong>Document reference number.</strong></li>
<li><strong>Expiry date</strong> (where applicable — BRPs and visas have expiry dates that require follow-up checks).</li>
<li><strong>Check carried out by:</strong> the name of the person who conducted the check.</li>
</ul>
<h3>Document copies</h3>
<p>Attach a copy of the document (passport photo page, BRP front and back) to the record. Retaining a clear copy is a legal requirement — the copy must be retained for two years after the person stops working for you.</p>
<h3>Expiry tracking</h3>
<p>For employees whose right to work is time-limited (visa holders, students), the check expiry date is tracked with amber (90 days) and red (expired) alerts, prompting a repeat check before the document expires.</p>`,
  ],

  // 73 — Staff Management & System Access
  [
    "How to add, manage, and control system access for farm staff members in BDE Farm Trac.",
    `<h2>Staff Management & System Access</h2>
<p>The Staff &amp; Training module manages both the operational records for each staff member (certificates, training events, timesheets, PPE) and their access to BDE Farm Trac itself. Different roles have different levels of access — farm owners can see everything, managers can approve timesheets and purchase orders, and operators can record events and access only their assigned modules.</p>
<h3>Adding a staff member</h3>
<p>Navigate to <strong>Settings → Staff Members</strong> and click <strong>Add Staff Member</strong>. Record the full name, job title, email address, and phone number. Assign the staff member to one or more departments from the Department Register. Set their role:</p>
<ul>
<li><strong>Owner/Administrator:</strong> full access to all modules, settings, and financial records.</li>
<li><strong>Manager:</strong> can approve purchase orders, timesheets, and leave requests. Access to all operational modules.</li>
<li><strong>Operator:</strong> can create operational records (spray applications, livestock records, harvest records) but cannot access financial data or settings.</li>
<li><strong>Viewer:</strong> read-only access to records across assigned modules.</li>
</ul>
<h3>Inviting a staff member</h3>
<p>Click <strong>Send Invite</strong> to email the staff member their login credentials. They set their own password on first login. If a staff member leaves, deactivate their account from Settings — this removes their access immediately without deleting any of the records they created.</p>
<h3>Mobile app access</h3>
<p>All staff members with an active account can use the mobile app. Their role permissions apply — an Operator can create records but cannot access the Finance module from the mobile app.</p>`,
  ],

  // 74 — Thinning Records — Poultry Production
  [
    "How to record partial depletions (thinning) of broiler flocks in BDE Farm Trac for Red Tractor Poultry and stocking density compliance.",
    `<h2>Thinning Records — Poultry Production</h2>
<p>Thinning — the partial removal of birds from a broiler house before final depletion — is used to manage stocking density as birds grow towards their target liveweight. Red Tractor Poultry and the Welfare of Farmed Animals (England) Regulations 2007 require thinning records to demonstrate that stocking density limits were not exceeded during the rearing period.</p>
<h3>Recording a thinning event</h3>
<p>Navigate to <strong>Poultry Production → Depletions</strong> and click <strong>New Thinning Record</strong> (select Partial Depletion as the type). Record:</p>
<ul>
<li><strong>Flock and house.</strong></li>
<li><strong>Thinning date.</strong></li>
<li><strong>Age of birds at thinning (days).</strong></li>
<li><strong>Number of birds removed.</strong></li>
<li><strong>Average liveweight at thinning (kg):</strong> typically from a pre-thin sample weigh.</li>
<li><strong>Total weight removed (kg).</strong></li>
<li><strong>Processor or haulier details.</strong></li>
</ul>
<h3>Stocking density calculation</h3>
<p>After each thinning event, the system recalculates the current stocking density (kg/m²) based on the remaining birds and their projected liveweight at the current age. This is compared against the permitted maximum (33 kg/m² standard, up to 39 kg/m² under an approved higher stocking density programme). An alert is shown if stocking density exceeds the applicable limit.</p>`,
  ],

  // 75 — Soil Sample Register — Understanding References and Status
  [
    "How soil sample references work in BDE Farm Trac and what the different status stages mean for your sampling programme.",
    `<h2>Soil Sample Register — Understanding References and Status</h2>
<p>Every soil sample in BDE Farm Trac has a unique reference number and a status that reflects where it is in the sampling-to-results workflow. Understanding the reference format and status stages helps you track outstanding results and ensure your sampling programme is complete and up to date.</p>
<h3>Sample references</h3>
<p>Sample references are either assigned by your laboratory (the lab's own sample ID) or created by you as a farm reference (e.g. FIELD-01-2024 for the first sample from Field 1 taken in 2024). Use a consistent naming convention so samples are easy to match to specific fields and sampling rounds.</p>
<h3>Status stages</h3>
<ul>
<li><strong>Awaiting Results:</strong> the sample has been submitted to the laboratory and results have not yet been received. The record exists with the sampling date and location but no analytical results.</li>
<li><strong>Results Received:</strong> laboratory results have been entered. pH, P index, K index, Mg index, and organic matter percentage are now on the record. The field's current soil index is updated.</li>
<li><strong>Actioned:</strong> the results have been reviewed and a nutrient management recommendation has been made (lime, phosphate, potash application, or no action required). This status confirms the sample has been interpreted and used in planning.</li>
</ul>
<h3>Overdue sampling alerts</h3>
<p>The field record tracks the most recent sample date and displays the calculated next-due date based on your sampling frequency setting (typically every four years). Fields past their next-due date are flagged in the Soil Samples dashboard with an amber Overdue indicator.</p>`,
  ],

  // 76 — AI & Reproduction Records — Cattle and Livestock
  [
    "How to record AI and natural service breeding events for cattle in BDE Farm Trac, including sire linkage and pregnancy checking.",
    `<h2>AI & Reproduction Records — Cattle and Livestock</h2>
<p>Cattle AI and reproduction records provide the breeding traceability required by breed societies, genetics companies, and performance recording organisations such as AHDB Dairy and Beef. BDE Farm Trac links each breeding event to the individual animal record, the sire register, and the straw inventory.</p>
<h3>Recording a cattle AI</h3>
<p>Navigate to <strong>Livestock → AI &amp; Reproduction → Cattle AI</strong> and click <strong>New Record</strong>. Each record captures:</p>
<ul>
<li><strong>Cow or heifer ear tag:</strong> from the Individual Animal Register.</li>
<li><strong>Service date.</strong></li>
<li><strong>Service type:</strong> AI, natural service, or embryo transfer.</li>
<li><strong>Sire:</strong> selected from the Sire Register — bull name, breed, AI company, and registration number are auto-filled.</li>
<li><strong>Straw number:</strong> linked to the Straw Inventory — the inventory decrements by one when the record is saved.</li>
<li><strong>Technician or vet.</strong></li>
<li><strong>Expected calving date:</strong> calculated from the service date and the 283-day gestation period (adjustable).</li>
</ul>
<h3>Pregnancy checking</h3>
<p>Record the pregnancy check result — date, method (manual rectal, ultrasound), result (Pregnant, Empty, Uncertain), and the vet or technician. For confirmed in-calf cows, the expected calving date is confirmed and appears in the Week Ahead planner as the calving approaches.</p>
<h3>Natural service records</h3>
<p>For herds using a stock bull, natural service is recorded against the bull from the Sire Register. Note the bull turn-out date, the group of cows served, and the expected calving date range.</p>`,
  ],

  // 77 — Vet Prescriptions — Storing and Tracking Written Authorisations
  [
    "How to store and track veterinary written directions (VWDs) and prescriptions in BDE Farm Trac, including expiry monitoring and treatment linkage.",
    `<h2>Vet Prescriptions — Storing and Tracking Written Authorisations</h2>
<p>Any medicine used under a Veterinary Written Direction (VWD) or off-label Cascade prescription must have the vet's written authorisation available for inspection. BDE Farm Trac's Vet Prescriptions register stores each authorisation as a digital record with expiry tracking and links every treatment carried out under it back to the prescription for a complete compliance chain.</p>
<h3>Adding a prescription</h3>
<p>Navigate to <strong>Livestock → Vet Prescriptions</strong> and click <strong>Add Prescription</strong>. Record:</p>
<ul>
<li><strong>Prescribing vet:</strong> name, practice name, and RCVS registration number.</li>
<li><strong>Medicine name:</strong> the exact product name as it appears on the label and prescription.</li>
<li><strong>Licensed species and indication.</strong></li>
<li><strong>Authorised dose and route of administration.</strong></li>
<li><strong>Issue date and expiry date:</strong> VWDs typically run for six months; Cascade prescriptions may be shorter.</li>
<li><strong>Maximum quantity authorised.</strong></li>
</ul>
<p>Attach the original signed prescription as a PDF — this is the document the inspector will want to see.</p>
<h3>Expiry tracking</h3>
<p>Prescriptions approaching expiry (within 30 days) are flagged in amber. Expired prescriptions are shown in red. Medicines should not be administered under an expired prescription without a new authorisation from the vet.</p>
<h3>Linking treatments</h3>
<p>When recording a medicine treatment, the prescription reference picker shows all active prescriptions for the species and medicine being used. Selecting the prescription links the treatment record to the authorisation — the inspector can trace from the prescription to every treatment administered under it.</p>`,
  ],

  // 78 — SFI / ELMS Agreements — Recording and Tracking Agri-Environment Schemes
  [
    "How to record and track Sustainable Farming Incentive and Environmental Land Management scheme agreements in BDE Farm Trac.",
    `<h2>SFI / ELMS Agreements — Recording and Tracking Agri-Environment Schemes</h2>
<p>The Environmental module's Agreements register provides a central home for all your current agri-environment scheme agreements — Sustainable Farming Incentive (SFI), Countryside Stewardship (CS), Higher Level Stewardship (HLS), and any devolved equivalent schemes. Agreement records are the starting point for logging the management events that demonstrate delivery of each scheme option.</p>
<h3>Recording an agreement</h3>
<p>Navigate to <strong>Environmental → Agreements</strong> and click <strong>New Agreement</strong>. Record the scheme name, agreement reference number, agreement start date, agreement end date, annual payment amount (£), and the RPA or relevant paying authority contact. List the options or actions included in the agreement.</p>
<h3>Action records</h3>
<p>For each scheme option (e.g. CAHL3 — herbal leys, CIPM2 — integrated pest management, AB8 — flower-rich margins), create an individual action record linking it to the parent agreement. The action record captures the area committed (ha), the field parcels covered, and any specific management prescriptions.</p>
<h3>Management event logging</h3>
<p>Log management events against each action as they occur throughout the agreement year. Each event records the date, activity carried out, area or length covered, and any measurements taken (plant species counts, soil test results). Photo evidence can be attached to each event from the mobile app.</p>
<h3>Agreement expiry</h3>
<p>The agreement expiry date is tracked with amber (90 days) and red (expired) alerts. Before an agreement expires, review whether it needs to be rolled over, renegotiated, or replaced with a new agreement for the next commitment period.</p>`,
  ],

  // 79 — Slurry & Manure Management — Records and Closed Period Compliance
  [
    "How to record slurry applications and store levels in BDE Farm Trac and manage compliance with NVZ closed period rules.",
    `<h2>Slurry & Manure Management — Records and Closed Period Compliance</h2>
<p>Slurry and organic manure management is one of the most heavily regulated activities on a livestock farm. The Nitrates Regulations set closed periods during which slurry cannot be spread, minimum store capacity requirements, and field-level nitrogen limits. BDE Farm Trac tracks all of these in the Slurry &amp; Manure section of the Environmental module.</p>
<h3>Closed period overview</h3>
<p>NVZ closed periods for slurry spreading in England vary by material and soil type. For cattle slurry on soil to be autumn-sown cereals, the period typically runs from 1 August to 31 October. For all other situations, the standard period is 1 October to 31 January. The platform shows a countdown to the next closed period start date on the Environmental dashboard.</p>
<h3>Spreading records</h3>
<p>Each spreading record captures the date, field, material type, application method, rate, and calculated nitrogen applied (kg N/ha). This updates the field's NVZ nitrogen budget. Records created during a closed period are automatically flagged as a compliance breach — they cannot be deleted but a note field allows you to document any exceptional circumstances (e.g. emergency spreading under a derogation).</p>
<h3>Store capacity records</h3>
<p>Record slurry store capacity (m³) and current volume in the Stores tab. NVZ regulations require sufficient storage capacity to hold six months' slurry production for pig and poultry operations (five months for cattle). The capacity check compares your registered store capacity against the calculated minimum required for your herd size and confirms whether you are compliant.</p>`,
  ],

  // 80 — Grain Storage Quality — Monitoring and Record Keeping
  [
    "How to maintain grain store quality monitoring records in BDE Farm Trac, including temperature probing, moisture checks, and fumigation events.",
    `<h2>Grain Storage Quality — Monitoring and Record Keeping</h2>
<p>Maintaining grain quality in store requires systematic monitoring and prompt corrective action. BDE Farm Trac's grain storage quality records provide the documented monitoring evidence required by TASCC certification and Red Tractor Combinable Crops. See also the dedicated <em>Grain Storage Quality Records</em> article.</p>
<h3>Monitoring schedule</h3>
<p>TASCC and Red Tractor recommend the following minimum monitoring frequencies:</p>
<ul>
<li><strong>Temperature probing:</strong> at least weekly from intake until the grain is stabilised, then at least fortnightly.</li>
<li><strong>Moisture checks:</strong> at intake and whenever temperature changes are observed.</li>
<li><strong>Pest inspections:</strong> at least weekly during the storage period.</li>
<li><strong>Aeration system checks:</strong> after each aeration run, confirm actual temperatures achieved.</li>
</ul>
<h3>Corrective action records</h3>
<p>When monitoring identifies a problem — elevated temperature, moisture increase, or pest activity — record the corrective action taken immediately: aeration run initiated, drying commenced, fumigation applied, or grain moved. Each corrective action is timestamped and linked to the monitoring record that triggered it.</p>
<h3>Fumigation records</h3>
<p>If fumigation is required, record the fumigant product (phosphine, methyl bromide is no longer permitted in the UK), the quantity used, the date and duration of treatment, the operators involved (PA4 certificate required for phosphine), the gas concentration achieved, and the ventilation period before re-entry. These records satisfy the Health and Safety at Work Act requirements for fumigation operations.</p>`,
  ],

  // 81 — Fresh Produce Module — Crop Records, Sprays, and Assurance
  [
    "How the Fresh Produce module integrates crop records, spray applications, and assurance scheme requirements in BDE Farm Trac.",
    `<h2>Fresh Produce Module — Crop Records, Sprays, and Assurance</h2>
<p>The Fresh Produce module provides a complete crop-to-pack compliance trail for salad, vegetable, soft fruit, and top fruit producers. It integrates crop registration, spray applications, water quality testing, harvesting, and pack-out records into a single assurance evidence chain that satisfies Red Tractor Fresh Produce, LEAF Marque, GlobalG.A.P., and major retailer requirements.</p>
<h3>Crop-level compliance</h3>
<p>Every spray application, irrigation event, and fertiliser application is linked to a specific registered crop. The crop record acts as the compliance hub — from it you can view all agrochemical inputs applied, all irrigation events and water quality results, the harvest date and yield, and the pack-out batch code. This is the traceability chain that enables a retailer to recall products at the batch level if required.</p>
<h3>Spray records for fresh produce</h3>
<p>Fresh produce spray records include additional fields beyond the combinable crop record — re-entry intervals (REI) after which operators can safely re-enter the crop, and glove change requirements for pickers. The PHI check at harvest is the most critical food safety gate: the system flags any harvest record where the PHI for any applied product has not been observed.</p>
<h3>Allergen records</h3>
<p>For fresh produce operations that process or handle allergenic crops alongside non-allergenic ones, allergen presence records can be logged for each growing location and packing line. These records support the mandatory allergen labelling requirements of the Food Information to Consumers Regulation (FIC).</p>`,
  ],

  // 82 — Carbon & Sustainability — Measuring and Recording Your Farm's Footprint
  [
    "How to measure, calculate, and record your farm's carbon footprint in BDE Farm Trac using the Carbon Auto-Calculator and manual audit records.",
    `<h2>Carbon & Sustainability — Measuring and Recording Your Farm's Footprint</h2>
<p>Measuring your farm's carbon footprint is increasingly expected by retailers, assurance schemes, and lenders as part of their sustainability programmes. BDE Farm Trac provides both automatic calculation from your existing records and a structured manual audit record for farms using external tools like Agrecalc or Cool Farm Tool.</p>
<h3>Carbon Auto-Calculator</h3>
<p>Navigate to <strong>Carbon &amp; Sustainability → Auto-Calculator</strong>. The calculator aggregates data from across your farm records — fuel consumption from the Fuel &amp; Energy module, fertiliser applications from the NVZ module, livestock numbers from the Herd Register, purchased electricity, and purchased feed — and applies DEFRA 2023 greenhouse gas conversion factors to estimate your Scope 1, Scope 2, and Scope 3 emissions.</p>
<h3>Annual carbon audit records</h3>
<p>For farms using Agrecalc, Cool Farm Tool, or an independent carbon auditor, record the audit outputs in the Carbon Audits tab. Each audit captures gross emissions by category, sequestration credits, and net tCO₂e per year and per hectare. Year-on-year comparison charts show progress against your baseline.</p>
<h3>Sequestration records</h3>
<p>Log carbon sequestration actions — woodland planting, hedgerow creation, cover cropping, and organic matter additions — each with the area, species or practice, and estimated tCO₂e/year sequestration credit. These reduce the net footprint shown in the audit record.</p>
<h3>Net-zero pathway</h3>
<p>Set a baseline year and a net-zero target year in the settings. The pathway calculator shows the required annual reduction rate and displays where your current footprint sits against the trajectory in the Reports tab.</p>`,
  ],

  // 83 — Farm Diversification — Recording Non-Agricultural Activities
  [
    "How to record non-agricultural business activities in BDE Farm Trac's Farm Diversification module, including tourism, food hygiene inspections, and food sales.",
    `<h2>Farm Diversification — Recording Non-Agricultural Activities</h2>
<p>Farm diversification encompasses a wide range of non-agricultural income-generating activities — accommodation and tourism, farm shops and direct sales, food processing, equine and livery, shooting, and events. The Farm Diversification module provides structured records for each enterprise type, ensuring planning compliance, food hygiene requirements, and income reporting are all documented.</p>
<h3>Accommodation records</h3>
<p>Log glamping bookings, B&amp;B occupancy, and holiday let bookings with arrival and departure dates, occupancy count, and revenue. The occupancy summary shows total nights occupied and income by enterprise for the selected period — useful for planning permission compliance reporting and income tax returns.</p>
<h3>Food hygiene inspections</h3>
<p>For farm shops, farm kitchens, and food processing operations, EHO inspection records are stored in the Food Hygiene tab. Each record captures the inspection date, the inspecting officer and authority, the inspection type (routine, HACCP audit, complaint-related), the Food Hygiene Rating (0–5 FHRS scale), any non-conformances found, and corrective actions. The next planned inspection date is tracked with a reminder alert.</p>
<h3>Events and tastings</h3>
<p>Farm events — harvest suppers, pick-your-own days, outdoor markets — are logged with the event date, expected attendance, revenue, and any required licences or temporary event notices (TENs). These records support planning condition compliance and licensing authority reporting.</p>`,
  ],

  // 84 — Water & Irrigation — Abstraction, Usage, and Compliance Records
  [
    "How to record water abstraction, usage, and irrigation compliance records in BDE Farm Trac for EA licence conditions and scheme requirements.",
    `<h2>Water & Irrigation — Abstraction, Usage, and Compliance Records</h2>
<p>Water abstraction for irrigation is regulated by the Environment Agency in England. Licence conditions specify the maximum annual abstraction volume, daily abstraction rates, and time-of-year restrictions. BDE Farm Trac records your abstraction against these conditions and provides the usage evidence needed for your annual return or licence renewal.</p>
<h3>Licence compliance monitoring</h3>
<p>Each abstraction licence in the Water Sources register has its annual allocation set. Daily meter readings are logged against the source. The running annual total is shown as a progress bar against the allocation — amber at 80% and red at 95% of the annual limit, prompting you to manage usage carefully as the limit approaches.</p>
<h3>Daily metered records</h3>
<p>Log each meter reading with the date, source, and meter reading value. The volume drawn since the previous reading is calculated automatically. If your licence requires daily records, the system flags any days where a reading is missing from the log.</p>
<h3>EA compliance checks</h3>
<p>The Compliance tab shows whether your recent abstraction pattern complies with the licence conditions — no abstraction during restricted periods, daily rates within permitted limits, and annual total below the licence cap. Any breach is flagged as a compliance event with a mandatory note field.</p>
<h3>CAMS reporting</h3>
<p>If your local Catchment Abstraction Management Strategy (CAMS) requires periodic reporting of abstraction volumes, the meter reading records provide the data needed to complete the return. Export the readings to CSV for submission to the EA.</p>`,
  ],

  // 85 — Equipment Defect Reports — Tracking Faults and Repairs
  [
    "How to log equipment defects and track their resolution in BDE Farm Trac for health and safety and maintenance management.",
    `<h2>Equipment Defect Reports — Tracking Faults and Repairs</h2>
<p>Defect reporting is a critical element of farm health and safety management. Identifying, recording, and resolving equipment faults promptly prevents accidents and equipment failures at critical operational periods. BDE Farm Trac's defect reporting workflow allows operators to log faults from the field via the mobile app and managers to track resolution from the dashboard.</p>
<h3>Logging a defect</h3>
<p>From the mobile app, navigate to the machine's QR-scanned record or select it from the Equipment list, then tap <strong>Report Defect</strong>. Record:</p>
<ul>
<li><strong>Defect description:</strong> what the fault is and where on the machine it was found.</li>
<li><strong>Severity:</strong> Safety-Critical (machine must be taken out of service immediately), Significant (use with caution and resolve within 24 hours), or Minor (resolve at next planned service).</li>
<li><strong>Photograph:</strong> attach a photo of the defect from the mobile app camera.</li>
</ul>
<h3>Resolution tracking</h3>
<p>Defect reports appear on the Equipment dashboard as open items categorised by severity. Safety-Critical defects trigger an SMS alert to all opted-in managers. The manager assigns the repair to a workshop mechanic or external contractor and sets a target resolution date. When repaired, record the work done, the parts used, and the date resolved. The defect is then closed and retained in the machine's full defect history.</p>`,
  ],

  // 86 — Testing Laboratories — Registering Labs and Linking Test Results
  [
    "How to register testing laboratories in BDE Farm Trac and link them to soil samples, water tests, grain quality tests, and residue analyses.",
    `<h2>Testing Laboratories — Registering Labs and Linking Test Results</h2>
<p>BDE Farm Trac links test results — soil samples, water quality tests, grain quality tests, residue analyses, and milk recording results — to the specific UKAS-accredited laboratory that produced them. This satisfies the audit trail requirement that test results can be traced to a certified analytical facility.</p>
<h3>Registering a laboratory</h3>
<p>Navigate to <strong>Trade Contacts &amp; Stock → Suppliers</strong> and add the laboratory as a supplier of type <em>Laboratory</em>. Record the laboratory name, UKAS accreditation number, scope of accreditation (soil analysis, water analysis, mycotoxin testing, etc.), contact details, and the account reference number your farm uses with them.</p>
<h3>Linking tests to the laboratory</h3>
<p>When entering a test result in any module — soil sample, water quality, grain quality, or residue test — a laboratory picker field appears. Select the registered laboratory. The laboratory's name and UKAS number are stored against the result record, confirming the test was carried out by an accredited facility.</p>
<h3>Why UKAS accreditation matters</h3>
<p>UKAS (United Kingdom Accreditation Service) is the national accreditation body. Test results from UKAS-accredited laboratories are accepted as authoritative by Red Tractor, GlobalG.A.P., TASCC, and most retailers. Non-accredited laboratory results may not be accepted as compliance evidence. Always check the scope of a laboratory's accreditation covers the specific tests you need before submitting samples.</p>`,
  ],

  // 87 — Pig Production Module — Overview
  [
    "An overview of the Pig Production module in BDE Farm Trac, covering all available record types for Red Tractor Pigs compliance.",
    `<h2>Pig Production Module — Overview</h2>
<p>The Pig Production module covers the specialist records required for Red Tractor Pigs scheme compliance — records that go beyond the core Livestock &amp; Feed Management module's coverage of movements, medicines, and mortality. The module is available as an add-on for farms with an active pig enterprise.</p>
<h3>Module contents</h3>
<ul>
<li><strong>Farrowing &amp; Sow Records:</strong> litter size, birth weights, stillborns, fostering, and weaning records per sow.</li>
<li><strong>Pig Movement and Identification:</strong> eAML2-compatible movement records with slap mark capture.</li>
<li><strong>Tail Biting Risk Assessments:</strong> structured risk scoring and management action records.</li>
<li><strong>PRRS Management Records:</strong> vaccination programme and herd status monitoring.</li>
<li><strong>Feed &amp; FCR Records:</strong> feed consumption and feed conversion ratio per pen or group.</li>
<li><strong>Mortality Records:</strong> cause analysis by piglet, weaner, grower, and finisher categories.</li>
<li><strong>Red Tractor Pigs Checklist:</strong> pre-inspection self-assessment against scheme standards.</li>
<li><strong>Health Plans:</strong> annual vet-signed plans with PRRS, PCV2, tail biting, and biosecurity sections.</li>
</ul>
<h3>Herd registration</h3>
<p>Pig herds are registered centrally in Livestock → Herds &amp; Animals. All Pig Production records link to the registered herd. If you have multiple pig units (farrow-to-finish, specialist weaner producer, and finishing unit), each unit can be registered as a separate herd with its own record sets.</p>`,
  ],

  // 88 — Poultry Production Module — Overview
  [
    "An overview of the Poultry Production module in BDE Farm Trac, covering all record types for Red Tractor Poultry and Lion Code compliance.",
    `<h2>Poultry Production Module — Overview</h2>
<p>The Poultry Production module provides a comprehensive record-keeping system for broiler, layer, turkey, duck, and speciality poultry enterprises. It covers flock placements, daily environmental monitoring, Salmonella NCP testing, biosecurity, cleanouts, medicines, mortality, Broiler Welfare Indicators, thinning records, and health plans.</p>
<h3>Module contents</h3>
<ul>
<li><strong>Flock register:</strong> all flocks linked to the central Livestock → Herds &amp; Animals register and assigned to registered houses.</li>
<li><strong>Placements:</strong> placement date, source hatchery, number of birds, chick weight.</li>
<li><strong>Depletions and thinning:</strong> partial and full depletion records with bird weights and processor details.</li>
<li><strong>Daily environmental logs:</strong> temperature, humidity, ammonia, CO₂, ventilation rate, and alarm records (with environmental advisory when alarm is activated).</li>
<li><strong>House cleanouts:</strong> disinfectant compliance, swab testing, contractor costs, and the restocking food safety advisory.</li>
<li><strong>Salmonella NCP testing:</strong> boot swab and environmental swab records.</li>
<li><strong>BWI records:</strong> broiler welfare indicator results from the processing plant.</li>
<li><strong>Biosecurity assessments and health plans.</strong></li>
<li><strong>Feed &amp; water consumption per flock.</strong></li>
<li><strong>Egg production records (layer units):</strong> lay rate, grading, and packing records.</li>
</ul>
<h3>Flock-level dashboard</h3>
<p>Each flock has a summary card showing placement date, current age, estimated liveweight, current stocking density, and most recent environmental log values. The stocking density is highlighted if it approaches the regulatory maximum for the applicable production standard.</p>`,
  ],

  // 89 — Fresh Produce Module — Overview
  [
    "An overview of the Fresh Produce module in BDE Farm Trac, covering all record types for Red Tractor Fresh Produce and GlobalG.A.P. compliance.",
    `<h2>Fresh Produce Module — Overview</h2>
<p>The Fresh Produce module provides the crop-to-pack compliance trail required by Red Tractor Fresh Produce, LEAF Marque, GlobalG.A.P., Soil Association Certification, and major retailer assurance schemes. It covers crop registration, spray applications, water quality testing, harvest records, pack-out data, cold store temperatures, allergen records, and intake quality checks.</p>
<h3>Module contents</h3>
<ul>
<li><strong>Crop register:</strong> crop type, variety, field or block, planting date, and target harvest date per growing season.</li>
<li><strong>Spray records:</strong> all agrochemical applications with PHI tracking and food safety gateway at harvest.</li>
<li><strong>Water testing:</strong> irrigation water E. coli, coliform, and pathogen test results linked to crop records.</li>
<li><strong>Harvest records:</strong> yield, marketable yield, reject rate, and harvest date per crop.</li>
<li><strong>Pack-out records:</strong> grade, pack size, packing date, and batch code for retailer traceability.</li>
<li><strong>Cold store temperatures:</strong> temperature logs for all cold storage used in the supply chain.</li>
<li><strong>Allergen records:</strong> presence and management records for each growing location and packing line.</li>
<li><strong>Intake quality checks:</strong> for produce received from contract growers or trading partners.</li>
<li><strong>Residue testing:</strong> results from independent or retailer-requested residue monitoring.</li>
</ul>
<h3>Batch traceability</h3>
<p>The batch code assigned in the pack-out record links back through the harvest record to the spray application records and field register, providing a complete product recall chain from retailer shelf to the field where the produce was grown.</p>`,
  ],

  // 90 — Carbon & Sustainability Module — Overview
  [
    "An overview of the Carbon & Sustainability module in BDE Farm Trac, covering all record types for farm carbon measurement and sustainability reporting.",
    `<h2>Carbon & Sustainability Module — Overview</h2>
<p>The Carbon &amp; Sustainability module provides a structured framework for measuring, recording, and reporting on your farm's environmental impact. It is used for retailer sustainability questionnaires, Red Tractor environmental requirements, SFI and CS agri-environment reporting, and internal performance management against net-zero commitments.</p>
<h3>Module contents</h3>
<ul>
<li><strong>Carbon audits:</strong> annual gross emissions, sequestration credits, and net tCO₂e per year and per hectare.</li>
<li><strong>Carbon Auto-Calculator:</strong> automated Scope 1, 2, and 3 calculation from your existing farm records using DEFRA 2023 emission factors.</li>
<li><strong>Sequestration records:</strong> woodland creation, hedgerow planting, cover crops, and organic matter additions with tCO₂e/year estimates.</li>
<li><strong>Sustainability action plan:</strong> logged actions with estimated savings, responsible persons, and target completion dates.</li>
<li><strong>Renewable energy records:</strong> solar generation, wind, and AD records with CO₂ avoided calculated automatically.</li>
<li><strong>Biodiversity net gain:</strong> habitat creation records with BNG metric condition scores and biodiversity unit estimates.</li>
<li><strong>Supply chain declarations:</strong> sustainability statement references for retailer assurance and ISCC/RTFO audits.</li>
<li><strong>Net-zero pathway:</strong> baseline year, reduction target, and year-on-year tracking against the net-zero trajectory.</li>
</ul>
<h3>FCT import</h3>
<p>Upload your Farm Carbon Toolkit (FCT) report directly to pre-populate an annual audit record. This eliminates re-keying and keeps your on-farm data consistent with the independent assessment your agronomist or certifier sees.</p>`,
  ],

  // 91 — Farm Diversification Module — Overview
  [
    "An overview of the Farm Diversification module in BDE Farm Trac, covering all enterprise types and record categories.",
    `<h2>Farm Diversification Module — Overview</h2>
<p>The Farm Diversification module captures income and compliance records for non-agricultural enterprises on your farm. It is designed for farms with tourism, retail, food processing, equine, shooting, or other diversification activities that need to be managed alongside the core agricultural business.</p>
<h3>Enterprise types covered</h3>
<ul>
<li><strong>Accommodation and tourism:</strong> glamping, B&amp;B, holiday lets, and farm tours — booking and occupancy records, income by enterprise.</li>
<li><strong>Farm shop:</strong> product catalogue, sales log, stock management, and purchase ledger.</li>
<li><strong>Food processing:</strong> food hygiene inspections and HACCP records, EHO visit log, Food Hygiene Rating.</li>
<li><strong>Events:</strong> farm events, harvest suppers, and wedding venue bookings — attendance, revenue, and licensing.</li>
<li><strong>Equine and livery:</strong> health event logs (vaccination, worming, farrier, vet) for all horses on the holding.</li>
<li><strong>Shooting:</strong> shoot day records with species bag counts, organiser details, and game dealer income.</li>
</ul>
<h3>Income reporting</h3>
<p>All diversification income is available in the Business Reports module alongside agricultural income. The P&amp;L statement shows diversification income by enterprise type, allowing you to evaluate which diversification activities are contributing most to farm business profitability.</p>`,
  ],

  // 92 — Water & Irrigation Module — Overview
  [
    "An overview of the Water & Irrigation module in BDE Farm Trac, covering all record types for abstraction compliance and irrigation management.",
    `<h2>Water & Irrigation Module — Overview</h2>
<p>The Water &amp; Irrigation module manages all aspects of on-farm water use from source to field — registering water sources, tracking abstraction licence conditions, logging meter readings, recording irrigation events, and managing pump maintenance. It is particularly important for horticultural and fresh produce operations where irrigation volume and water quality are both scheme compliance requirements.</p>
<h3>Module contents</h3>
<ul>
<li><strong>Water source register:</strong> boreholes, watercourses, reservoirs, and mains connections with source type and licence details.</li>
<li><strong>Abstraction licence records:</strong> licence reference, annual allocation, daily limits, and seasonal restrictions.</li>
<li><strong>Meter readings:</strong> daily or weekly metered volume logs against each source, with running annual total versus licence allocation.</li>
<li><strong>Irrigation events:</strong> field-level irrigation records linked to crops, water source, volume applied, and irrigation method.</li>
<li><strong>Soil moisture deficit (SMD):</strong> SMD readings per field to support irrigation scheduling without over-watering.</li>
<li><strong>Pump maintenance:</strong> service records, calibration dates, and defect reports for each pump.</li>
<li><strong>EA compliance:</strong> CAMS reporting and licence condition compliance check.</li>
<li><strong>Drought management:</strong> drought management plan document storage and restriction alert records.</li>
</ul>`,
  ],

  // 93 — AI & Reproduction Records — Livestock
  [
    "How to use the AI & Reproduction module in BDE Farm Trac for cattle, sheep, pig, and goat breeding event records.",
    `<h2>AI & Reproduction Records — Livestock</h2>
<p>The AI &amp; Reproduction module provides structured breeding records for all livestock species — cattle AI and embryo transfer, ram-to-ewe service records (recorded via the Sheep Production module), boar service records, and goat reproduction events. It links to the Individual Animal Register, the Sire Register, and the Straw Inventory for complete breeding traceability.</p>
<h3>Species-specific records</h3>
<ul>
<li><strong>Cattle:</strong> AI records with straw batch number and expected calving date; embryo transfer records with donor, recipient, and embryo details; natural service bull records.</li>
<li><strong>Sheep:</strong> tupping records are held in the Sheep Production module — see the dedicated Sheep Tupping Records article.</li>
<li><strong>Pigs:</strong> AI records for gilts and sows with boar semen batch and expected farrowing date; natural service boar records.</li>
<li><strong>Goats:</strong> similar structure to cattle AI — buck service or AI records linked to the female's Individual Animal Register entry.</li>
</ul>
<h3>Sire Register</h3>
<p>All sires — bulls, rams, boars, and bucks — used for breeding are registered in the Sire Register. Each sire record captures the species, breed, registration or AI company reference, semen quality data (for AI sires), and current status. The Straw Inventory tracks semen deliveries for AI sires and decrements stock as straws are used.</p>
<h3>Expected event planner integration</h3>
<p>Expected calving, lambing, farrowing, and kidding dates calculated from breeding records appear in the Week Ahead and Month Ahead planner, allowing you to plan supervision and staffing around key events in advance.</p>`,
  ],

  // 94 — Sire Register — Recording Donor Bulls, Rams, Boars & Bucks
  [
    "How to register sires in BDE Farm Trac and link them to AI records, natural service records, and straw inventory management.",
    `<h2>Sire Register — Recording Donor Bulls, Rams, Boars & Bucks</h2>
<p>The Sire Register is a master list of all male animals — on-farm stock sires and AI donor animals — used for breeding across your livestock enterprises. Each sire registered here can be linked to AI records, natural service records, and ET (embryo transfer) records, providing a complete breeding history per sire.</p>
<h3>Adding a sire</h3>
<p>Navigate to <strong>Livestock → Sire Register</strong> and click <strong>Add Sire</strong>. Record:</p>
<ul>
<li><strong>Species and breed.</strong></li>
<li><strong>Sire name and registration number:</strong> herd book, AI company, or performance recording registration.</li>
<li><strong>Date of birth and country of origin.</strong></li>
<li><strong>EBV/genetic merit data:</strong> enter the key EBVs (milk, fertility, calving ease, carcase) for bulls used in dairy or beef AI programmes. These fields are free text — enter the figures from the AI company's catalogue.</li>
<li><strong>AI company:</strong> the supplier of semen straws if the sire is an AI sire.</li>
<li><strong>Status:</strong> Active, Sold, or Deceased.</li>
</ul>
<h3>Straw Inventory</h3>
<p>For each AI sire, the Straw Inventory tracks deliveries — date received, quantity, storage tank location, and cost. The inventory balance decrements automatically each time a straw from that sire is used in an AI record. A low-stock alert can be set at a threshold quantity to prompt reordering before straws run out.</p>`,
  ],

  // 95 — Straw Inventory — Managing AI Semen Deliveries & Stock Levels
  [
    "How to manage artificial insemination semen straw deliveries and stock levels in BDE Farm Trac.",
    `<h2>Straw Inventory — Managing AI Semen Deliveries & Stock Levels</h2>
<p>The Straw Inventory tracks the semen straws held in liquid nitrogen tanks on your farm, ensuring you always know how many straws of each sire you have available and when to reorder. It links directly to AI records, which decrement the inventory automatically each time a straw is used.</p>
<h3>Recording a semen delivery</h3>
<p>Navigate to <strong>Livestock → Straw Inventory</strong> and click <strong>New Delivery</strong>. Record:</p>
<ul>
<li><strong>Sire:</strong> selected from the Sire Register.</li>
<li><strong>AI company and order reference.</strong></li>
<li><strong>Delivery date and quantity received (straws).</strong></li>
<li><strong>Storage tank:</strong> selected from your registered liquid nitrogen tank list.</li>
<li><strong>Cost per straw (£).</strong></li>
</ul>
<p>Attach the delivery note from the AI company to the record. The inventory balance for that sire increases by the received quantity.</p>
<h3>Current stock view</h3>
<p>The Straw Inventory main view shows the current balance for each sire across all tanks — how many straws are available, when the last delivery was, and the cost value of the current stock. A low-stock threshold can be set per sire to generate an alert when the balance falls below the reorder point.</p>
<h3>Usage history</h3>
<p>Every AI record that uses a straw from the inventory creates a usage entry — showing the date, the female inseminated, and the remaining balance after the use. The full usage history for each sire is viewable from the Straw Inventory record.</p>`,
  ],

  // 96 — Lambing Records — Red Tractor Sheep Assurance
  [
    "How to record lambing events, ewe and lamb health, and mortality in BDE Farm Trac for Red Tractor Sheep Assurance.",
    `<h2>Lambing Records — Red Tractor Sheep Assurance</h2>
<p>Lambing records document one of the most labour-intensive periods in the sheep production calendar and provide the welfare evidence required by Red Tractor Sheep Assurance. BDE Farm Trac captures individual lambing events with ewe and lamb health observations, intervention records, and colostrum management notes.</p>
<h3>Recording a lambing event</h3>
<p>Navigate to <strong>Livestock → Calving &amp; Lambing Records</strong> (or via Sheep Production for flock-linked records) and click <strong>New Lambing Record</strong>. Capture:</p>
<ul>
<li><strong>Ewe tag number and flock.</strong></li>
<li><strong>Lambing date.</strong></li>
<li><strong>Number born alive, stillborn, and mummified.</strong></li>
<li><strong>Lamb tag numbers:</strong> for identified lambs — linked to Individual Animal Register entries.</li>
<li><strong>Lamb sex and birth weight (if weighed).</strong></li>
<li><strong>Ease of lambing:</strong> 1 (unassisted) through to 4 (major assistance or caesarean).</li>
<li><strong>Intervention details:</strong> type of assistance given.</li>
<li><strong>Colostrum:</strong> volume and source (own ewe, frozen bank, or proprietary colostrum supplement).</li>
<li><strong>Lamb health status:</strong> any immediate health concerns noted at birth.</li>
</ul>
<h3>Mortality recording</h3>
<p>Lambs that die before weaning are recorded in the Mortality Records section — cause of death (starvation, mismothering, hypothermia, watery mouth, trauma, or other) and disposal method. Red Tractor requires perinatal mortality to be recorded with cause analysis to demonstrate flock welfare is being actively managed.</p>`,
  ],

  // 97 — Vet Prescriptions & Medicines — Red Tractor Requirements
  [
    "What Red Tractor requires from farm medicine records and how BDE Farm Trac meets those requirements.",
    `<h2>Vet Prescriptions & Medicines — Red Tractor Requirements</h2>
<p>Red Tractor's medicine record requirements apply to all livestock schemes — Combinable Crops (for crop protection inputs), Beef &amp; Lamb, Dairy, Poultry, and Pigs. The requirements are aligned with the Veterinary Medicines Regulations 2013 but Red Tractor adds additional expectations around withdrawal period evidence and vet prescription documentation.</p>
<h3>What Red Tractor requires</h3>
<ul>
<li>A medicine record for every treatment administered to any animal on the holding.</li>
<li>The batch number recorded for every product used.</li>
<li>The withdrawal period end date calculated and recorded for every food-producing animal treatment.</li>
<li>Written veterinary authorisation (VWD) available for any product used under the Cascade or under a standing prescription.</li>
<li>Medicine stock records showing purchases, usage, and current stock levels — demonstrating that usage equals purchases (no unaccounted product).</li>
<li>Records retained for a minimum of five years.</li>
</ul>
<h3>How BDE Farm Trac meets these requirements</h3>
<p>BDE Farm Trac's Medicine Records module captures all required fields for each treatment. Batch numbers are mandatory fields — the record cannot be saved without one. Withdrawal periods are calculated automatically from the product's label data. VWD references link to the Vet Prescriptions register. Stock levels are tracked via the Trade Contacts &amp; Stock module against product batches received in Goods Received Notes, providing the medicine stock record alongside the treatment book.</p>`,
  ],

  // 98 — SFI / ELMs Actions & Agreements — Environmental Module
  [
    "How to record SFI and Environmental Land Management scheme actions and management events in BDE Farm Trac's Environmental module.",
    `<h2>SFI / ELMs Actions & Agreements — Environmental Module</h2>
<p>The Environmental module's Agreements and Actions tabs provide dedicated record keeping for the Sustainable Farming Incentive, Countryside Stewardship, and any other Environmental Land Management scheme participation. These records form the evidence base for RPA payment claim validation and scheme inspection.</p>
<h3>Key action types and their evidence requirements</h3>
<ul>
<li><strong>Herbal leys and companion crops (CAHL3, CAHL2):</strong> establishment records with seed mixture and sowing date; management event logs for any cuts, grazes, or topping operations.</li>
<li><strong>Integrated Pest Management (CIPM1, CIPM2):</strong> IPM plan document, pest monitoring records, and reduced spray inputs evidence.</li>
<li><strong>Nutrient Management (NUM1–3):</strong> soil test results, nutrient management plan, and fertiliser application records cross-referenced to the plan.</li>
<li><strong>Hedgerow management (CHRW1–2):</strong> annual cutting restriction period compliance records and GPS extent of hedgerows managed.</li>
<li><strong>Water body protection (CNUM3):</strong> buffer strip establishment records and spreading exclusion zone evidence.</li>
</ul>
<h3>Inspection preparation</h3>
<p>For RPA spot-checks, use the agreement export feature to generate a PDF of all management events for the selected agreement period. Each event includes the date, activity, area or length, and any attached photographs. This provides the inspecting officer with a clear chronological evidence file without needing to navigate through multiple screens.</p>`,
  ],

  // 99 — Slurry & Manure Management — Environmental Module
  [
    "How to use the Environmental module's slurry and manure management records for NVZ compliance, store capacity, and spreading event documentation.",
    `<h2>Slurry & Manure Management — Environmental Module</h2>
<p>The Environmental module's Slurry &amp; Manure section provides the full record-keeping framework for NVZ compliance — store registration and capacity, spreading events with nitrogen calculations, closed period monitoring, and risk assessments for high-risk spreading situations.</p>
<h3>Store capacity compliance</h3>
<p>NVZ regulations require minimum slurry storage capacity equivalent to the volume produced during the statutory closed period. Navigate to <strong>Environmental → Slurry &amp; Manure → Stores</strong> to register each store with its capacity. The compliance check calculates your minimum required capacity based on your herd size, slurry production rates (from DEFRA's Fertiliser Manual RB209), and the applicable closed period duration. A clear pass or fail status is shown.</p>
<h3>Spreading event records</h3>
<p>Each spreading event logs the field, the material type (cattle slurry, pig slurry, FYM, poultry manure, digestate), the application date, application rate, dry matter content, and nitrogen applied per hectare. The nitrogen figure feeds the NVZ budget for the field, contributing to the total applied nitrogen tracked against the field limit.</p>
<h3>Risk assessment for spreading</h3>
<p>Before spreading on steep slopes, near watercourses, or in high-risk weather conditions, complete a pre-spreading risk assessment. The assessment records the field risk factors, the precautions taken, and the name of the person who carried out the assessment. This satisfies the Nitrates Regulations requirement for documented risk assessment before organic manure applications in high-risk situations.</p>`,
  ],

  // 100 — Grain Store Quality Management — Equipment Module
  [
    "How the Equipment module's grain store quality management records integrate with the grain position tracker and TASCC compliance.",
    `<h2>Grain Store Quality Management — Equipment Module</h2>
<p>Grain store quality management records in the Equipment module cover the monitoring, conditioning, and quality assurance activities that protect grain value and satisfy TASCC and Red Tractor requirements. These records complement the stock movement data held in the Grain &amp; Crop Storage module.</p>
<h3>Store registration for quality purposes</h3>
<p>Each grain store registered in the Storage Locations register can have quality monitoring records assigned to it. The store's commodity, capacity, current stock balance, and aeration system type are the starting information for quality monitoring.</p>
<h3>Temperature and moisture records</h3>
<p>Log regular temperature probing and moisture check results (see the dedicated Grain Storage Quality Records article). When temperature or moisture results indicate a problem, the corrective action record links directly to the monitoring record that triggered it — providing a clear cause-and-response audit trail.</p>
<h3>Grain quality tests</h3>
<p>The Grain Quality Tests tab covers mycotoxin screening (DON, ZEA, AFB1, OTA, FUM), specific weight measurements, pesticide residue tests, and grain conditioning tests commissioned before loading for sale. Each test record links to the storage location and the laboratory that performed the analysis. Results outside the relevant standard (e.g. DON above 1.25 mg/kg for human food wheat) are flagged in red and trigger a mandatory decision record — either the grain is re-tested, blended, or diverted to feed use.</p>`,
  ],

  // 101 — Soil Sample Register — Format and Reference Numbers
  [
    "How soil sample references are structured in BDE Farm Trac and best practice for maintaining a consistent, auditable sampling history.",
    `<h2>Soil Sample Register — Format and Reference Numbers</h2>
<p>A clear and consistent reference number system for your soil samples makes it straightforward to match results to fields, track sampling rounds across years, and demonstrate a systematic sampling history to assessors. BDE Farm Trac accepts any reference format — your farm's own convention or the laboratory's reference.</p>
<h3>Recommended reference formats</h3>
<p>Common approaches used by farms and agronomists include:</p>
<ul>
<li><strong>Field-based:</strong> FIELD-NAME-YEAR — e.g. <em>TenAcre-2024</em> or <em>F12-2024</em>.</li>
<li><strong>Sampling round:</strong> ROUND-FIELD — e.g. <em>R3-F12</em> where R3 is the third sampling round in your four-year cycle.</li>
<li><strong>Laboratory reference:</strong> use the lab's own sample number directly if you receive a sample certificate with a unique lab reference — typically in a format like <em>ABC12345/24</em>.</li>
</ul>
<h3>Multiple samples per field</h3>
<p>A single field may have multiple samples taken in the same round — for example, if the field has noticeably different soil types, or if you split the field for different management after the last sampling. Each sub-sample is entered as a separate record with a suffix: <em>TenAcre-2024-A</em>, <em>TenAcre-2024-B</em>. The field detail view shows all samples for the field in date order.</p>
<h3>Attaching laboratory certificates</h3>
<p>Attach the PDF or scanned laboratory report to each sample record using the document attachment feature. Inspectors and agronomists can view the original certificate from the record without needing to search through paper files.</p>`,
  ],

  // 102 — Farm Insurance Register
  [
    "How to record farm insurance policies in BDE Farm Trac, including coverage types, sums insured, renewal dates, and policy documents.",
    `<h2>Farm Insurance Register</h2>
<p>The Farm Insurance Register provides a central, searchable record of all your farm insurance policies — farm combined, public liability, employer's liability, product liability, crop insurance, livestock insurance, vehicle insurance, and any specialist policies. Keeping policy details in one place ensures renewal dates are not missed and coverage levels can be checked quickly when needed.</p>
<h3>Recording a policy</h3>
<p>Navigate to <strong>Finance &amp; Business → Insurance Register</strong> and click <strong>Add Policy</strong>. Record:</p>
<ul>
<li><strong>Policy type:</strong> Farm Combined, Public Liability, Employer's Liability, Product Liability, Crop, Livestock, Motor, Plant, or Other.</li>
<li><strong>Insurer name and broker name.</strong></li>
<li><strong>Policy number.</strong></li>
<li><strong>Coverage start and expiry date.</strong></li>
<li><strong>Sum insured (£) and annual premium (£).</strong></li>
<li><strong>Key coverage details:</strong> brief note of what is covered (e.g. all farm buildings and contents up to £2.5m, all farm vehicles).</li>
</ul>
<p>Attach the policy schedule document to the record.</p>
<h3>Renewal alerts</h3>
<p>Policies approaching renewal (within 60 days) are flagged with amber warnings on the Insurance Register dashboard card. An SMS alert is sent to opted-in managers at 60 days before expiry.</p>
<h3>Coverage cross-reference</h3>
<p>The Farm Services &amp; Contracting module cross-references the insurance register to flag when equipment hire or contracting jobs are booked outside the current public liability or employer's liability policy period.</p>`,
  ],

  // 103 — Purchase Orders — Raising and Managing POs
  [
    "How to raise, approve, track, and receive against Purchase Orders in BDE Farm Trac.",
    `<h2>Purchase Orders — Raising and Managing POs</h2>
<p>The Purchase Order system in BDE Farm Trac's Trade Contacts &amp; Stock module provides formal procurement control — auto-generated reference numbers, multi-line orders, a manager approval workflow for flagged products, and a seven-stage status workflow from Draft through to Fully Received.</p>
<h3>Raising a Purchase Order</h3>
<p>Navigate to <strong>Trade Contacts &amp; Stock → Purchase Orders</strong> and click <strong>New PO</strong>. Select the supplier from your registered supplier directory. Add line items — each with a product from your stock catalogue (or a free-text description), quantity, and unit price. The order total is calculated automatically. Set the expected delivery date and add any notes for the supplier.</p>
<h3>Approval workflow</h3>
<p>If any line item includes a product flagged as requiring manager approval in the product catalogue, the PO is automatically placed into <em>Awaiting Approval</em> status. A Pending Approvals panel appears on the Trade Contacts &amp; Stock page for eligible managers showing the PO number, submitter name, estimated value, and submission date. The manager clicks <strong>Approve</strong> (moving to Outstanding) or <strong>Reject</strong> (returning to Draft for amendment).</p>
<h3>Status workflow</h3>
<p>The seven PO status tabs are: Draft → Awaiting Approval → Outstanding → Sent → Partially Received → Fully Received. Each status has a live count badge. Move between statuses as the order progresses.</p>
<h3>Goods Received Notes</h3>
<p>When stock arrives, raise a GRN against the open PO. The received quantities update the PO line items. When all lines are fully received, the PO moves to Fully Received and stock levels in the Product Catalogue are updated.</p>`,
  ],

  // 104 — Goods Received Notes (GRN) — Logging Deliveries and Linking to POs
  [
    "How to record goods received notes (GRNs) in BDE Farm Trac, link them to Purchase Orders, and update stock levels.",
    `<h2>Goods Received Notes (GRN) — Logging Deliveries and Linking to POs</h2>
<p>Goods Received Notes document every delivery of stock, inputs, or materials to the farm. Linking GRNs to Purchase Orders completes the three-way match (PO → GRN → Supplier Invoice) required for a compliant procurement audit trail. GRN batch and lot numbers are carried forward to spray application records for full batch traceability.</p>
<h3>Creating a GRN</h3>
<p>Navigate to <strong>Trade Contacts &amp; Stock → Goods Received</strong> and click <strong>New GRN</strong>. The auto-generated reference follows the format GRN-YYYY-0001. Link to an open PO to pre-populate the supplier and expected line items. For each received line, confirm the quantity received, the batch number, and the lot number from the delivery label. The received quantity can differ from the ordered quantity — the GRN records what was actually delivered.</p>
<h3>Batch number capture</h3>
<p>Batch and lot numbers entered at the GRN stage are the key to food safety batch traceability. For agrochemical products, the batch number is the same one that should appear on the spray application record when that product is used. BDE Farm Trac carries the batch number forward from the GRN to the spray application product picker, ensuring consistency without re-entry.</p>
<h3>Stock level updates</h3>
<p>When the GRN is saved, the received quantities are added to the stock levels in the Product Catalogue. The running stock balance for each product shows the total received (all GRNs) minus the total used (all consumption records from spray applications, cleanouts, and manual adjustments).</p>`,
  ],

  // 105 — Batch & Lot Traceability in Spray Application Records
  [
    "How batch and lot numbers flow from goods received notes to spray application records in BDE Farm Trac for Red Tractor and BASIS traceability requirements.",
    `<h2>Batch & Lot Traceability in Spray Application Records</h2>
<p>Red Tractor Combinable Crops and BASIS require spray records to include the batch number of the product applied — not just the product name. This enables product recall traceability from the field application back to the specific batch supplied by the manufacturer. BDE Farm Trac links batch numbers from goods receipt through to the spray application record automatically.</p>
<h3>How batch numbers flow</h3>
<ol>
<li><strong>Product received:</strong> a GRN is logged against a Purchase Order. The batch number from the delivery label is entered on the GRN line item.</li>
<li><strong>Product selected for application:</strong> when creating a spray application record, the product is selected from the catalogue. The system shows available batches for the selected product — the batch number from the most recent GRN receipt is shown by default.</li>
<li><strong>Spray record saved:</strong> the batch number is stored on the spray application record alongside the product name, dose, and field.</li>
</ol>
<h3>What this enables</h3>
<p>If a product recall is issued by the manufacturer or CRD (Chemicals Regulation Directorate), you can immediately identify all fields where that batch was used — by searching for the batch number across spray application records. This is the evidence needed to notify your buyer, implement any required management actions, and demonstrate that potentially affected crops have been identified.</p>
<h3>Manual batch entry</h3>
<p>If the product was not received through the GRN system, you can enter the batch number manually in the spray application record. The batch number field is not optional for products applied to food crops.</p>`,
  ],

  // 106 — Farm Planner — Week Ahead & Month Ahead View
  [
    "How to use the Farm Planner in BDE Farm Trac to view and manage upcoming compliance deadlines, tasks, and key agricultural dates.",
    `<h2>Farm Planner — Week Ahead & Month Ahead View</h2>
<p>The Farm Planner consolidates compliance deadlines, assigned tasks, livestock events, and agri-environment management dates into a forward-looking calendar. It is the first place to look each morning to confirm what needs attention in the next seven to thirty days.</p>
<h3>Navigating the planner</h3>
<p>Navigate to <strong>Planner → Farm Planner</strong>. Toggle between <strong>Week Ahead</strong> (next seven days, detail list) and <strong>Month Ahead</strong> (current month, calendar grid) using the view selector. Use the arrow buttons to navigate forward and back through weeks or months.</p>
<h3>Event types shown</h3>
<ul>
<li><strong>Compliance deadlines:</strong> medicine withdrawal end dates, certificate expiry dates, BCMS reporting deadlines, NVZ closed period boundaries.</li>
<li><strong>Assigned tasks:</strong> tasks with a due date from the Task Board, shown under the due date with the assignee's name.</li>
<li><strong>Livestock events:</strong> expected calvings and lambings (from scanning and AI records), expected farrowing dates.</li>
<li><strong>Agri-environment dates:</strong> CS and SFI management deadlines (e.g. hedge cutting exclusion period end dates).</li>
<li><strong>Equipment due dates:</strong> MOT and NSTS calibration due dates from the Equipment Register.</li>
</ul>
<h3>Printing the planner</h3>
<p>The Print button produces a formatted planner output — useful for sharing at a weekly farm team meeting or posting on the office notice board for staff without app access.</p>`,
  ],

  // 107 — Grants & Funding Register — Tracking FETF and Scheme Applications
  [
    "How to record FETF, Countryside Productivity, and other grant applications in BDE Farm Trac, including payment status and claim tracking.",
    `<h2>Grants & Funding Register — Tracking FETF and Scheme Applications</h2>
<p>The Grants &amp; Funding Register provides a simple home for tracking all farm capital grant applications, agri-environment payment claims, and research and development funding — from application to final payment. It helps you manage the multiple deadlines, reference numbers, and payment schedules that come with funding from RPA, Defra, NatureScot, and other bodies.</p>
<h3>Recording a grant application</h3>
<p>Navigate to <strong>Finance &amp; Business → Grants &amp; Funding</strong> and click <strong>New Record</strong>. Capture:</p>
<ul>
<li><strong>Grant scheme name:</strong> e.g. Farming Equipment and Technology Fund (FETF), Countryside Productivity Small Grant, Farming in Protected Landscapes, or other.</li>
<li><strong>Application reference number.</strong></li>
<li><strong>Application date.</strong></li>
<li><strong>Amount applied for (£).</strong></li>
<li><strong>Funding body:</strong> RPA, Defra, NatureScot, DARD, or other.</li>
<li><strong>Status:</strong> Submitted, Under Assessment, Approved, Rejected, Claim Submitted, Paid, or Withdrawn.</li>
<li><strong>Eligible items:</strong> brief description of what the grant covers (equipment, infrastructure, training, etc.).</li>
<li><strong>Payment date and amount received (£).</strong></li>
</ul>
<h3>Claim deadlines</h3>
<p>Many capital grant schemes require eligible items to be purchased, installed, and claimed within a fixed window. Record the claim deadline in the notes field and set a reminder from the Task Board to ensure claims are not forfeited through a missed deadline.</p>`,
  ],

  // 108 — Inspections Module — Tabs, Non-Conformances and Farm Assurance Certificates
  [
    "A detailed guide to the Inspections module tabs, non-conformance tracking, and assurance certificate storage in BDE Farm Trac.",
    `<h2>Inspections Module — Tabs, Non-Conformances and Farm Assurance Certificates</h2>
<p>The Inspections module is structured into four tabs: Self Assessment, Inspection Records, Non-Conformances, and Farm Assurance Certificates. Together these provide a complete inspection management cycle from pre-visit preparation through to post-visit corrective action and certificate storage.</p>
<h3>Self Assessment tab</h3>
<p>Complete the structured self-assessment checklist before an assessor visit. Select the scheme (Red Tractor Combinable Crops, Dairy, Beef &amp; Lamb, Poultry, Fresh Produce, or other) and work through each section. Green = all items compliant, amber = partially complete, red = outstanding non-compliances. Print the completed checklist to present to the assessor at the start of the visit.</p>
<h3>Inspection Records tab</h3>
<p>After each visit, record the inspection outcome: date, inspecting body, assessor name, scheme inspected, overall result (Pass, Conditional Pass, or Fail), and a summary of the visit. Attach any written assessor report or provisional outcome letter.</p>
<h3>Non-Conformances tab</h3>
<p>All non-conformances raised across all inspections appear here. Each NC has a status (Open, In Progress, or Resolved), a severity, a responsible person, and a target resolution date. Resolved NCs require evidence of corrective action. The register can be filtered by status to identify all outstanding items requiring attention.</p>
<h3>Farm Assurance Certificates tab</h3>
<p>Store your Red Tractor, Lion Quality, LEAF Marque, BRCGS, or other scheme certificates here. Each certificate shows the issue date, expiry date, and current status (Active, Expired, or Suspended). Amber warnings at 90 days and red warnings at expiry ensure renewals are not missed.</p>`,
  ],

  // 109 — Risk Assessments — Using Hazard Templates and Recording COSHH Assessments
  [
    "How to complete risk assessments and COSHH assessments in BDE Farm Trac using the hazard template library.",
    `<h2>Risk Assessments — Using Hazard Templates and Recording COSHH Assessments</h2>
<p>The Health, Safety &amp; Risk module provides a structured five-step risk assessment process for general workplace hazards and a dedicated COSHH assessment form for hazardous substances. A library of common farm hazard templates speeds up assessment creation by pre-populating typical hazards and control measures for common activities.</p>
<h3>Using hazard templates</h3>
<p>Navigate to <strong>Health, Safety &amp; Risk → Risk Assessments</strong> and click <strong>New Assessment</strong>. The template library offers pre-populated starting points for common farm activities — working at height, operating tractors and machinery, manual handling, slurry and confined spaces, chemical handling, livestock handling, and more. Select the most relevant template and customise it for your specific circumstances.</p>
<h3>The five-step risk assessment</h3>
<ol>
<li><strong>Identify the hazards</strong> relevant to this activity.</li>
<li><strong>Decide who might be harmed and how.</strong></li>
<li><strong>Evaluate the risks and current controls.</strong></li>
<li><strong>Determine further action needed</strong> to reduce residual risk.</li>
<li><strong>Record findings</strong> — this completed form is your record.</li>
</ol>
<h3>COSHH assessments</h3>
<p>For each hazardous substance, a separate COSHH assessment form captures the substance classification, routes of exposure, occupational exposure limits (WELS), control measures in place, PPE requirements, emergency procedures, and assessment review date. Link the completed assessment to the relevant supplier product in Trade Contacts &amp; Stock so it appears whenever that product is referenced in spray or treatment records.</p>`,
  ],

  // 110 — Waste Disposal — EWC Codes and Duty of Care
  [
    "How EWC codes work in BDE Farm Trac's waste disposal records and what duty of care obligations apply to farm waste.",
    `<h2>Waste Disposal — EWC Codes and Duty of Care</h2>
<p>The European Waste Catalogue (EWC) is the statutory classification system for controlled waste in the UK. Every waste transfer note must include the EWC code for the waste being moved. BDE Farm Trac includes a reference list of the most common farm waste EWC codes to help you complete waste records accurately.</p>
<h3>Common farm waste EWC codes</h3>
<ul>
<li><strong>02 01 04</strong> — Waste plastics (excluding packaging) — silage wrap, bale wrap, bags.</li>
<li><strong>02 01 08*</strong> — Agrochemical wastes containing hazardous substances — empty chemical containers (asterisk = hazardous).</li>
<li><strong>02 01 09</strong> — Agrochemical wastes not covered by 02 01 08 — triple-rinsed containers accepted at authorised sites.</li>
<li><strong>16 01 03</strong> — End-of-life tyres.</li>
<li><strong>16 02 13*</strong> — Discarded equipment containing hazardous components — old electronics.</li>
<li><strong>15 01 01</strong> — Paper and cardboard packaging.</li>
<li><strong>15 01 02</strong> — Plastic packaging.</li>
</ul>
<h3>Duty of care obligations</h3>
<p>The duty of care under Section 34 of the Environmental Protection Act 1990 requires you to:</p>
<ul>
<li>Store waste safely and securely to prevent escape.</li>
<li>Only transfer waste to an authorised waste carrier (check the EA public register).</li>
<li>Complete a waste transfer note for every transfer and keep copies for two years.</li>
<li>Accurately describe the waste on the transfer note using EWC codes.</li>
</ul>
<p>BDE Farm Trac's Waste Disposal records serve as your waste transfer note register. Retain these records for the legally required two-year period — they are permanently stored in the system and cannot be deleted.</p>`,
  ],

  // 111 — Documents Module — Red Tractor Required Documents Checklist
  [
    "How to use the Red Tractor Required Documents Checklist in BDE Farm Trac to ensure all mandatory documents are held and current before an assessor visit.",
    `<h2>Documents Module — Red Tractor Required Documents Checklist</h2>
<p>Red Tractor assessors expect to see a specific set of policy documents, plans, and certificates at every inspection. The Documents module includes a scheme-specific Required Documents Checklist that shows exactly which documents must be held for your active scheme(s) and whether each document is present and current in your repository.</p>
<h3>Accessing the checklist</h3>
<p>Navigate to <strong>Documents → Required Documents Checklist</strong> and select your scheme (Combinable Crops, Beef &amp; Lamb, Dairy, Fresh Produce, or Poultry). The checklist lists every required document with its status:</p>
<ul>
<li><strong>Present and current:</strong> a document of this type is held and its review date has not passed. Green status.</li>
<li><strong>Present but due for review:</strong> a document is held but its review or expiry date is within 90 days. Amber status.</li>
<li><strong>Missing:</strong> no document of this type has been uploaded. Red status.</li>
</ul>
<h3>Common required documents</h3>
<ul>
<li>Biosecurity Plan (reviewed annually)</li>
<li>Health and Safety Policy (if you employ staff)</li>
<li>Waste Management Plan</li>
<li>Integrated Pest Management Plan (if applicable)</li>
<li>Nutrient Management Plan (FACTS adviser signed)</li>
<li>Soil Management Plan</li>
<li>Emergency Procedures document</li>
<li>Red Tractor scheme certificate (current)</li>
</ul>
<h3>Uploading a missing document</h3>
<p>Click the upload icon next to any missing or out-of-date item to open the document upload form pre-filled with the correct document type. Set an appropriate review date — typically annually for policy documents — so the status turns green immediately on upload.</p>`,
  ],

  // 112 — Crop Contracts — Recording Grain Marketing Agreements
  [
    "How to record grain marketing contracts, basis contracts, and pool scheme positions in BDE Farm Trac.",
    `<h2>Crop Contracts — Recording Grain Marketing Agreements</h2>
<p>The Crop Contracts register in BDE Farm Trac covers three types of grain marketing agreement — spot sales, forward contracts, and pool scheme positions. Each type has a dedicated record structure that captures the specific commercial and traceability fields required for the agreement type.</p>
<h3>Spot sales</h3>
<p>A spot sale is a single transaction at an agreed price on the day. Record the buyer, commodity, variety, quantity (tonnes), price (£/tonne), grade specification, weighbridge ticket reference, and any quality premium or penalty applied.</p>
<h3>Forward contracts</h3>
<p>A forward contract commits to selling a specified tonnage at a fixed price for future delivery. Record the merchant contract reference, buyer, commodity, contracted tonnage, price (£/tonne), delivery period start and end, and any quality specification. As individual loads are called off under the contract, they are linked to the contract record via the grain sale call-off system — the contract balance and progress bar update automatically with each linked sale.</p>
<h3>Pool scheme positions</h3>
<p>Pool scheme positions are recorded with the pool operator, commodity, crop year, total tonnes committed, estimated outturn price, and settlement status (Open, Settled). As pool payments are received, individual payment tranches can be logged against the pool record with payment date and price per tonne received.</p>`,
  ],

  // 113 — Haulage Module — Movement Records, Grain Position and Haulier Directory
  [
    "How to use the Haulage module in BDE Farm Trac to manage grain movement records, the haulier directory, and the grain position tracker.",
    `<h2>Haulage Module — Movement Records, Grain Position and Haulier Directory</h2>
<p>The Haulage module is the operational hub for all grain movements on and off your farm — from field to store at harvest, from store to merchant throughout the marketing year, and any on-farm transfers between storage locations. It drives the Grain Position tracker and links to Forward Contracts via the call-off system.</p>
<h3>Haulier directory</h3>
<p>Maintain a directory of your hauliers in <strong>Haulage → Hauliers</strong>. Record the company name, primary driver(s), vehicle registrations, and operator licence number. When logging a movement, select the haulier to auto-populate their vehicle and licence details on the movement record — eliminating re-entry for regular hauliers.</p>
<h3>Movement records</h3>
<p>Each movement record captures: date, commodity, source location, destination, quantity (tonnes), moisture content, grade, weighbridge ticket number, and the linked haulier. Attach the weighbridge ticket or delivery note. Movements update the source and destination stock balances immediately.</p>
<h3>Source record linkage</h3>
<p>Every movement can optionally be linked to a source record — a harvest record (for field-to-store movements), a grain sale record (for sale movements), or a dispatch plan. The movement table shows a reference chip for any linked record. Click the chip to open the linked document without leaving the movement table.</p>
<h3>Grain position</h3>
<p>The Grain Position tab summarises the current stock position by commodity across all registered storage locations. Total harvested, total moved out, and current balance are shown — updated in real time as movements are added or removed. Year filter defaults to the current crop year.</p>`,
  ],

  // 114 — Mobile App — Offline Data and How Reference Pickers Work
  [
    "How offline data storage and reference pickers work in the BDE Farm Trac mobile app when there is no internet connectivity.",
    `<h2>Mobile App — Offline Data and How Reference Pickers Work</h2>
<p>The BDE Farm Trac mobile app is designed to work in areas with no mobile signal — common on many UK farms. When offline, the app uses locally cached reference data to populate pickers and saves new records to a local queue that syncs automatically when connectivity is restored.</p>
<h3>Reference data caching</h3>
<p>When you open the mobile app with an internet connection, reference data is downloaded and cached on your device. This includes:</p>
<ul>
<li>Field register (names, areas, OS references)</li>
<li>Livestock register (herds, flocks, individual animal ear tags)</li>
<li>Staff list (names and roles)</li>
<li>Vine blocks (for viticulture screens)</li>
<li>Product catalogue (for spray and stock records)</li>
<li>Herd register and poultry flocks</li>
</ul>
<p>Pull down on the home screen to force a cache refresh — do this when you know reference data has changed (new fields added, new staff members, new vine blocks registered) to ensure pickers are up to date.</p>
<h3>Creating records offline</h3>
<p>Spray applications, livestock events, environmental logs, harvest records, and all other record types can be created with no signal. Records created offline show a Pending Sync indicator. They are uploaded in the order they were created once connectivity returns.</p>
<h3>Pending sync tray</h3>
<p>The badge count in the top toolbar of the mobile app shows how many records are waiting to sync. Tap the badge to see the pending sync list. All synced records appear in the dashboard immediately after upload — no manual merge step is required.</p>`,
  ],

  // 115 — Fuel & Energy Management — HMRC Compliance, Oil Storage, LPG and Grid Energy
  [
    "How to record fuel drawdowns, oil storage records, and energy consumption in BDE Farm Trac for HMRC compliance and carbon reporting.",
    `<h2>Fuel & Energy Management — HMRC Compliance, Oil Storage, LPG and Grid Energy</h2>
<p>The Fuel &amp; Energy module tracks all fuel and energy use on the farm — diesel and red diesel drawdowns, petrol, LPG, heating oil, and grid electricity consumption. It supports HMRC compliance for fuel duty entitlement records, feeds the Carbon Auto-Calculator, and provides the consumption history needed for renewable energy investment appraisals.</p>
<h3>Fuel drawdown records</h3>
<p>Navigate to <strong>Fuel &amp; Energy → Drawdowns</strong> and click <strong>New Drawdown</strong>. Each record captures the fuel type (red diesel, white diesel, petrol, heating oil, LPG, AdBlue), the date, the quantity drawn (litres), the vehicle or equipment it was used in, and the operator. For red diesel, record the legitimate use (agriculture, heating, water pumping) to satisfy HMRC duty entitlement evidence requirements.</p>
<h3>Oil storage records</h3>
<p>Oil storage tanks above 200 litres must meet the Control of Pollution (Oil Storage) (England) Regulations 2001 requirements. Register each tank in <strong>Fuel &amp; Energy → Storage</strong> with its capacity, construction type (single-skin, double-skin, bunded), and last inspection date. Secondary containment records are stored against each tank.</p>
<h3>LPG records</h3>
<p>LPG consumption is logged similarly to diesel — tank or cylinder deliveries are recorded as stock receipts, and drawdowns are logged per use or as a bulk monthly figure. The running balance shows current LPG stock for procurement planning.</p>
<h3>Solar generation</h3>
<p>Solar panel generation records are logged in <strong>Fuel &amp; Energy → Solar Generation</strong>. Monthly generation (kWh) feeds the Carbon Auto-Calculator to calculate CO₂ avoided at the UK grid emission factor, contributing to your carbon sequestration/avoidance total.</p>`,
  ],

  // 116 — Feed Management — UFAS/FEMAS Traceability, Medicated Feed and Stock Levels
  [
    "How to manage feed deliveries, UFAS/FEMAS supplier compliance, medicated feed records, and stock levels in BDE Farm Trac.",
    `<h2>Feed Management — UFAS/FEMAS Traceability, Medicated Feed and Stock Levels</h2>
<p>Feed management records are a core Red Tractor livestock requirement. Every feed delivery must be traceable to a UFAS or FEMAS-accredited supplier, and medicated feed must be documented with active ingredient and withdrawal period details. BDE Farm Trac's Feed Management module covers all of this.</p>
<h3>Supplier accreditation tracking</h3>
<p>Suppliers in the Trade Contacts &amp; Stock module can be flagged as UFAS (Universal Feed Assurance Scheme) or FEMAS (Feed Materials Assurance Scheme) accredited. The accreditation certificate number and expiry date are recorded. When logging a feed delivery from a supplier whose accreditation is approaching expiry or has lapsed, a warning banner appears on the delivery form prompting you to check the supplier's current status.</p>
<h3>Medicated feed records</h3>
<p>The Medicated Feed tab records deliveries of feed containing licensed coccidiostats, zinc oxide (at therapeutic concentration for piglets), or any other licensed additive. Each record captures the feed type, additive name and concentration, the batch number, quantity received, withdrawal period, and clearance date. Animals fed medicated feed are flagged with an active withdrawal status in the Individual Animal Register.</p>
<h3>Stock levels</h3>
<p>Feed stock levels are maintained per feed type and per storage location (bin, silo, or store). Deliveries (GRN receipts) add to stock. Manual consumption records or batch usage entries reduce stock. Low-stock alerts can be set at reorder threshold quantities for each feed type.</p>`,
  ],

  // 117 — Compliance & Plans — Feed Contingency Plan, Disease Log and Feed Recalls
  [
    "How to use the Compliance & Plans module in BDE Farm Trac for feed contingency plans, disease incident logging, and feed recall records.",
    `<h2>Compliance & Plans — Feed Contingency Plan, Disease Log and Feed Recalls</h2>
<p>The Compliance &amp; Plans module houses the standing compliance documents, incident records, and reactive response records that do not fit neatly into the operational modules. The three key elements covered here are the Feed Contingency Plan, the Disease &amp; Incident Log, and Feed Recall records.</p>
<h3>Feed Contingency Plan</h3>
<p>Navigate to <strong>Compliance &amp; Plans → Feed Contingency</strong> to document your standing feed contingency plan. This is a Red Tractor requirement that must be reviewed annually. The plan records: primary feed supplier contact details, alternative supplier(s) that could supply at short notice, minimum on-farm stock holding (days' supply) maintained as a buffer, and the action steps to follow if primary supply is disrupted.</p>
<h3>Disease &amp; Incident Log</h3>
<p>The Disease &amp; Incident Log records formal disease incidents — including suspected or confirmed notifiable disease events. Each incident record captures: incident type (notifiable disease, disease outbreak, suspected poisoning, pollution incident, or other), species affected, date of discovery, immediate actions taken, APHA reference number, vet details, movement restrictions applied, and the outcome and lessons learned. For notifiable diseases, the record includes the APHA contact number (03000 200 301) as a prompt to ensure mandatory notification is not delayed.</p>
<h3>Feed Recall records</h3>
<p>When a feed manufacturer or UFAS scheme operator issues a recall, log the recall in <strong>Compliance &amp; Plans → Feed Recalls</strong>. Record the feed product name, the recall reference number, the batch numbers affected, the date the recall was received, and the action taken — stock withdrawn, returned to supplier, or destroyed. Attach the recall notice from the manufacturer.</p>`,
  ],

  // 118 — Sales & Trading — Recording Farm Output
  [
    "An overview of how to record grain, livestock, milk, and direct farm sales in BDE Farm Trac's Finance & Business module.",
    `<h2>Sales & Trading — Recording Farm Output</h2>
<p>The Finance &amp; Business module's sales recording covers all forms of farm output — grain and combinable crop sales, livestock sales (deadweight and mart), milk statements, poultry batch settlements, egg sales, and direct farm gate sales. Each sale type has a specific record structure matching the settlement documents your buyer or processor provides.</p>
<h3>Grain sales</h3>
<p>Navigate to <strong>Finance &amp; Business → Sales → Grain</strong>. Record spot, forward contract call-off, pool scheme, and ex-store sales with buyer, commodity, variety, quantity, price, moisture, grade, weighbridge ticket reference, and invoice number. Link forward contract call-offs to the parent contract to update the contract progress automatically.</p>
<h3>Livestock sales</h3>
<p>Deadweight kill sheet records capture: kill date, species, number of animals, cold deadweight (kg), EUROP grade and fat class, pence/kg DW, and net settlement value. Attach the kill sheet or settlement PDF. Mart and auction records capture: lot number, auction mart, head count, price per head or per kg, auctioneer reference, and buyer name. Both sale types can be linked to the corresponding off-farm BCMS movement record to create a full audit trail from movement notification to settlement.</p>
<h3>Direct sales</h3>
<p>Farm shop, box scheme, farmers market, restaurant, and online sales are recorded in the Direct Sales tab — product, quantity, unit price, customer name (optional), payment method, and payment status (Invoiced, Paid, or Overdue). Outstanding invoices are flagged in amber until the payment status is updated to Paid.</p>`,
  ],

  // 119 — Continuous Soil Monitoring — Sensor Probes and Readings
  [
    "How to record continuous soil monitoring sensor data in BDE Farm Trac, including probe registration, readings, and alerts.",
    `<h2>Continuous Soil Monitoring — Sensor Probes and Readings</h2>
<p>Continuous soil monitoring probes measure soil moisture, temperature, and electrical conductivity at set intervals throughout the growing season. The data helps optimise irrigation scheduling, seeding decisions, and fertiliser timing. BDE Farm Trac provides a sensor register and a readings log for continuous soil monitoring alongside the point-in-time soil sample register.</p>
<h3>Registering a sensor probe</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Soil Monitoring → Sensor Register</strong> and click <strong>Add Probe</strong>. Record the probe name, manufacturer and model, serial number, installation date, field location, and installation depth (cm). A probe can have multiple sensors at different depths — record each depth as a separate sensor on the probe record.</p>
<h3>Logging readings</h3>
<p>Readings can be entered manually or, where the probe provider supports data export, uploaded from a CSV file. Each reading captures the date and time, probe identifier, depth, soil moisture (% VWC), soil temperature (°C), and electrical conductivity (dS/m) where measured. The readings are displayed as a time-series chart on the probe's record page.</p>
<h3>Irrigation scheduling support</h3>
<p>The soil moisture readings feed the Soil Moisture Deficit (SMD) section in the Water &amp; Irrigation module, where they can be compared against crop available water capacity thresholds for the soil type. When the SMD approaches the trigger threshold for the crop at the current growth stage, an amber alert prompts an irrigation scheduling review.</p>`,
  ],

  // 120 — Organic Compliance Overview & Certification Tracking
  [
    "How BDE Farm Trac supports organic farm compliance, covering certification tracking, organic inspection records, and the organic input register.",
    `<h2>Organic Compliance Overview & Certification Tracking</h2>
<p>The Organic module in BDE Farm Trac provides comprehensive record keeping for UK organic certification under the UK Organic Regulations 2020. It covers the full range of evidence required by Soil Association Certification, OF&amp;G (Organic Farmers &amp; Growers), and other UK-approved certifiers for both arable and livestock organic enterprises.</p>
<h3>Organic certificate register</h3>
<p>Navigate to <strong>Organic → Certificates</strong> to store your current organic certificate, previous certificates, and any conversion documentation. Record the certifying body, certificate number, scope (whole farm, specific enterprises, or specific products), issue date, and expiry date. Certificates approaching renewal are flagged at 90 days and 30 days with amber and red alerts.</p>
<h3>Annual inspection records</h3>
<p>Each annual organic inspection is recorded in the Inspections tab — inspection date, inspecting certifier and inspector name, inspection type (scheduled annual, unannounced, or follow-up), and outcome (Certified, Certified with Conditions, or Action Required). Attach the inspection report. Outstanding conditions and actions are tracked with resolution status and target dates.</p>
<h3>Parallel production</h3>
<p>If you grow both organic and non-organic crops (parallel production), you must maintain clear separation records. The Field Conversion Tracker shows each field's organic status (In Conversion, Fully Organic, Conventional) and the conversion start date, providing the audit trail to confirm that organic and non-organic products are managed and stored separately.</p>`,
  ],

  // 121 — Recording Organic Inspections & Attaching Documents
  [
    "How to record annual organic certification inspections, attach the inspection report, and track outstanding conditions in BDE Farm Trac.",
    `<h2>Recording Organic Inspections & Attaching Documents</h2>
<p>Annual organic inspections are conducted by your certification body (Soil Association, OF&amp;G, or other UK-approved certifier). The inspection record in BDE Farm Trac captures the key details of the visit and provides a home for the inspection report and any conditions issued.</p>
<h3>Recording the inspection</h3>
<p>Navigate to <strong>Organic → Inspections</strong> and click <strong>New Inspection</strong>. Record:</p>
<ul>
<li><strong>Inspection date.</strong></li>
<li><strong>Certifying body and inspector name.</strong></li>
<li><strong>Inspection type:</strong> Annual Scheduled, Unannounced, Follow-up, or Initial Conversion Inspection.</li>
<li><strong>Areas inspected:</strong> crops, livestock, inputs, storage, processing, or all.</li>
<li><strong>Outcome:</strong> Certified (annual certificate confirmed), Certified with Conditions (certificate issued subject to corrective actions), or Action Required (certificate withheld pending major corrections).</li>
</ul>
<p>Attach the full inspection report PDF from the certifying body.</p>
<h3>Tracking conditions</h3>
<p>For any conditions attached to certification, create a condition record from the inspection. Each condition captures the clause or standard breached, the corrective action required, the deadline set by the certifier, and the resolution status. Unresolved conditions approaching their deadline are flagged in amber on the Organic dashboard. When resolved, attach any evidence submitted to the certifier and record the certifier's confirmation of acceptance.</p>`,
  ],

  // 122 — Organic Input Register & Restricted Inputs
  [
    "How to maintain the organic input register in BDE Farm Trac, including approved products, restricted inputs, and certifier approval records.",
    `<h2>Organic Input Register & Restricted Inputs</h2>
<p>Organic certification requires that all inputs used in crop production (fertilisers, soil conditioners, pest control products, and processing aids) are permitted under the UK Organic Regulations 2020. The Organic Input Register provides a product-by-product record confirming the approval status of every input used on your certified land.</p>
<h3>Recording an organic input</h3>
<p>Navigate to <strong>Organic → Input Register</strong> and click <strong>Add Input</strong>. For each product used, record:</p>
<ul>
<li><strong>Product name and manufacturer.</strong></li>
<li><strong>Input type:</strong> Fertiliser, Soil Conditioner, Pesticide, Biostimulant, Processing Aid, or Other.</li>
<li><strong>UK Organic Regulations status:</strong> Permitted (listed in Annex I or II), Restricted (permitted with conditions), Derogation Required (not permitted without a specific derogation), or Not Permitted.</li>
<li><strong>Certifier approval reference:</strong> if the certifier has specifically approved this product for use on your holding, record their approval reference number and the date of approval.</li>
<li><strong>Application records:</strong> link to spray application records where this product has been used.</li>
</ul>
<h3>Restricted inputs and derogations</h3>
<p>For inputs that are restricted or require a derogation, record the justification for use and the certifier's specific approval (or derogation) reference. Using a restricted input without certifier approval is a certification breach. The Input Derogations section of the Organic module (for crops) or Organic Viticulture module (for viticulture) manages the formal derogation case workflow.</p>`,
  ],

  // 123 — Field Conversion Tracker & Parallel Production
  [
    "How to track organic field conversion status and manage parallel production records in BDE Farm Trac.",
    `<h2>Field Conversion Tracker & Parallel Production</h2>
<p>Organic certification requires a minimum two-year conversion period for arable land and two years for grassland (three years for perennial crops) before the land can be certified as fully organic. The Field Conversion Tracker in BDE Farm Trac records the conversion status of each field, the conversion start date, and the expected full organic date.</p>
<h3>Recording field conversion status</h3>
<p>Navigate to <strong>Organic → Field Conversion</strong>. Each field from your Field Register can be assigned a conversion status:</p>
<ul>
<li><strong>Conventional:</strong> not part of the organic unit.</li>
<li><strong>In Conversion — Year 1:</strong> conversion started, first 12 months.</li>
<li><strong>In Conversion — Year 2:</strong> second year of conversion.</li>
<li><strong>Fully Organic:</strong> conversion period complete, eligible for organic certification.</li>
</ul>
<p>Record the conversion start date for each in-conversion field. The system calculates the expected fully-organic date based on the crop type and your certifier's required conversion period.</p>
<h3>Parallel production</h3>
<p>Parallel production — growing the same variety of the same crop as both organic and non-organic on the same holding — is only permitted with specific certifier approval and robust separation records. Record any parallel production approval from your certifier and maintain clear field-level records showing which fields are organic and which are conventional. Spray application records from conventional fields must not be confused with organic field records — the module flags any spray application record referencing a product classified as Not Permitted in the Organic Input Register.</p>`,
  ],

  // 124 — Organic Livestock — Herd Register Linkage & Conversion
  [
    "How organic livestock herds are registered and linked in BDE Farm Trac, including conversion status and organic herd separation records.",
    `<h2>Organic Livestock — Herd Register Linkage & Conversion</h2>
<p>All organic livestock records in BDE Farm Trac start with the herd or flock registered in the central Livestock → Herds &amp; Animals register. The Organic Livestock module adds an organic certification layer to each registered herd — conversion status, certifying body, and the specific conditions that apply to that herd under UK Organic Regulations 2020.</p>
<h3>Organic herd registration</h3>
<p>Navigate to <strong>Organic → Livestock → Herds</strong>. Each herd registered in the central Livestock register can be assigned an organic status:</p>
<ul>
<li><strong>In Conversion:</strong> the herd is undergoing the mandatory conversion period (typically 12 months for beef cattle, 6 months for sheep and pigs, depending on your certifier's requirements).</li>
<li><strong>Fully Organic:</strong> conversion period complete and the herd is certified.</li>
<li><strong>Conventional:</strong> not part of the organic unit.</li>
</ul>
<p>Record the conversion start date, certifying body, and the certifier's approval reference for each certified herd.</p>
<h3>Mixed holdings</h3>
<p>If you hold both organic and non-organic livestock, the herd register shows the organic status of each herd clearly. Livestock records — movements, treatments, feed deliveries — are linked to the specific herd, making it straightforward to demonstrate separate management of organic and non-organic animals.</p>
<h3>Treatment compliance</h3>
<p>Organic livestock may only be treated with permitted medicines. See the dedicated <em>Organic Livestock — Treatment Compliance</em> article for how the module handles treatment records without requiring double entry of medicine data.</p>`,
  ],

  // 125 — Organic Livestock — Treatment Compliance (No Double Entry)
  [
    "How BDE Farm Trac handles organic livestock treatment records without duplicating data across the Organic and Livestock modules.",
    `<h2>Organic Livestock — Treatment Compliance (No Double Entry)</h2>
<p>Organic livestock treatment records are subject to additional compliance checks beyond the standard medicine record requirements — treatments with prohibited products must be flagged, withdrawal periods are extended for organic animals (typically doubled under UK Organic Regulations 2020), and repeated treatments within 12 months may trigger loss of organic status for individual animals.</p>
<h3>Single record, dual compliance</h3>
<p>Treatment records are created once in the standard Livestock → Medicines section. BDE Farm Trac's organic compliance layer reads from these records — there is no need to enter the treatment twice in a separate organic form. When the treated animal belongs to an organic herd, the Organic module automatically applies:</p>
<ul>
<li>An organic withdrawal period check (typically twice the standard label withdrawal period for meat).</li>
<li>A permitted medicine status check — if the product is not permitted under UK Organic Regulations, a red alert appears on the treatment record indicating that the animal's organic status may be affected.</li>
<li>A treatment history count — if an animal has received three or more allopathic treatments in 12 months, an amber alert prompts a review with your certifier.</li>
</ul>
<h3>Animal organic status</h3>
<p>The Individual Animal Register shows the current organic certification status of each animal alongside its treatment history. Animals that have received a prohibited treatment or exceeded the treatment frequency threshold are flagged for certifier notification. Document any certifier correspondence regarding these animals in the Notes field of the animal's record.</p>`,
  ],

  // 126 — Organic Dairy — Herd Conversion & Milk Collection Records
  [
    "How to record organic dairy herd conversion and milk collection records in BDE Farm Trac for organic dairy certification.",
    `<h2>Organic Dairy — Herd Conversion & Milk Collection Records</h2>
<p>Organic Dairy certification in the UK is typically held by the milk buyer (e.g. Organic Herd, Omsco, Waitrose Duchy Organic) rather than by the individual farm. The farm demonstrates compliance through its records — conversion history, medicine records, feed records, and milk collection data. BDE Farm Trac provides all of these in the Organic Dairy section.</p>
<h3>Herd conversion records</h3>
<p>Navigate to <strong>Organic → Dairy → Herd Conversion</strong>. Record the conversion start date for each dairy herd — typically the last date on which a non-permitted treatment was administered. Milk can only be sold as organic six months after the conversion start date (or longer, depending on your certifier's requirements for your specific circumstances). The conversion end date and the organic milk eligibility date are calculated and displayed on the herd record.</p>
<h3>Milk collection records</h3>
<p>Organic Dairy → Milk Collection logs each collection from the holding — date, volume collected (litres), collection tanker reference, and the milk buyer. This complements the monthly milk statements in the Finance module. The collection log provides the quantity and dating evidence needed if an organic status query is raised for a specific collection period.</p>
<h3>Organic feed compliance</h3>
<p>Organic dairy cows must receive at least 60% of their dry matter intake from organic forage from the second year of conversion onward. Feed records in the Organic Dairy → Feed Records section log each feed type against its organic status (Certified Organic, In Conversion, or Conventional — within the permitted 10% allowance) to support the ration compliance calculation.</p>`,
  ],

  // 127 — Organic Dairy — Treatment Compliance & Organic Feed Records
  [
    "How organic dairy treatment compliance and feed ratio records work in BDE Farm Trac.",
    `<h2>Organic Dairy — Treatment Compliance & Organic Feed Records</h2>
<p>Organic dairy farms face two key compliance challenges beyond the standard livestock requirements: ensuring that only permitted medicines are used (with extended organic withdrawal periods), and maintaining the mandatory minimum organic feed ratio. BDE Farm Trac addresses both in the Organic Dairy section.</p>
<h3>Treatment compliance for dairy</h3>
<p>When a dairy cow in an organic herd is treated, the standard medicine treatment record is created in the Livestock module. The Organic Dairy compliance layer reads this record and:</p>
<ul>
<li>Checks the product against the permitted medicine list for organic livestock under UK Organic Regulations 2020.</li>
<li>Applies the organic milk withdrawal period (typically double the standard label withdrawal period, unless a specific organic period is published).</li>
<li>Flags milk from treated cows as ineligible for organic collection during the extended withdrawal period.</li>
<li>Counts treatments — if a cow receives three or more prohibited or allopathic treatments in 12 months, an alert prompts a certifier notification.</li>
</ul>
<h3>Organic feed ratio records</h3>
<p>Navigate to <strong>Organic → Dairy → Feed Records</strong>. Each daily or weekly feed record logs the ration composition by feed type. The organic status of each component (certified organic, in conversion, or permitted conventional) is recorded, and the calculated organic dry matter proportion is shown against the 60% minimum threshold. The record is flagged amber if the ration falls below 60% organic dry matter on any day.</p>`,
  ],

  // 128 — TB Testing — Enhanced Data Capture & History
  [
    "How to record tuberculosis (bTB) test events in BDE Farm Trac, including APHA test reference, reactor records, and movement linkage.",
    `<h2>TB Testing — Enhanced Data Capture & History</h2>
<p>Bovine tuberculosis (bTB) testing is an APHA-managed regulatory requirement for cattle herds in England, with test frequency depending on your TB risk area. BDE Farm Trac records each test event with the APHA reference, reactor details, and links to the pre-movement testing requirements that apply to cattle movements from your holding.</p>
<h3>Recording a TB test</h3>
<p>Navigate to <strong>Livestock → TB Tests</strong> and click <strong>New Test Record</strong>. Capture:</p>
<ul>
<li><strong>Test date and test type:</strong> Routine, Pre-Movement, Pre-Calving, Check Test, or Follow-up.</li>
<li><strong>APHA test reference number.</strong></li>
<li><strong>Vet name and practice.</strong></li>
<li><strong>Number of cattle tested, number of reactors, number of inconclusive reactors.</strong></li>
<li><strong>Skin measurement results:</strong> for the Comparative Intradermal Tuberculin Test (CITT), record the bovine and avian skin measurement readings for each animal tested. These are recorded at animal level linked to the Individual Animal Register.</li>
<li><strong>Test result:</strong> Clear, Inconclusive, or Reactor (failed).</li>
</ul>
<h3>Reactor records</h3>
<p>Animals identified as reactors are flagged in the Individual Animal Register with a Reactor status. The movement restriction imposed by APHA is recorded — no animals can legally move off the holding until the restriction is lifted. When APHA lifts the restriction and issues a fresh clear test result, the restriction is closed on the record.</p>
<h3>Pre-movement testing</h3>
<p>Livestock movement records from your holding include a pre-movement testing compliance field — confirming whether a pre-movement test was required and carried out within the APHA-specified window before the movement. The TB test record provides the evidence to support this confirmation.</p>`,
  ],

  // 129 — Welfare Outcome Assessments — Scoring, Reporting & Mobile Recording
  [
    "How to record welfare outcome assessments (WOAs) for cattle and livestock in BDE Farm Trac, including mobility and body condition scoring.",
    `<h2>Welfare Outcome Assessments — Scoring, Reporting & Mobile Recording</h2>
<p>Welfare Outcome Assessments (WOAs) — sometimes called outcome-based measures — assess the welfare of animals at a specific point in time rather than just checking that processes and inputs are in place. Red Tractor Dairy, Red Tractor Beef &amp; Lamb, and RSPCA Assured all require regular welfare outcome assessments. BDE Farm Trac provides structured forms for each assessment type.</p>
<h3>Mobility scoring</h3>
<p>Navigate to <strong>Livestock → Welfare Assessments → Mobility</strong> and click <strong>New Assessment</strong>. Select the herd or group, the assessment date, and score each animal or group on the AHDB mobility scoring scale (0–3): 0 (Perfect), 1 (Imperfect), 2 (Impaired), 3 (Lame). The assessment calculates the herd mobility score as a percentage of lame animals (scoring 3) and the percentage with any impairment (scoring 2 or 3).</p>
<h3>Body condition scoring (BCS)</h3>
<p>BCS assessments on the 1–5 scale are recorded for cattle at key production stages — calving, drying off, mid-lactation, and housing. Cows scoring below 2.0 at calving or below 2.5 at drying off are flagged as requiring a management review. BCS trend analysis across assessments shows whether body condition is being maintained in the herd.</p>
<h3>Mobile recording</h3>
<p>Welfare assessments can be recorded from the mobile app during the assessment walk — mobility scores, BCS assessments, and cleanliness observations can all be entered in the field without returning to an office. Pull to refresh after syncing to confirm all assessment records are uploaded.</p>`,
  ],

  // 130 — Fallen Stock Records — Contractor, Veterinary Details & Invoice Tracking
  [
    "How to record fallen stock collection events in BDE Farm Trac, including contractor details, collection method, and invoice tracking.",
    `<h2>Fallen Stock Records — Contractor, Veterinary Details & Invoice Tracking</h2>
<p>Fallen stock — animals that have died on farm other than at slaughter — must be disposed of by an authorised route under the Animal By-Products Regulations (ABP) 2005. Records of every carcass collection must be kept for at least two years. BDE Farm Trac's Mortality Records module handles the full disposal cycle from death to closed record.</p>
<h3>Recording collection</h3>
<p>When a mortality record is created, the disposal workflow guides you through four stages. The collection stage records:</p>
<ul>
<li><strong>Collection date.</strong></li>
<li><strong>Contractor name:</strong> the licensed fallen stock collector, hunt kennels, knacker, or on-farm disposal operator.</li>
<li><strong>Contractor approval number:</strong> the APHA approval number for the collecting premises — required by the ABP Regulations.</li>
<li><strong>Collection method:</strong> collected by contractor, hunt kennels collection, on-farm burial (permitted only in exceptional circumstances with EA approval), composting (permitted facilities only), or incineration.</li>
</ul>
<h3>Waybill and documentation</h3>
<p>For fallen stock collected by an ABP contractor, a commercial document (waybill or CMR) must accompany the carcass. Record the waybill or CMR reference number and attach a copy to the mortality record. This is the document equivalent of a waste transfer note for fallen stock.</p>
<h3>Invoice tracking</h3>
<p>If the contractor charges for collection, record the invoice amount, invoice reference, and payment status. These costs can be reported in the Finance module under miscellaneous costs for gross margin analysis.</p>`,
  ],

  // 131 — Sheep Dipping Records — Pesticide Certificates & Stock Usage
  [
    "How to record sheep dipping events in BDE Farm Trac, including operator certificates, dip product, disposal, and stock usage.",
    `<h2>Sheep Dipping Records — Pesticide Certificates & Stock Usage</h2>
<p>Sheep dipping using organophosphate products requires the operator to hold a Certificate of Competence for the use of veterinary sheep dip (the BASIS/NPTC PA6AW certificate for sheep dipping). The dip solution must be disposed of via a licensed route after use. BDE Farm Trac records the full dipping event with operator certificate compliance and disposal records.</p>
<h3>Recording a dip</h3>
<p>Navigate to <strong>Livestock → Sheep Dipping</strong> and click <strong>New Dip Record</strong>. Capture:</p>
<ul>
<li><strong>Dip date and location.</strong></li>
<li><strong>Flock and number of sheep dipped.</strong></li>
<li><strong>Dip product:</strong> selected from the product catalogue — the product's MAPP number and active ingredient (typically organophosphate or synthetic pyrethroid) are recorded.</li>
<li><strong>Dip concentration achieved:</strong> the target ppm checked using a refractometer or nephelometer.</li>
<li><strong>Volume of dip prepared (litres).</strong></li>
<li><strong>Operator:</strong> must hold a PA6AW certificate — the certificate expiry date is checked and a warning shown if expired.</li>
<li><strong>Volume of spent dip disposed of (litres).</strong></li>
<li><strong>Disposal contractor and disposal method.</strong></li>
</ul>
<h3>Product stock usage</h3>
<p>The quantity of dip product used is linked to the stock record in Trade Contacts &amp; Stock, reducing the running balance. This satisfies the agrochemical stock reconciliation requirement of Red Tractor.</p>`,
  ],

  // 132 — Vet Prescriptions — Linking Treatments to Written Authorisations
  [
    "How to link individual medicine treatment records to veterinary written authorisations in BDE Farm Trac.",
    `<h2>Vet Prescriptions — Linking Treatments to Written Authorisations</h2>
<p>A Veterinary Written Direction (VWD) or Cascade prescription authorises specific medicines to be used on specific classes of animals on your holding. Every treatment administered under an authorisation must be traceable back to that document. BDE Farm Trac's prescription linkage feature creates this traceability chain automatically when you select the prescription at the point of treatment entry.</p>
<h3>How the linkage works</h3>
<p>When recording a medicine treatment in the Livestock → Medicines section, the prescription picker field shows all active VWDs and Cascade prescriptions that are applicable to the species and medicine being used. Select the relevant prescription. The treatment record is then linked to the prescription by its unique identifier — from the prescription record you can view every treatment that has been administered under that authorisation, including the date, animal, dose, and administrator.</p>
<h3>Why this matters for audit</h3>
<p>Red Tractor assessors and APHA veterinary officers may request to see the written authorisation alongside the treatment records that reference it. The linkage in BDE Farm Trac allows you to show both in seconds — the prescription with its RCVS-registered vet's details and the complete list of treatments carried out under it — without searching through physical files.</p>
<h3>Authorisation quantity tracking</h3>
<p>For VWDs that specify a maximum quantity authorised (e.g. 200 tubes of antibiotic for dry cow therapy), the linked treatments allow you to calculate total usage against the authorised maximum. An alert is shown on the prescription record when usage approaches the authorised quantity, prompting a request for a new or renewed prescription from the vet.</p>`,
  ],

  // 133 — Department Management — Creating Departments & Assigning Staff
  [
    "How to create departments in BDE Farm Trac and assign staff members to them for task filtering and labour management.",
    `<h2>Department Management — Creating Departments & Assigning Staff</h2>
<p>Departments allow you to organise your staff into operational teams — Livestock, Arable, Workshop, Harvest, Administration, or any custom grouping that reflects how your farm operates. Tasks, timesheets, and the Labour Management module's rota and submission grids can all be filtered by department, making it straightforward for managers to focus on their team without seeing records for other areas.</p>
<h3>Creating a department</h3>
<p>Navigate to <strong>Settings → Departments</strong> and click <strong>Add Department</strong>. Give the department a name and an optional colour code — the colour appears as a section header in the Labour Management tabs to visually separate teams. You can create as many departments as you need.</p>
<h3>Assigning staff to departments</h3>
<p>Open each staff member's record in <strong>Settings → Staff Members</strong> and assign them to one or more departments. A staff member can belong to multiple departments if they work across teams. The primary department is shown on the task board and timesheet grid.</p>
<h3>Department managers</h3>
<p>Each department can have a designated manager who is responsible for approving timesheets, leave requests, and purchase orders raised by members of their department. Designate the department manager in the Department settings. The manager receives SMS notifications for pending approvals from their team.</p>
<h3>Department filtering in task board and Labour Management</h3>
<p>The Task Board's department filter shows only tasks assigned to staff within the selected department. The Labour Management Submission Status grid groups staff by department with colour-coded section headers, making it easy to check which teams have submitted and approved their timesheets for the week.</p>`,
  ],

  // 134 — Task Assignment — Filtering by Department & Viewing Department Tasks
  [
    "How to use department filters in the Task Board to manage and view tasks by team in BDE Farm Trac.",
    `<h2>Task Assignment — Filtering by Department & Viewing Department Tasks</h2>
<p>On farms with multiple operational teams, filtering the Task Board by department prevents livestock staff from having to navigate past arable tasks and vice versa. Department filtering makes the Task Board a practical daily management tool for team leaders and department managers.</p>
<h3>Filtering the Task Board</h3>
<p>Navigate to <strong>Planner → Task Board</strong>. In the filter toolbar, select a department from the Department picker. The board immediately shows only tasks assigned to staff members within that department. The department filter combines with other filters (status, priority, module, date) so you can see, for example, only High Priority Livestock tasks due this week.</p>
<h3>Creating department-targeted tasks</h3>
<p>When raising a task from the Raise Task dialog in any module, the assignee picker shows all staff members with their department in brackets — e.g. Jane Smith (Livestock). Selecting an assignee automatically categorises the task under their primary department.</p>
<h3>Department manager view</h3>
<p>Department managers can set the department filter to their own team as their default view, so every time they open the Task Board they see only their team's tasks. The badge count on the Task Board navigation item shows the total number of open tasks across all departments — click through to see the full unfiltered board when needed.</p>
<h3>Mobile task inbox</h3>
<p>Staff members see only their own assigned tasks in the mobile app's Task Inbox, regardless of department settings. Department filtering applies only to the dashboard Task Board management view used by managers and administrators.</p>`,
  ],

  // 135 — Contractor H&S File — Reviews, Compliance Tasks & Supplier Badges
  [
    "How to manage contractor health and safety files in BDE Farm Trac, including compliance reviews, induction records, and insurance verification.",
    `<h2>Contractor H&S File — Reviews, Compliance Tasks & Supplier Badges</h2>
<p>Farms that engage contractors have a duty under the Management of Health and Safety at Work Regulations 1999 to co-ordinate health and safety activities with those contractors and ensure they have appropriate competence. BDE Farm Trac's contractor H&amp;S file provides a structured record of each contractor's compliance documentation, induction records, and ongoing compliance status.</p>
<h3>Setting up a contractor H&S file</h3>
<p>Navigate to <strong>Health, Safety &amp; Risk → Contractors</strong> and click <strong>Add Contractor</strong>. For each contractor company, record:</p>
<ul>
<li><strong>Company name and primary contact.</strong></li>
<li><strong>Public liability insurance:</strong> insurer, policy number, coverage limit (£), and expiry date.</li>
<li><strong>Employer's liability insurance:</strong> same fields.</li>
<li><strong>Professional qualifications or scheme memberships:</strong> NSTS, BASIS, FACTS, Lantra, or CHAS, SafeContractor, SSIP.</li>
<li><strong>Induction completion date:</strong> when the contractor received your farm's site induction.</li>
</ul>
<h3>Compliance badges</h3>
<p>The contractor record displays compliance badges for insurance (green = valid, red = expired) and scheme membership status. Expired insurance is a mandatory hold — do not allow contractors with expired public liability or employer's liability insurance to work on your holding.</p>
<h3>Compliance tasks</h3>
<p>Set periodic review tasks — annually for insurance renewals, every three years for NSTS sprayer tests, or whenever a contractor starts a new project. Tasks linked to a contractor record appear in the Task Board as Contractor H&amp;S Review type tasks.</p>`,
  ],

  // 136 — Task Board — New Task Types & Filtering Completed Tasks by Date
  [
    "How new task types work in BDE Farm Trac and how to filter and review completed tasks by date on the Task Board.",
    `<h2>Task Board — New Task Types & Filtering Completed Tasks by Date</h2>
<p>The Task Board supports a range of task types that help categorise and route tasks correctly across your farm team. Each type has a dedicated icon and can be filtered independently — making it straightforward to find all APHA notifications outstanding, or all equipment checks due this month, without scrolling through general tasks.</p>
<h3>Available task types</h3>
<ul>
<li><strong>General:</strong> miscellaneous operational tasks.</li>
<li><strong>APHA Notification:</strong> tasks related to mandatory APHA reporting — notifiable disease, bTB reactor movements, or welfare concern notifications. Created automatically when a reportable disease flag is raised in Sheep Production or a Disease Incident is logged.</li>
<li><strong>Vet Call:</strong> tasks requiring a vet visit — created from health monitoring records or disease observations.</li>
<li><strong>Spray Review:</strong> tasks to review an agrochemical application or disease management response — created from high-pressure scouting records in Viticulture.</li>
<li><strong>Equipment Check:</strong> tasks for machine inspection, defect resolution, or calibration follow-up.</li>
<li><strong>Staff Action:</strong> HR or training tasks — certificate renewal reminders, right-to-work re-check prompts.</li>
</ul>
<h3>Filtering completed tasks by date</h3>
<p>Navigate to the Completed filter tab on the Task Board. Use the date range picker to select a specific period — e.g. last month or last crop year. The completed tasks within that range are displayed with their completion date and who completed them. Export the filtered list to CSV for inclusion in an inspection evidence pack.</p>`,
  ],

  // 137 — PPE Register — Where to Find It & How the Three Sub-Registers Work
  [
    "How the PPE Register is structured in BDE Farm Trac, covering the three sub-registers: Stock, Issue, and Risk Assessments.",
    `<h2>PPE Register — Where to Find It & How the Three Sub-Registers Work</h2>
<p>The PPE at Work Regulations 1992 (as amended 2022) require employers to assess PPE needs, provide suitable PPE free of charge, and keep records of what has been issued to each worker. BDE Farm Trac's PPE Register provides three linked sub-registers to manage the full PPE compliance cycle.</p>
<h3>Where to find the PPE Register</h3>
<p>Navigate to <strong>Staff &amp; Training → PPE Register</strong>. The register page shows a tabbed interface with the three sub-registers: Stock, Issue Records, and Risk Assessments.</p>
<h3>PPE Stock Register</h3>
<p>The Stock tab maintains a catalogue of all PPE items held on the farm — gloves, goggles, coveralls, dust masks, hearing protection, hard hats, safety footwear, hi-vis vests, and any specialist items (chemical-resistant suits, respiratory protection). Each stock item records the supplier, product name, EN standard met, quantity in stock, reorder level, and the most recent purchase invoice reference.</p>
<h3>PPE Issue Register</h3>
<p>The Issue tab records each issuance of PPE to a named staff member — item issued, size, date issued, condition at issue (New or Good), and the staff member's signature (captured as the record is saved, or manually recorded via a paper form). Periodic condition checks can be logged against each issued item.</p>
<h3>PPE Risk Assessments</h3>
<p>The Risk Assessments tab holds the assessments required by the PPE at Work Regulations 2022 — identifying which PPE is required for which tasks, the standard the selected PPE must meet, and the assessment date. Each assessment links to the relevant COSHH assessment or task risk assessment that identified the PPE need.</p>`,
  ],

  // 138 — PPE Stock Register — Supplier Traceability, Invoice Refs & Stock Levels
  [
    "How to maintain the PPE stock register in BDE Farm Trac, including supplier records, invoice references, and reorder level management.",
    `<h2>PPE Stock Register — Supplier Traceability, Invoice Refs & Stock Levels</h2>
<p>The PPE Stock Register ensures that the PPE you hold meets the required EN standard for each application and that you can trace each item back to its supplier and purchase invoice. This is the traceability level expected by HSE inspectors and major retailer H&amp;S audits.</p>
<h3>Adding a stock item</h3>
<p>Navigate to <strong>Staff &amp; Training → PPE Register → Stock</strong> and click <strong>Add Item</strong>. For each PPE type held in stock, record:</p>
<ul>
<li><strong>Item name and type:</strong> e.g. Nitrile Gloves — Chemical Resistant.</li>
<li><strong>EN standard met:</strong> e.g. EN374 (chemical resistant gloves), EN166 (eye protection), EN388 (mechanical hazard gloves), EN13982 (dust protection).</li>
<li><strong>Supplier:</strong> selected from the supplier directory.</li>
<li><strong>Most recent purchase invoice reference and date.</strong></li>
<li><strong>Quantity in stock (current).</strong></li>
<li><strong>Reorder level:</strong> the minimum stock quantity that triggers an alert to reorder.</li>
</ul>
<h3>Stock level management</h3>
<p>When PPE is issued to a staff member via the Issue Register, the quantity in stock decrements by the number of items issued. When new stock is purchased, log the receipt against the stock item to increment the balance. Low-stock alerts appear on the PPE Register dashboard when any item falls to or below its reorder level.</p>`,
  ],

  // 139 — PPE Issue Register — Issuing PPE to Staff & Recording Condition Checks
  [
    "How to record PPE issuances to farm staff and periodic condition checks in BDE Farm Trac.",
    `<h2>PPE Issue Register — Issuing PPE to Staff & Recording Condition Checks</h2>
<p>The PPE Issue Register documents who has received what PPE, on what date, and in what condition. It is the evidence that PPE has been provided free of charge to each employee — a legal requirement under the PPE at Work Regulations 1992 — and that its condition has been monitored over time.</p>
<h3>Recording an issuance</h3>
<p>Navigate to <strong>Staff &amp; Training → PPE Register → Issue Records</strong> and click <strong>New Issuance</strong>. Record:</p>
<ul>
<li><strong>Staff member:</strong> selected from the staff register.</li>
<li><strong>PPE item:</strong> selected from the Stock Register items list.</li>
<li><strong>Quantity issued.</strong></li>
<li><strong>Size (where relevant):</strong> S, M, L, XL, or specific foot size for safety boots.</li>
<li><strong>Condition at issue:</strong> New or Good (pre-used but serviceable).</li>
<li><strong>Issue date.</strong></li>
<li><strong>Issuer:</strong> the manager or supervisor who issued the PPE (auto-filled from logged-in user).</li>
</ul>
<h3>Condition checks</h3>
<p>PPE must be inspected periodically to confirm it remains fit for purpose. Log a condition check by opening an existing issue record and adding a check entry — date, current condition (Good, Worn/Faded, or Damaged/Replace), and any action taken (replaced, repaired, returned to stock). A check frequency recommendation appears on each issue record based on the PPE type — daily inspection for chemical-resistant gloves, monthly for hard hats, annually for safety harnesses.</p>`,
  ],

  // 140 — PPE Risk Assessments — Recording Assessments Under PPE at Work Regulations 2022
  [
    "How to complete and record PPE risk assessments in BDE Farm Trac under the PPE at Work Regulations 2022.",
    `<h2>PPE Risk Assessments — Recording Assessments Under PPE at Work Regulations 2022</h2>
<p>The PPE at Work Regulations 1992 (updated 2022) require employers to carry out a suitable risk assessment to determine the appropriate PPE for each hazardous task before providing that PPE to workers. The 2022 amendment extended the same requirements to workers (not just employees). BDE Farm Trac's PPE Risk Assessments tab provides a structured form for each assessment.</p>
<h3>Recording a PPE risk assessment</h3>
<p>Navigate to <strong>Staff &amp; Training → PPE Register → Risk Assessments</strong> and click <strong>New Assessment</strong>. Complete:</p>
<ul>
<li><strong>Task or hazard:</strong> the activity or substance for which PPE is required (e.g. mixing and applying organophosphate sheep dip).</li>
<li><strong>Hazard type:</strong> Chemical, Biological, Physical (mechanical impact, noise, vibration), Thermal, or Radiation.</li>
<li><strong>PPE required for each body zone:</strong> head, eyes, face, hearing, respiratory, hands, body, feet. For each zone, specify the PPE type and the EN standard it must meet.</li>
<li><strong>Why PPE is required:</strong> a brief note explaining why engineering or organisational controls alone are insufficient — PPE should be the last resort, not the first.</li>
<li><strong>Assessment date and assessor name.</strong></li>
<li><strong>Review date.</strong></li>
</ul>
<p>Link the assessment to the relevant COSHH assessment or task risk assessment that identified the hazard. The completed PPE risk assessment is stored permanently and appears in the PPE Compliance Pack for inspectors.</p>`,
  ],

  // 141 — PPE Compliance Pack — Printing the Full PPE Register for Inspection
  [
    "How to generate and print a PPE Compliance Pack from BDE Farm Trac for HSE inspections or farm assurance audits.",
    `<h2>PPE Compliance Pack — Printing the Full PPE Register for Inspection</h2>
<p>The PPE Compliance Pack is a formatted, print-ready document that compiles all three PPE sub-registers — Stock, Issue Records, and Risk Assessments — into a single document suitable for presenting to an HSE inspector, a Red Tractor assessor, or a retailer H&amp;S auditor.</p>
<h3>Generating the Compliance Pack</h3>
<p>Navigate to <strong>Staff &amp; Training → PPE Register</strong> and click <strong>Print Compliance Pack</strong>. The pack is generated as a browser-print-ready document. It includes:</p>
<ul>
<li><strong>Cover page:</strong> farm name, date of pack, and a summary of PPE provision status (total items in stock, total staff with issued PPE, any outstanding condition check overdue items).</li>
<li><strong>Section 1 — PPE Stock Register:</strong> all registered PPE items with EN standard, supplier, current stock level, and last purchase date.</li>
<li><strong>Section 2 — PPE Issue Records:</strong> all issuances to date, sorted by staff member, showing items issued, sizes, issue dates, and current condition status.</li>
<li><strong>Section 3 — PPE Risk Assessments:</strong> all completed assessments with the task, hazard type, PPE specified, and assessment date.</li>
<li><strong>Section 4 — Outstanding actions:</strong> any condition checks overdue, stock items below reorder level, or risk assessments past their review date.</li>
</ul>
<h3>When to use the Compliance Pack</h3>
<p>Generate the pack before any H&amp;S inspection or assurance audit visit. It presents the complete PPE compliance evidence without requiring the inspector to navigate through multiple screens — print it and have it available at the start of the visit.</p>`,
  ],

  // 142 — PPE Staff Record — Printing an Individual Staff Member's PPE History
  [
    "How to print a PPE history record for an individual staff member in BDE Farm Trac.",
    `<h2>PPE Staff Record — Printing an Individual Staff Member's PPE History</h2>
<p>The PPE Staff Record provides a formatted summary of all PPE issued to a specific staff member — useful when a staff member leaves (a leaving checklist shows what PPE must be returned), when investigating a health concern that may be related to PPE inadequacy, or when an employee requests a record of the PPE they have received.</p>
<h3>Generating a staff PPE record</h3>
<p>Navigate to <strong>Staff &amp; Training → PPE Register → Issue Records</strong>. Filter by the staff member using the name picker. Click <strong>Print Staff Record</strong>. The document generated shows:</p>
<ul>
<li>Staff member name and role.</li>
<li>All PPE items issued to this person, with issue date, size, condition at issue, and quantity.</li>
<li>Condition check history for each item — all periodic checks logged with their outcome.</li>
<li>Any items marked as replaced — showing the original issue and the replacement issue as linked records.</li>
<li>Total number of items currently issued and not returned.</li>
</ul>
<h3>Leaving checklist use</h3>
<p>When a staff member leaves, use their PPE Staff Record as the basis for a PPE return check. Any items listed as currently issued should be returned or written off as consumables. Update the Issue Register with a return date and condition note for any items recovered. Items not returned and not consumable (safety boots, hard hats) should be written off as a loss with a note on the record.</p>`,
  ],

  // 143 — Sheep Production Module — Overview and Getting Started
  [
    "An overview of the Sheep Production module in BDE Farm Trac, covering all record types and how to get started.",
    `<h2>Sheep Production Module — Overview and Getting Started</h2>
<p>The Sheep Production module provides specialist records for commercial sheep enterprises — tupping, pregnancy scanning, lambing, weigh-in and DLWG performance, shearing, health plans, disease monitoring, and the Red Tractor Sheep Assurance pre-inspection checklist. It works alongside the core Livestock &amp; Feed Management module where movements, medicine records, and mortality records are held.</p>
<h3>Getting started</h3>
<p>Before using the Sheep Production module, ensure your sheep flocks are registered in <strong>Livestock → Herds &amp; Animals</strong>. Each flock in the central register is the reference that all Sheep Production records link back to. If you have multiple flocks (e.g. a ewe flock, a ewe lamb flock, and a ram flock), register each separately.</p>
<h3>Module record types</h3>
<ul>
<li><strong>Tupping Records:</strong> ram-to-ewe service events with expected scanning dates.</li>
<li><strong>Scanning Records:</strong> pregnancy scan results with singles, twins, triplets, and empty rates.</li>
<li><strong>Lambing Records:</strong> individual lambing events with litter size, ease, and colostrum management.</li>
<li><strong>Weigh-in &amp; DLWG:</strong> group and individual weight records with daily live weight gain performance.</li>
<li><strong>Shearing Records:</strong> fleece weight, contractor, and BWMB wool merchant details.</li>
<li><strong>Health Plans:</strong> annual vet-signed plans with SCOPS parasite strategy and vaccination programme.</li>
<li><strong>Disease Monitoring:</strong> disease observation records with Reportable Disease flag and APHA advisory.</li>
<li><strong>Red Tractor Sheep Assurance Checklist:</strong> pre-inspection self-assessment.</li>
</ul>`,
  ],

  // 144 — Sheep Flock Register — Flocks are Registered in Livestock → Herds & Animals
  [
    "How sheep flocks are registered and managed in BDE Farm Trac's Livestock module and how they link to Sheep Production records.",
    `<h2>Sheep Flock Register — Flocks are Registered in Livestock → Herds & Animals</h2>
<p>BDE Farm Trac uses a single central Herd and Flock Register for all livestock species — cattle herds, sheep flocks, pig herds, and poultry flocks are all registered in the same place. This avoids duplicating herd-level information and ensures that a single authoritative flock record is used across movements, medicine records, and the Sheep Production module.</p>
<h3>Registering a sheep flock</h3>
<p>Navigate to <strong>Livestock → Herds &amp; Animals</strong> and click <strong>Add Herd/Flock</strong>. Select Sheep as the species. Record:</p>
<ul>
<li><strong>Flock name:</strong> your descriptive name (e.g. Main Ewe Flock, Ewe Lambs 2024).</li>
<li><strong>Flock number:</strong> the BCMS/APHA flock identification number on your movement licences.</li>
<li><strong>Breed or cross.</strong></li>
<li><strong>Current flock size (head).</strong></li>
<li><strong>Production type:</strong> Breeding Ewes, Ewe Lambs, Store Lambs, Finishing Lambs, Ram Flock.</li>
<li><strong>Location:</strong> field or building from the Farm Buildings &amp; Areas Registry.</li>
</ul>
<h3>Using the flock register across modules</h3>
<p>The registered flock appears as a picker option in the Sheep Production module for every record type — tupping, scanning, weigh-in, shearing, disease monitoring, and the assurance checklist. It also appears in Livestock Movements, Medicine Records, and Mortality Records. This means all records for a flock are linked through a single registered entity, making it straightforward to pull together a complete flock history for an assessor.</p>`,
  ],

  // 145 — Sheep Tupping Records — Ram Selection, Service Dates and Scanning Expectation
  [
    "How to record tupping events in BDE Farm Trac, including ram selection, service dates, and expected scanning dates.",
    `<h2>Sheep Tupping Records — Ram Selection, Service Dates and Scanning Expectation</h2>
<p>Tupping records document the breeding service — which rams were put to which ewe groups, on what dates, and when the ewes are expected to be scanned for pregnancy. These records feed the Farm Planner with expected scanning dates and provide the traceability chain from service to scanning result to lambing outcome.</p>
<h3>Recording a tupping event</h3>
<p>Navigate to <strong>Sheep Production → Tupping</strong> and click <strong>New Tupping Record</strong>. Complete:</p>
<ul>
<li><strong>Flock:</strong> the ewe group being served, selected from the Flock Register.</li>
<li><strong>Ram:</strong> selected from the Sire Register (ram name, breed, and registration number are auto-filled). If the ram is not in the Sire Register, enter as free text.</li>
<li><strong>Date put to:</strong> the date the ram was introduced to the ewe group.</li>
<li><strong>Date removed:</strong> when the ram was taken out of the ewe group.</li>
<li><strong>Number of ewes in the group.</strong></li>
<li><strong>Expected scanning date:</strong> typically 42–80 days after the date put to, depending on your scanning contractor's availability and the breed's gestation length.</li>
</ul>
<h3>Planner integration</h3>
<p>The expected scanning date is automatically added to the Week Ahead and Month Ahead Farm Planner as a reminder, so the scanning contractor appointment is visible in context with other farm operations scheduled for that period.</p>
<h3>Multiple rams per group</h3>
<p>If multiple rams are running with the same ewe group (e.g. a vasectomised teaser followed by a stock ram), create a separate tupping record for each ram with the relevant date put to and date removed.</p>`,
  ],

  // 146 — Sheep Scanning Records — Pregnancy Scanning, Litter Sizes and Expected Lambing
  [
    "How to record pregnancy scanning results in BDE Farm Trac, including litter distribution, pregnancy rate, and expected lambing dates.",
    `<h2>Sheep Scanning Records — Pregnancy Scanning, Litter Sizes and Expected Lambing</h2>
<p>Pregnancy scanning provides the information needed to plan your lambing resources — how many ewes are in lamb, the expected litter distribution, and the anticipated lambing period. Scanning records in BDE Farm Trac calculate pregnancy rate and expected litter distribution automatically and feed the Farm Planner with expected lambing dates.</p>
<h3>Recording a scanning result</h3>
<p>Navigate to <strong>Sheep Production → Scanning</strong> and click <strong>New Scanning Record</strong>. Record:</p>
<ul>
<li><strong>Flock and tupping record:</strong> link to the tupping event this scanning relates to.</li>
<li><strong>Scanning date.</strong></li>
<li><strong>Scanner name.</strong></li>
<li><strong>Number of ewes scanned.</strong></li>
<li><strong>Result distribution:</strong> singles, twins, triplets, quads, and empties (dry ewes).</li>
</ul>
<h3>Calculated results</h3>
<p>The scanning summary automatically calculates:</p>
<ul>
<li><strong>Pregnancy rate (%):</strong> (total in-lamb ewes ÷ total scanned) × 100.</li>
<li><strong>Expected litter distribution:</strong> number of ewes carrying singles, twins, triplets, and quads.</li>
<li><strong>Expected total lambs born:</strong> based on litter distribution and typical survival rates.</li>
</ul>
<h3>Expected lambing date</h3>
<p>Record the expected lambing start date (typically 147 days from the tupping start date for most breeds). This date and the expected end date appear in the Farm Planner as a lambing period block, allowing staffing and resource planning to be built around the key supervision period.</p>`,
  ],

  // 147 — Sheep Weigh-in and DLWG — Performance Recording and Target Tracking
  [
    "How to record sheep weigh-in events and DLWG performance in BDE Farm Trac for Red Tractor Sheep Assurance.",
    `<h2>Sheep Weigh-in and DLWG — Performance Recording and Target Tracking</h2>
<p>Live weight recording and daily live weight gain (DLWG) analysis are key performance monitoring tools for sheep enterprises. Red Tractor Sheep Assurance requires evidence of live weight monitoring as part of the flock performance records. BDE Farm Trac calculates DLWG automatically from successive weigh-in records and colour-codes performance against breed-specific targets.</p>
<h3>Recording a weigh-in</h3>
<p>Navigate to <strong>Sheep Production → Weigh-in</strong> and click <strong>New Weigh-in Record</strong>. Record:</p>
<ul>
<li><strong>Flock and group.</strong></li>
<li><strong>Weigh-in date.</strong></li>
<li><strong>Number of animals weighed.</strong></li>
<li><strong>Average liveweight (kg/head).</strong></li>
<li><strong>Individual weights (kg):</strong> optionally enter individual weights for tagged animals — each links to an ear tag in the Individual Animal Register.</li>
<li><strong>Target weight (kg) for this age and date:</strong> based on the breed target growth curve.</li>
</ul>
<h3>DLWG calculation</h3>
<p>DLWG is calculated automatically as: (current weight - previous weight) ÷ number of days between weigh-ins. The result is shown against the breed target DLWG in a colour-coded performance indicator:</p>
<ul>
<li>Green: at or above target DLWG.</li>
<li>Amber: within 10% below target.</li>
<li>Red: more than 10% below target — action required.</li>
</ul>
<p>Red results prompt a review of nutrition, health status, and pasture availability for the group.</p>`,
  ],

  // 148 — Sheep Shearing Records — Fleece Weight, Contractor Details and BWMB Traceability
  [
    "How to record shearing events in BDE Farm Trac, including fleece weight, contractor details, and BWMB traceability requirements.",
    `<h2>Sheep Shearing Records — Fleece Weight, Contractor Details and BWMB Traceability</h2>
<p>Shearing records are required by the British Wool Marketing Board (BWMB) for registered producers and by Red Tractor Sheep Assurance as part of the flock management evidence trail. BDE Farm Trac records the key details of each shearing event including contractor information and wool merchant traceability.</p>
<h3>Recording a shearing event</h3>
<p>Navigate to <strong>Sheep Production → Shearing</strong> and click <strong>New Shearing Record</strong>. Complete:</p>
<ul>
<li><strong>Flock and number of sheep shorn.</strong></li>
<li><strong>Shearing date.</strong></li>
<li><strong>Shearing method:</strong> farm staff or contractor.</li>
<li><strong>Contractor name and contact details</strong> (if used).</li>
<li><strong>Fleece weight (kg) per flock or group:</strong> the total weight of wool produced at this shearing.</li>
<li><strong>Grade or wool description:</strong> fine, medium, coarse — based on the BWMB grading system.</li>
<li><strong>Wool merchant or buyer:</strong> the BWMB or merchant that will collect the wool. Record the merchant's name, agent reference, and collection date.</li>
</ul>
<h3>BWMB traceability</h3>
<p>For producers registered with the BWMB, the shearing record provides the clip record required for the wool docket system — quantity, flock, shearing date, and merchant. The clip weight and quality grade determine the payment rate applied by BWMB to your annual settlement. Retain this record alongside the BWMB wool docket for traceability in the event of a quality query from the merchant.</p>`,
  ],

  // 149 — Red Tractor Sheep Assurance Checklist — Preparing for an Assessor Visit
  [
    "How to use the Red Tractor Sheep Assurance pre-inspection checklist in BDE Farm Trac to prepare for an assessor visit.",
    `<h2>Red Tractor Sheep Assurance Checklist — Preparing for an Assessor Visit</h2>
<p>The Red Tractor Sheep Assurance checklist in BDE Farm Trac provides a structured self-assessment against all the key audit areas an assessor will check during a visit. Completing the checklist before the visit allows you to identify and resolve any gaps before the assessor arrives, rather than discovering them during the inspection.</p>
<h3>Using the checklist</h3>
<p>Navigate to <strong>Sheep Production → Red Tractor Checklist</strong>. The checklist is divided into the key assessment sections:</p>
<ul>
<li><strong>Identification and tagging:</strong> all sheep double tagged, tags legible, register up to date.</li>
<li><strong>Movement records:</strong> all movements recorded within required timescales, medicine withdrawal periods observed on all moved animals.</li>
<li><strong>Medicine records:</strong> medicine book complete, all products used under valid prescription, batch numbers recorded, withdrawal periods documented.</li>
<li><strong>Health plans:</strong> current vet-signed health plan held, reviewed within 12 months, SCOPS-aligned parasite control strategy documented.</li>
<li><strong>Welfare and stockmanship:</strong> daily checks carried out and recorded, mortality rates within acceptable limits, lame sheep treatment protocol documented.</li>
<li><strong>Feed and water:</strong> clean water available at all times, feed records held for the current year.</li>
<li><strong>Fleece management:</strong> shearing records held, wool stored hygienically.</li>
</ul>
<h3>Completing and printing the checklist</h3>
<p>Tick each item as compliant. Items with outstanding issues can be marked as non-compliant with a note. The section summary turns green, amber, or red based on the completeness of each section. Print the completed checklist to present to the assessor at the start of the visit.</p>`,
  ],

  // 150 — Beef Production Module — Overview and Getting Started
  [
    "An overview of the Beef Production module in BDE Farm Trac, covering all record types and how to get started.",
    `<h2>Beef Production Module — Overview and Getting Started</h2>
<p>The Beef Production module provides specialist records for commercial beef enterprises — weigh-in and DLWG performance tracking, beef finishing records, body condition scoring, and deadweight settlement records. It sits alongside the core Livestock &amp; Feed Management module where movements, medicines, calving records, and mortality records are held.</p>
<h3>Getting started</h3>
<p>Beef cattle must be registered in the central <strong>Livestock → Herds &amp; Animals</strong> register and, where individually identified, in the <strong>Livestock → Individual Animals</strong> register with their ear tag numbers. The Beef Production module links weigh-in records to individual ear tags where individual weights are recorded.</p>
<h3>Module record types</h3>
<ul>
<li><strong>Weigh-in &amp; DLWG:</strong> group and individual weigh-in records with DLWG calculation and target comparison.</li>
<li><strong>Finishing Records:</strong> entry and exit records for finishing groups with target weights, finish dates, and EUROP grade assessment at close-out.</li>
<li><strong>Body Condition Scoring:</strong> BCS assessments at key production stages on the 1–5 scale.</li>
<li><strong>Deadweight Settlements:</strong> kill data and settlement documents from the abattoir linked to BCMS movement records.</li>
</ul>
<h3>Red Tractor Beef &amp; Lamb readiness</h3>
<p>All weigh-in, finishing, and settlement records map directly to the evidence trail required by Red Tractor Beef &amp; Lamb assurance standards — performance monitoring, feed records, and cattle traceability. Run the Red Tractor Audit Pack Generator from the Inspections module to compile all Beef Production records into a formatted pre-inspection document.</p>`,
  ],

  // 151 — Beef Weigh-in and DLWG Records — Tracking Growth Performance
  [
    "How to record beef cattle weigh-in events and track DLWG performance in BDE Farm Trac for Red Tractor Beef & Lamb compliance.",
    `<h2>Beef Weigh-in and DLWG Records — Tracking Growth Performance</h2>
<p>Daily live weight gain (DLWG) is the primary performance indicator for beef enterprises — it directly determines days to target slaughter weight and profitability per head. BDE Farm Trac calculates DLWG automatically from sequential weigh-in records and flags groups that are underperforming against their breed target.</p>
<h3>Recording a weigh-in</h3>
<p>Navigate to <strong>Beef Production → Weigh-in</strong> and click <strong>New Weigh-in Record</strong>. Record:</p>
<ul>
<li><strong>Herd and group or shed designation.</strong></li>
<li><strong>Weigh-in date.</strong></li>
<li><strong>Number of animals weighed.</strong></li>
<li><strong>Average liveweight (kg/head).</strong></li>
<li><strong>Individual animal weights (kg):</strong> link each weight to an ear tag in the Individual Animal Register for full per-animal traceability.</li>
<li><strong>Target DLWG for this group:</strong> set against the breed target growth curve.</li>
</ul>
<h3>DLWG calculation and performance flags</h3>
<p>DLWG = (current average weight − previous average weight) ÷ days between weigh-ins. The calculated DLWG is colour-coded against the target:</p>
<ul>
<li>Green: at or above target.</li>
<li>Amber: within 10% below target.</li>
<li>Red: more than 10% below — review ration, health status, and group composition.</li>
</ul>
<h3>DLWG trend chart</h3>
<p>The Beef Production page shows a trend chart of DLWG across all weigh-in records for the selected group, making it easy to spot when performance dropped and correlate the change with a health event or ration change.</p>`,
  ],

  // 152 — Beef Finishing Records — Entry Weight, Exit Weight and Deadweight Settlement
  [
    "How to record beef finishing group entry and close-out records, linking to deadweight settlement data in BDE Farm Trac.",
    `<h2>Beef Finishing Records — Entry Weight, Exit Weight and Deadweight Settlement</h2>
<p>Beef finishing records document the full production cycle of a group of cattle from entry into the finishing accommodation through to sale at the abattoir. They provide the performance benchmarking data required by Red Tractor Beef &amp; Lamb and the traceability chain from living animal to kill sheet.</p>
<h3>Creating a finishing record</h3>
<p>Navigate to <strong>Beef Production → Finishing</strong> and click <strong>New Finishing Record</strong>. At entry, record:</p>
<ul>
<li><strong>Group name and shed or pen assignment.</strong></li>
<li><strong>Entry date and number of animals.</strong></li>
<li><strong>Entry liveweight (kg/head average).</strong></li>
<li><strong>Target finish liveweight and target finish date.</strong></li>
<li><strong>Starting feed regime.</strong></li>
</ul>
<h3>Closing out the finishing record</h3>
<p>When the group goes to slaughter, open the record and click <strong>Close Out</strong>. Enter:</p>
<ul>
<li><strong>Exit date and number of animals dispatched.</strong></li>
<li><strong>Exit liveweight (kg/head).</strong></li>
<li><strong>Actual DLWG achieved.</strong></li>
<li><strong>Final EUROP conformation and fat class assessed on farm.</strong></li>
</ul>
<h3>Deadweight settlement linkage</h3>
<p>After receiving the kill sheet from the processor, add a Deadweight Settlement record to the closed-out finishing record. The settlement captures kill date, slaughter number, cold deadweight, kill-out percentage, EUROP grade and fat class from the plant, pence/kg DW, and net settlement value. This creates a complete chain from entry weight to kill sheet to settlement payment.</p>`,
  ],

  // 153 — Beef Body Condition Scoring — Recording and Monitoring BCS on the 1–5 Scale
  [
    "How to record body condition scores for beef cattle in BDE Farm Trac at key production stages.",
    `<h2>Beef Body Condition Scoring — Recording and Monitoring BCS on the 1–5 Scale</h2>
<p>Body condition scoring (BCS) is one of the most useful welfare and management tools available to the beef producer. Assessing condition at key production stages — housing, pre-service, pre-calving — allows intervention before cows become excessively thin or fat, both of which affect fertility and productivity. Red Tractor Beef &amp; Lamb includes body condition monitoring as part of its welfare outcome evidence requirements.</p>
<h3>Recording a BCS assessment</h3>
<p>Navigate to <strong>Beef Production → Body Condition Scoring</strong> and click <strong>New BCS Record</strong>. Record:</p>
<ul>
<li><strong>Herd and group.</strong></li>
<li><strong>Assessment date.</strong></li>
<li><strong>Production stage:</strong> Housing, Pre-Service, Scanning, Pre-Calving, Mid-Pregnancy, Weaning, Turnout, or Ad Hoc.</li>
<li><strong>BCS scores:</strong> enter the distribution of scores across the group (e.g. 10 cows at 2.5, 15 cows at 3.0, 5 cows at 3.5). Or for individually scored animals, enter each animal's score linked to its ear tag.</li>
<li><strong>Target BCS range for the production stage:</strong> pre-filled from the standard AHDB targets per stage.</li>
</ul>
<h3>Action flags</h3>
<p>Animals or groups scoring below the minimum target BCS for the production stage are flagged with an amber action card. Suggested management actions (nutritional review, individual supplementary feeding, veterinary assessment) are shown on the card. These action flags remain open until a follow-up BCS record shows the score has improved to within the target range.</p>`,
  ],

  // 154 — Medicated Feed Withdrawal Tracking — Recording Active Ingredients and Clearance Dates
  [
    "How BDE Farm Trac tracks medicated feed withdrawal periods and clearance dates for livestock treated with medicated feed.",
    `<h2>Medicated Feed Withdrawal Tracking — Recording Active Ingredients and Clearance Dates</h2>
<p>Medicated feed — feed containing licensed veterinary additives such as coccidiostats or therapeutic zinc oxide — must be managed under strict withdrawal period rules before animals can be sold for slaughter. BDE Farm Trac tracks medicated feed deliveries, the active ingredients involved, and the withdrawal clearance date for each batch of animals fed the medicated product.</p>
<h3>Recording a medicated feed delivery</h3>
<p>Navigate to <strong>Feed Management → Medicated Feed</strong> and click <strong>New Medicated Feed Record</strong>. Record:</p>
<ul>
<li><strong>Feed product name and supplier.</strong></li>
<li><strong>Batch number from the delivery note.</strong></li>
<li><strong>Active ingredient and concentration:</strong> e.g. Salinomycin at 60 ppm (coccidiostat), Zinc Oxide at 120 ppm.</li>
<li><strong>Delivery date and quantity (tonnes).</strong></li>
<li><strong>Species and age group for which this feed is intended.</strong></li>
<li><strong>Withdrawal period (days) as stated on the veterinary authorisation or feed label.</strong></li>
</ul>
<h3>Clearance date tracking</h3>
<p>When animals start consuming medicated feed, log the start date and the expected end date (last day of medicated feed use) for the group. The clearance date — the earliest date animals can be presented for slaughter — is calculated automatically as: end of medicated feed + withdrawal period. Animals with an active medicated feed withdrawal period are flagged in the Individual Animal Register and in the Movement Records section. Moving such animals for slaughter before the clearance date is a food safety breach.</p>`,
  ],

  // 155 — Grain Drying Records — Logging Drying Events, Moisture Reduction and Costs
  [
    "How to record grain drying events in BDE Farm Trac, including intake and target moisture, tonnes dried, fuel consumed, and drying costs.",
    `<h2>Grain Drying Records — Logging Drying Events, Moisture Reduction and Costs</h2>
<p>Grain drying is one of the highest variable costs in cereal production. Accurate drying records allow you to calculate the cost per tonne of moisture removed, benchmark performance against your dryer's design specification, and provide the drying evidence required by TASCC and grain merchants for quality assurance purposes.</p>
<h3>Recording a drying event</h3>
<p>Navigate to <strong>Equipment → Grain Drying</strong> and click <strong>New Drying Record</strong>. Complete:</p>
<ul>
<li><strong>Commodity and variety.</strong></li>
<li><strong>Source store and destination store.</strong></li>
<li><strong>Date of drying.</strong></li>
<li><strong>Tonnes dried.</strong></li>
<li><strong>Intake moisture (%).</strong></li>
<li><strong>Target moisture (%):</strong> typically 14.5% for wheat, 14.5% for barley, 9% for OSR.</li>
<li><strong>Exit moisture achieved (%).</strong></li>
<li><strong>Dryer type and capacity:</strong> continuous flow, batch, or aeration.</li>
<li><strong>Fuel consumed:</strong> gas (m³) or propane/LPG (litres), linked to the Fuel &amp; Energy module.</li>
<li><strong>Drying cost (£/tonne):</strong> calculated automatically from fuel consumed and current fuel price, or entered manually.</li>
</ul>
<h3>Cost of production reporting</h3>
<p>Drying costs from the Grain Drying register feed directly into the gross margin analysis in the Finance &amp; Business module under the Drying/Storage variable cost category. This ensures your true cost of production per tonne accounts for the full drying cost, not just the combined drill-to-store cost.</p>`,
  ],

  // 156 — Grain Quality Tests — Mycotoxin, Pesticide Residue, Specific Weight and Conditioning
  [
    "How to record grain quality test results in BDE Farm Trac, including mycotoxin screening, specific weight, and pesticide residue analysis.",
    `<h2>Grain Quality Tests — Mycotoxin, Pesticide Residue, Specific Weight and Conditioning</h2>
<p>Grain quality testing is required by TASCC for assured merchant status and by many milling and malting buyers as a pre-loading condition. BDE Farm Trac records all quality tests commissioned for stored grain, with results compared against the relevant food and feed standards.</p>
<h3>Recording a quality test</h3>
<p>Navigate to <strong>Equipment → Grain Quality Tests</strong> and click <strong>New Test</strong>. Record:</p>
<ul>
<li><strong>Storage location tested.</strong></li>
<li><strong>Sample date and sampling method.</strong></li>
<li><strong>Laboratory:</strong> selected from the registered laboratory list.</li>
<li><strong>Tests commissioned:</strong> select all applicable — Mycotoxin Panel, Specific Weight, Moisture, Pesticide Residue Screen, Protein Content, Hagberg Falling Number, or Grain Nitrogen.</li>
</ul>
<h3>Test results and compliance flags</h3>
<p>Enter results when received from the laboratory. Each result is compared against the applicable standard:</p>
<ul>
<li><strong>DON (deoxynivalenol):</strong> max 1.25 mg/kg for unprocessed cereals for human food; max 8 mg/kg for animal feed.</li>
<li><strong>Aflatoxin B1:</strong> max 2 μg/kg for unprocessed cereals for human consumption.</li>
<li><strong>Specific weight:</strong> buyer specification — typically ≥76 kg/hl for milling wheat.</li>
</ul>
<p>Results outside the applicable limit are flagged in red and trigger a mandatory decision record — divert to feed use, re-test, or blend. The decision and its rationale are stored permanently alongside the test result.</p>`,
  ],

  // 157 — Training Competency Matrix — Staff × Certificate Traffic-Light Compliance View
  [
    "How to use the Training Competency Matrix in BDE Farm Trac to view staff certificate compliance at a glance.",
    `<h2>Training Competency Matrix — Staff × Certificate Traffic-Light Compliance View</h2>
<p>The Training Competency Matrix is a grid view in the Staff &amp; Training module that shows every staff member's certificate status across all certificate types in a single, colour-coded display. It is the fastest way to check whether all spray operators are certified before a spray programme begins, or to identify which certificates need renewing before the next Red Tractor visit.</p>
<h3>Using the matrix</h3>
<p>Navigate to <strong>Staff &amp; Training → Competency Matrix</strong>. The grid shows staff members as rows and certificate types as columns. Each cell displays the certificate's expiry date (or "Not held" if the certificate has not been recorded) and a colour-coded status:</p>
<ul>
<li><strong>Green:</strong> valid certificate — more than 90 days until expiry.</li>
<li><strong>Amber:</strong> certificate expiring within 90 days — renewal required soon.</li>
<li><strong>Red:</strong> certificate expired or not held.</li>
</ul>
<h3>Spray operator filter</h3>
<p>Toggle the <strong>Spray Operators Only</strong> filter to reduce the matrix to PA1, PA2, PA6, PA6AW, and PA6W certificates only. This is the most common use case — confirming all operators who will be driving the sprayer hold a valid PA certificate before the season begins.</p>
<h3>Printing the matrix</h3>
<p>The Print button produces a formatted certificate compliance grid suitable for inclusion in an audit pack or for posting in the farm office as a standing reference. Print after each certificate renewal to keep the displayed version current.</p>`,
  ],

  // 158 — Red Tractor Audit Pack Generator — Assembling Evidence Packs for Assessor Visits
  [
    "How to use the Red Tractor Audit Pack Generator in BDE Farm Trac to compile evidence packs for assessor visits.",
    `<h2>Red Tractor Audit Pack Generator — Assembling Evidence Packs for Assessor Visits</h2>
<p>The Audit Pack Generator in the Inspections module collects records from across all active modules for a selectable date range and assembles them into a print-ready evidence pack structured around the relevant Red Tractor scheme standard. This replaces the manual process of printing individual records from multiple modules and assembling them into a folder for the assessor.</p>
<h3>Generating an audit pack</h3>
<p>Navigate to <strong>Inspections → Audit Pack Generator</strong>. Select the scheme (Combinable Crops, Beef &amp; Lamb, Dairy, Fresh Produce, or Poultry). Set the date range (typically the current scheme year). Click <strong>Generate Pack</strong>.</p>
<h3>Pack contents</h3>
<p>The generated pack includes sections for:</p>
<ul>
<li>Spray application records (with operator certificate status).</li>
<li>Soil sampling and NVZ records.</li>
<li>Livestock medicine records and withdrawal periods.</li>
<li>Livestock movement records.</li>
<li>Staff training certificates.</li>
<li>Risk assessments and COSHH assessments.</li>
<li>Biosecurity plan summary and visitor log.</li>
<li>Equipment calibration and maintenance records.</li>
<li>Non-conformances from previous inspections with resolution status.</li>
</ul>
<h3>Sharing with the assessor</h3>
<p>The pack can be printed directly from the browser, or a time-limited Inspection Access session can be created so the assessor can review records on-screen during the visit without being given full platform access. Both methods satisfy the Red Tractor evidence presentation requirement.</p>`,
  ],

  // 159 — NVZ Closed Period Automation — Countdown Widgets and Application Budget Remaining
  [
    "How BDE Farm Trac automates NVZ closed period monitoring and displays application budget remaining for each field.",
    `<h2>NVZ Closed Period Automation — Countdown Widgets and Application Budget Remaining</h2>
<p>BDE Farm Trac's NVZ module automates the two most error-prone aspects of NVZ compliance — tracking when closed periods start and end, and monitoring how much of each field's nitrogen budget has been used. Compliance with NVZ rules is a Red Tractor requirement and a legal obligation for farms in Nitrate Vulnerable Zones.</p>
<h3>Closed period countdown widgets</h3>
<p>The Nutrient Management dashboard shows a countdown widget for each active NVZ closed period. The countdown displays the number of days until the closed period begins (or until it ends, during the restricted period) alongside the material types affected. When the closed period is seven days away, an SMS alert is sent to opted-in managers — prompting any final applications to be completed before the restriction applies.</p>
<h3>Application budget remaining</h3>
<p>The NVZ Budget Calculator tab shows each NVZ field with its season-to-date nitrogen applications (from all sources — manufactured fertiliser, slurry, FYM, and other organic materials) and the remaining budget against the field's DEFRA-calculated limit. Fields are colour-coded:</p>
<ul>
<li><strong>Green:</strong> more than 20% of budget remaining.</li>
<li><strong>Amber:</strong> less than 20% of budget remaining — plan remaining applications carefully.</li>
<li><strong>Red:</strong> budget exhausted or exceeded — no further applications permitted.</li>
</ul>
<h3>Closed period breach detection</h3>
<p>Application records created with a spreading date that falls within a closed period for the relevant material type and soil type are flagged automatically as potential closed period breaches. The records cannot be deleted — the breach is permanently recorded with a mandatory note field for documenting the circumstances.</p>`,
  ],

  // 160 — Carbon Auto-Calculator — DEFRA 2023 Emission Factors and Scope 1, 2 and 3 Calculations
  [
    "How the Carbon Auto-Calculator in BDE Farm Trac uses DEFRA 2023 emission factors to calculate farm Scope 1, 2, and 3 emissions automatically.",
    `<h2>Carbon Auto-Calculator — DEFRA 2023 Emission Factors and Scope 1, 2 and 3 Calculations</h2>
<p>The Carbon Auto-Calculator eliminates the manual data collection step in carbon auditing by reading directly from your existing farm records — fuel logs, fertiliser applications, livestock numbers, purchased electricity — and applying DEFRA 2023 Greenhouse Gas Conversion Factors to calculate your farm's emission footprint without any additional data entry.</p>
<h3>How the calculation works</h3>
<p>Navigate to <strong>Carbon &amp; Sustainability → Auto-Calculator</strong>. The calculator pulls data from five source modules:</p>
<ul>
<li><strong>Fuel &amp; Energy → Drawdowns:</strong> diesel, petrol, red diesel, LPG, and heating oil drawdowns. DEFRA emission factors are applied per litre for each fuel type (Scope 1).</li>
<li><strong>Sprays &amp; Inputs → Applications:</strong> total nitrogen applied per year. The fertiliser manufacturing emission factor is applied to total N applied (Scope 3).</li>
<li><strong>Livestock → Herds &amp; Animals:</strong> herd size by species drives enteric fermentation and manure management emissions using IPCC/DEFRA Tier 1 factors (Scope 1).</li>
<li><strong>Fuel &amp; Energy → Grid Electricity:</strong> electricity purchased from the grid at the UK average grid emission factor (Scope 2).</li>
<li><strong>Feed Management → Deliveries:</strong> purchased compound feed volume drives indirect emissions from feed production (Scope 3).</li>
</ul>
<h3>Output</h3>
<p>The calculated result shows gross emissions in tCO₂e per year by category, the total farm footprint, and the intensity figure in tCO₂e per hectare. These figures can be copied directly into an annual carbon audit record for year-on-year comparison.</p>`,
  ],

  // 161 — Crop Rotation Planner — Field × Year Grid, OSR Interval Warnings and Sequence Planning
  [
    "How to use the Crop Rotation Planner in BDE Farm Trac to visualise and plan field rotations, including OSR break interval warnings.",
    `<h2>Crop Rotation Planner — Field × Year Grid, OSR Interval Warnings and Sequence Planning</h2>
<p>The Crop Rotation Planner provides a visual grid of your farm's crop rotation history — showing which crop was grown in each field in each year. It identifies rotation weaknesses and flags regulatory break interval issues before they become compliance problems.</p>
<h3>Using the planner</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Crop Rotation Planner</strong>. The grid displays your fields as rows and crop years as columns. Each cell shows the crop grown in that field in that year, drawn automatically from your harvest and drilling records. Unrecorded field-years show as empty grey cells.</p>
<h3>OSR break interval warning</h3>
<p>The most common rotation problem the planner flags is an insufficient oilseed rape break interval. Clubroot (<em>Plasmodiophora brassicae</em>) and light leaf spot (<em>Pyrenopeziza brassicae</em>) pressure builds significantly when OSR is grown in a field more than once in three years. The planner automatically flags any field where OSR has appeared in two of the last three years — the affected cell turns amber with a warning tooltip.</p>
<h3>Planning future rotations</h3>
<p>Enter planned crops for upcoming years directly in the planner. Planned entries are shown in a lighter shade to distinguish them from confirmed records. The planner checks your planned sequence against the OSR interval rule and flags any planned repeat before you commit to seed orders.</p>
<h3>Export to CSV</h3>
<p>Export the full rotation grid to CSV for sharing with an agronomist or BASIS adviser at the seasonal agronomy meeting.</p>`,
  ],

  // 162 — Labour Management — Setup Order, Rota, Timesheet Submission & Approval Workflow
  [
    "How to set up Labour Management in BDE Farm Trac in the correct order, from rota planning through to timesheet approval.",
    `<h2>Labour Management — Setup Order, Rota, Timesheet Submission & Approval Workflow</h2>
<p>Labour Management in BDE Farm Trac covers five interconnected tabs — Rota &amp; Shifts, Timesheets, Holiday &amp; Absence, Pay Summary, and Working Time. These should be set up in order, as each tab builds on the one before.</p>
<h3>Step 1 — Rota &amp; Shifts</h3>
<p>Navigate to <strong>Staff &amp; Training → Labour Management → Rota &amp; Shifts</strong>. Add your active staff members (they must already be in your Staff register). Plan the weekly rota by assigning each person a shift type for each working day — Full Day, AM Only, PM Only, Night Shift, Day Off, Holiday, or Sick. The rota is your planned schedule.</p>
<h3>Step 2 — Timesheets</h3>
<p>Staff submit timesheets daily from the mobile app — selecting their task type and hours for each work session. Submissions appear in the Timesheets tab as amber (~) in the Submission Status grid. Managers approve by opening the entry and completing the <em>Approved By</em> field — the entry turns green (✓). Missing submissions (rostered days with no timesheet) show red (!).</p>
<h3>Step 3 — Holiday &amp; Absence</h3>
<p>Record all annual leave, sickness, and other absence types so the rota and WTR calculations remain accurate. Set annual leave entitlement per staff member — remaining days are calculated automatically.</p>
<h3>Steps 4 &amp; 5 — Pay Summary and Working Time</h3>
<p>Once hourly rates are set per staff member, monthly gross pay is calculated automatically from approved timesheet hours. The Working Time tab calculates the 17-week rolling average weekly hours for WTR compliance — any breach above 48 hours is flagged automatically.</p>`,
  ],

  // 163 — Labour Management — Timesheet Approval, SMS Notifications & Submission Status Grid
  [
    "How timesheet approval, SMS notifications, and the submission status grid work in BDE Farm Trac's Labour Management module.",
    `<h2>Labour Management — Timesheet Approval, SMS Notifications & Submission Status Grid</h2>
<p>The Submission Status grid is the nerve centre of the timesheet approval workflow. It gives managers a real-time, colour-coded view of which staff members have submitted, which are awaiting approval, and which have not submitted for each working day of the week.</p>
<h3>Reading the Submission Status grid</h3>
<p>Navigate to <strong>Staff &amp; Training → Labour Management → Timesheets</strong>. The grid shows staff members as rows and dates as columns. Each cell has one of four statuses:</p>
<ul>
<li><strong>Green (✓):</strong> timesheet submitted and approved.</li>
<li><strong>Amber (~):</strong> timesheet submitted but awaiting approval.</li>
<li><strong>Red (!):</strong> rostered day with no timesheet submitted — the deadline has passed.</li>
<li><strong>Grey (–):</strong> day off, holiday, or not rostered.</li>
</ul>
<h3>Approving timesheets</h3>
<p>Click any amber (~) cell to open the timesheet entry. Review the task type and hours. Type the approver's name in the <em>Approved By</em> field and save — the cell turns green. For multi-entry days (e.g. morning and afternoon with different task types), each entry is approved separately.</p>
<h3>SMS notifications</h3>
<p>If the SMS Alerts module is active, opted-in managers receive an SMS when staff submit their timesheets, prompting timely review. Staff also receive an SMS notification when their timesheet is approved or when a leave request decision is made. This keeps the approval loop moving without requiring constant dashboard monitoring.</p>`,
  ],

  // 164 — Labour Management — Mobile Leave Requests, Pending Approval Panel & SMS Notifications
  [
    "How staff submit leave requests from the mobile app and how managers review and approve them in BDE Farm Trac.",
    `<h2>Labour Management — Mobile Leave Requests, Pending Approval Panel & SMS Notifications</h2>
<p>Staff can request annual leave, compassionate leave, training days, and other absence types directly from the BDE Farm Trac mobile app. Requests arrive on the dashboard for manager review and trigger SMS notifications to ensure they are not missed.</p>
<h3>Submitting a leave request (mobile)</h3>
<p>Open the BDE Farm Trac mobile app and navigate to <strong>My Requests → New Leave Request</strong>. Select the leave type (Annual Leave, Compassionate Leave, Unpaid Leave, Training Day, or Other), enter the start date and end date, and optionally add a note (e.g. a reason or a request for a specific week). Tap Submit — the request is sent immediately to the dashboard.</p>
<h3>Pending Approval Panel (dashboard)</h3>
<p>Navigate to <strong>Staff &amp; Training → Labour Management → Holiday &amp; Absence</strong>. An amber Pending Leave Requests panel appears at the top of the tab when there are requests awaiting review. Each request shows the staff member's name, leave type, date range, number of days, and any note. Click <strong>Approve</strong> to grant the leave or open <strong>Decline</strong> to record a reason for declining.</p>
<h3>SMS notifications</h3>
<p>When a leave request is submitted, opted-in managers receive an SMS notification. When the manager approves or declines, an SMS is sent back to the staff member confirming the decision. For declined requests, the decline reason (if entered) is included in the SMS — so the staff member knows why and can plan accordingly without needing to check the dashboard.</p>`,
  ],

  // 165 — Labour Management — Holiday Planner, Conflict Detection and Month-by-Month Calendar View
  [
    "How the Holiday Planner in BDE Farm Trac displays team absences, detects scheduling conflicts, and shows month-by-month calendars.",
    `<h2>Labour Management — Holiday Planner, Conflict Detection and Month-by-Month Calendar View</h2>
<p>The Holiday Planner provides a month-by-month calendar view of all approved absences across the team — making it straightforward to spot when multiple team members are away simultaneously and avoid understaffing during critical operational periods.</p>
<h3>Switching to the Planner view</h3>
<p>Navigate to <strong>Staff &amp; Training → Labour Management → Holiday &amp; Absence</strong>. Toggle between <strong>List</strong> and <strong>Planner</strong> views using the switch at the top of the tab.</p>
<h3>Reading the calendar</h3>
<p>In Planner mode, the current month is displayed as a grid with staff as rows and calendar days as columns. Each absence type has a distinct colour:</p>
<ul>
<li>Green — Annual Leave</li>
<li>Red — Sickness</li>
<li>Purple — Compassionate Leave</li>
<li>Pink — Maternity/Paternity</li>
<li>Sky Blue — Training Day</li>
<li>Teal — TOIL</li>
<li>Amber — Pending (awaiting approval)</li>
<li>Lime Green — Rota holiday (not yet entered as an absence record)</li>
</ul>
<h3>Conflict detection</h3>
<p>At the bottom of the calendar grid, a Staff Off count row shows how many team members are absent each day. Any day where 40% or more of the team are absent is highlighted in red — this flags a potential scheduling conflict before you approve further requests for the same period. This prevents under-resourcing at harvest, lambing, or other critical periods.</p>`,
  ],

  // 166 — Labour Management — Printable Blank Leave Request Form (FT-LR-01) and Paper Submission Workflow
  [
    "How to print a blank leave request form from BDE Farm Trac for staff who cannot use the mobile app.",
    `<h2>Labour Management — Printable Blank Leave Request Form (FT-LR-01) and Paper Submission Workflow</h2>
<p>Not all farm staff will have a smartphone or use the BDE Farm Trac mobile app. The printable blank leave request form (FT-LR-01) provides a paper-based alternative that maintains the same formal request and approval process as the digital workflow.</p>
<h3>Printing the form</h3>
<p>Navigate to <strong>Staff &amp; Training → Labour Management → Holiday &amp; Absence</strong> and click <strong>Blank Leave Form</strong> in the top-right toolbar. The form opens as a print-ready A4 document. Print as many copies as needed for staff without app access.</p>
<h3>Form contents (FT-LR-01)</h3>
<p>The form includes:</p>
<ul>
<li>Farm name (pre-filled from your Farm Settings).</li>
<li>Leave type tick boxes: Annual Leave, Sick Leave, Compassionate Leave, Maternity/Paternity Leave, Training Day, TOIL, Unpaid Leave, or Other (with free-text box).</li>
<li>Date range section: start date, end date, and total days requested.</li>
<li>Employee declaration with signature block and date.</li>
<li>Manager decision section: Approved, Declined, or Part-approved — with a comments box and manager signature.</li>
</ul>
<h3>Digital transcription</h3>
<p>Once the paper form is signed by both employee and manager, transcribe the outcome into the Holiday &amp; Absence tab by adding a new absence record. This keeps the digital record complete for Working Time Regulations calculations and the Submission Status grid — staff on approved leave should show as grey (–) not red (!) in the grid.</p>`,
  ],

  // 167 — Labour Management — Actual Attendance Recording, Discrepancy Flags and Bradford Factor Sickness Analysis
  [
    "How actual attendance recording, discrepancy flags, and Bradford Factor sickness analysis work in BDE Farm Trac's Labour Management module.",
    `<h2>Labour Management — Actual Attendance Recording, Discrepancy Flags and Bradford Factor Sickness Analysis</h2>
<p>Beyond timesheets and rota planning, Labour Management provides tools for monitoring actual attendance patterns — identifying discrepancies between planned and actual hours and flagging sickness absence patterns using the Bradford Factor formula used by many HR professionals to identify persistent short-term absence.</p>
<h3>Actual attendance records</h3>
<p>The actual start and end time of each working day can be recorded in the Timesheets tab — either by the staff member in the mobile app or by a manager on the dashboard. The planned hours (from the rota) versus actual hours (from the timesheet) are compared, and any significant discrepancy is flagged with an amber indicator.</p>
<h3>Discrepancy flags</h3>
<p>A discrepancy flag appears when actual hours differ from planned hours by more than a configurable threshold (e.g. more than one hour shorter than planned). Flagged entries remain visible in the timesheet grid until explained — the manager adds a discrepancy note (early finish due to weather, additional break taken, etc.) to close the flag. These notes create an auditable record for Working Time Regulations compliance.</p>
<h3>Bradford Factor sickness analysis</h3>
<p>The Bradford Factor is calculated as B = S² × D where S = number of separate absence instances and D = total days absent over a rolling 52-week period. A high Bradford Factor (typically above 450) indicates a pattern of persistent short-term sickness absence even if total days are low. The Bradford Factor tab shows each staff member's current score with colour-coded bands, helping managers identify absence patterns that warrant a formal review conversation.</p>`,
  ],

  // 168 — Labour Management — Department Grouping and Colour-Coded Section Headers Across All Six Tabs
  [
    "How department grouping and colour-coded section headers organise staff across Labour Management tabs in BDE Farm Trac.",
    `<h2>Labour Management — Department Grouping and Colour-Coded Section Headers Across All Six Tabs</h2>
<p>On farms with multiple operational teams — livestock, arable, workshop, and administration — Labour Management records quickly become difficult to navigate when all staff are listed together. BDE Farm Trac automatically groups staff by department across all Labour Management tabs, with colour-coded section headers that match the department colour assigned in the Department Register.</p>
<h3>How department grouping appears</h3>
<p>In all six Labour Management tabs — Rota &amp; Shifts, Timesheets, Holiday &amp; Absence, Pay Summary, Working Time, and the Submission Status grid — staff are listed in alphabetical order within their department groups. Each department is introduced by a colour-coded section header showing the department name and the count of staff in that department.</p>
<h3>Practical benefits</h3>
<p>For a livestock manager reviewing the submission status grid, the colour-coded grouping means they can scan straight to the Livestock section without reading through the Arable or Workshop teams' rows. For the farm owner reviewing Pay Summary, each department's wage total can be read at the department sub-total line without tallying individual figures.</p>
<h3>Setting up department colours</h3>
<p>Navigate to <strong>Settings → Departments</strong> and assign a colour to each department. Six distinct colours are available. The chosen colour appears as the section header in all Labour Management tabs. Assign colours that reflect your farm's existing team identity or follow a logical colour scheme (e.g. green for Livestock, amber for Arable, blue for Administration).</p>`,
  ],

  // 169 — Livestock Deadweight Sales — Linking Kill Sheets to Off-Farm Movement Records (BCMS Audit Trail)
  [
    "How to link deadweight livestock kill sheets to off-farm movement records in BDE Farm Trac to create the complete BCMS audit trail.",
    `<h2>Livestock Deadweight Sales — Linking Kill Sheets to Off-Farm Movement Records (BCMS Audit Trail)</h2>
<p>Red Tractor Beef &amp; Lamb and cattle buyer specifications require a complete audit trail from the farm movement notification to the kill sheet. BDE Farm Trac creates this trail by linking each deadweight sale record to the corresponding BCMS off-farm movement record using a direct database reference.</p>
<h3>Recording a deadweight sale</h3>
<p>Navigate to <strong>Finance &amp; Business → Sales → Deadweight</strong> and click <strong>New Kill Sheet Record</strong>. Record the kill date, species, number of animals, cold deadweight (kg), kill-out percentage, EUROP conformation grade, fat class, pence/kg DW, and net settlement value.</p>
<h3>Linking to the movement record</h3>
<p>In the kill sheet form, the <strong>Link to Off-Farm Movement Record</strong> dropdown lists all outgoing livestock movement records (type: Off/Sale/Dispatch) sorted by date and species. Select the movement record for the batch of animals that went to slaughter. The movement and the kill sheet are now linked — a green <em>Movement</em> badge appears on the kill sheet row in the sales table, and the kill sheet reference appears on the movement record.</p>
<h3>Document attachment</h3>
<p>Attach the abattoir's kill sheet or deadweight settlement PDF directly to the record using the Doc column paperclip icon. The physical document is stored permanently alongside the digital record — an inspector can view both the digital data and the original kill sheet from a single record without searching through paper files.</p>`,
  ],

  // 170 — Livestock Mart / Auction Sales — Linking Sale Records to Off-Farm Movement Records (LIS Audit Trail)
  [
    "How to link livestock mart and auction sale records to off-farm movement records in BDE Farm Trac for LIS and Red Tractor traceability.",
    `<h2>Livestock Mart / Auction Sales — Linking Sale Records to Off-Farm Movement Records (LIS Audit Trail)</h2>
<p>The Livestock Information Service (LIS) requires off-farm sheep and goat movements to be recorded including the destination. For marts and auction sales, the BDE Farm Trac movement record captures the mart as the movement destination, and the mart sale record provides the commercial detail of the transaction. Linking the two creates the complete traceability chain from BCMS/LIS notification to auctioneer receipt.</p>
<h3>Recording a mart sale</h3>
<p>Navigate to <strong>Finance &amp; Business → Sales → Mart Sales</strong> and click <strong>New Mart Sale</strong>. Record the lot number, auction mart, species, category, head count, price per head or per kg, gross proceeds, auctioneer reference, and buyer name (where known).</p>
<h3>Linking to the movement record</h3>
<p>In the mart sale form, the <strong>Link to Off-Farm Movement Record</strong> dropdown shows your outgoing livestock movement records filtered by species and date. Select the movement record that covers this mart consignment. A blue <em>Movement</em> badge appears on the mart sale row. The sale reference appears on the movement record — linking the auctioneer receipt directly to the LIS movement notification.</p>
<h3>Lot sheet attachment</h3>
<p>Attach the auctioneer's lot sheet or sale docket PDF to the mart sale record via the Doc paperclip. The lot sheet, digital record, and movement notification are now all accessible from one place — the complete chain of evidence required by Red Tractor Beef &amp; Lamb for mart sales.</p>`,
  ],

  // 171 — TB Test to Movement Record Linkage — APHA Pre-Movement Testing Evidence and Cross-Compliance
  [
    "How to link TB test records to livestock movement records in BDE Farm Trac to evidence pre-movement testing compliance.",
    `<h2>TB Test to Movement Record Linkage — APHA Pre-Movement Testing Evidence and Cross-Compliance</h2>
<p>APHA requires a pre-movement TB test for cattle being moved from farms in high-risk bTB areas in England, and from herds that have been under movement restriction. The TB test must be carried out within 60 days before the movement (or within 6 days in some circumstances). BDE Farm Trac links TB test records directly to the movement records they authorise.</p>
<h3>Linking a TB test to a movement</h3>
<p>When creating an off-farm movement record for cattle, the form includes a <strong>Pre-Movement TB Test</strong> section. Toggle the pre-movement test toggle and select the relevant TB test from the picker — this shows all TB tests for the species within the previous 60 days. Selecting the test creates a direct database link between the test and the movement record.</p>
<h3>What the link provides</h3>
<ul>
<li>The movement record shows the TB test reference, test date, APHA number, and test result (Clear) as a linked badge.</li>
<li>The TB test record shows all movement records that have been authorised by that test result.</li>
<li>If the test has expired (older than 60 days), the movement form displays a red warning that a new pre-movement test is required before the movement can proceed.</li>
</ul>
<h3>Cross-compliance</h3>
<p>Movement of cattle without a valid pre-movement test from a required holding is a bTB cross-compliance breach and can result in BCMS penalty and prosecution. The linkage in BDE Farm Trac makes it straightforward to verify that every movement from a test-required holding is covered by a clear, unexpired test before the animals leave.</p>`,
  ],

  // 172 — Grain Sale Call-Off to Forward Contract Linkage — Traceability from Merchant Contract to Weighbridge
  [
    "How grain sale call-offs are linked to forward contracts in BDE Farm Trac, creating traceability from merchant contract to weighbridge ticket.",
    `<h2>Grain Sale Call-Off to Forward Contract Linkage — Traceability from Merchant Contract to Weighbridge</h2>
<p>When grain is delivered against a forward contract, each load (weighbridge delivery) is a call-off against the total contracted tonnage. BDE Farm Trac links every grain sale call-off to the parent forward contract, creating a direct database reference from the weighbridge ticket to the merchant contract — the traceability required by Red Tractor and most grain merchant contract terms.</p>
<h3>How call-off linkage works</h3>
<p>When recording a grain sale, set the sale type to <em>Forward Contract</em>. A <strong>Linked Forward Contract</strong> picker appears, listing all open forward contracts filtered by commodity. Select the contract. The grain sale is now linked to the parent contract.</p>
<h3>What this creates</h3>
<ul>
<li>The grain sale row in the sales table shows a green <em>Contract</em> badge with the merchant contract reference.</li>
<li>The forward contract record's progress bar updates — called-off tonnage increases and remaining tonnage decreases in real time.</li>
<li>From the contract record, a linked-transactions table shows every individual call-off (weighbridge load), its date, tonnage, and weighbridge ticket number.</li>
</ul>
<h3>Red Tractor traceability requirement</h3>
<p>Red Tractor Combinable Crops requires traceability from the merchant contract to the delivery of grain from that contract. The linked call-off records satisfy this requirement by creating a direct, queryable database reference from every weighbridge load back to the original merchant contract — without any manual document matching.</p>`,
  ],

  // 173 — Benchmarking Panels — AHDB and Andersons Performance Comparisons
  [
    "How the Benchmarking Panels in BDE Farm Trac compare your farm's financial and production performance against AHDB and Andersons industry benchmarks.",
    `<h2>Benchmarking Panels — AHDB and Andersons Performance Comparisons</h2>
<p>The Benchmarking Panel in the Finance &amp; Business module compares your farm's key performance indicators against industry benchmark data from AHDB (Agriculture and Horticulture Development Board) and the Andersons Farm Business Survey. Benchmarking helps identify where your farm excels and where improvement could have the greatest economic impact.</p>
<h3>Available benchmarks</h3>
<ul>
<li><strong>Combinable crops:</strong> gross margin per hectare, variable costs per tonne, overhead cost per hectare.</li>
<li><strong>Dairy:</strong> output per litre (p/litre), cost of production (p/litre), margin over concentrate.</li>
<li><strong>Beef:</strong> suckler cow gross margin, finishing gross margin per head, DLWG vs target.</li>
<li><strong>Sheep:</strong> gross margin per ewe, lambing percentage, DLWG.</li>
<li><strong>Pigs:</strong> feed conversion ratio, pigs finished per sow per year, cost per kg deadweight.</li>
</ul>
<h3>Reading the benchmark</h3>
<p>Each metric shows your farm figure alongside three performance bands:</p>
<ul>
<li><strong>Top third (green):</strong> the level achieved by the best-performing 33% of AHDB survey farms.</li>
<li><strong>Average (amber):</strong> the mean result across all survey farms.</li>
<li><strong>Bottom third (red):</strong> the level below which the bottom-performing 33% fall.</li>
</ul>
<h3>Using benchmark data</h3>
<p>Benchmarks are most powerful when reviewed alongside your agronomist or farm consultant at an annual business review. Metrics in the bottom third should drive a conversation about root causes — whether a low gross margin is driven by low yield, high variable costs, or low selling price requires different management responses.</p>`,
  ],

  // 174 — NVZ Budget Calculator — Per-Field Nitrogen Budget vs DEFRA Field Limit
  [
    "How the NVZ Budget Calculator in BDE Farm Trac shows nitrogen budget remaining by field and flags over-applications.",
    `<h2>NVZ Budget Calculator — Per-Field Nitrogen Budget vs DEFRA Field Limit</h2>
<p>The NVZ Budget Calculator provides a field-by-field view of how much nitrogen has been applied to each NVZ field so far in the current season and how much budget remains before the DEFRA field limit is reached. It is the primary tool for managing NVZ compliance on an active, season-long basis.</p>
<h3>Accessing the calculator</h3>
<p>Navigate to <strong>Nutrient Management → NVZ Budget Calculator</strong>. The page lists all registered NVZ fields with the following columns:</p>
<ul>
<li><strong>Field name and area (ha).</strong></li>
<li><strong>Crop and soil type:</strong> these determine the DEFRA field limit applied.</li>
<li><strong>DEFRA field limit (kg N/ha).</strong></li>
<li><strong>Applied to date (kg N/ha):</strong> the sum of all nitrogen applied to this field from all sources (manufactured N, slurry, FYM, other organic manures) from logged application records.</li>
<li><strong>Budget remaining (kg N/ha):</strong> limit minus applied to date.</li>
<li><strong>Status:</strong> green (more than 20% remaining), amber (less than 20% remaining), red (at or over limit).</li>
</ul>
<h3>Cross-checking with applications</h3>
<p>Click any field row to see the full list of nitrogen applications contributing to the applied-to-date figure — each application is shown with its date, material type, application rate, and kg N/ha. If an application appears to be missing, navigate to NVZ Applications to add it; the budget calculator updates immediately.</p>`,
  ],

  // 175 — Multi-Farm Consolidated Dashboard — Group Compliance Overview Across Holdings
  [
    "How the Group Dashboard in BDE Farm Trac provides a consolidated compliance view across all farm holdings in a multi-farm account.",
    `<h2>Multi-Farm Consolidated Dashboard — Group Compliance Overview Across Holdings</h2>
<p>For farm groups, estate businesses, and farming companies managing multiple CPH holdings under one BDE Farm Trac account, the Group Dashboard provides a consolidated overview of compliance status across all holdings — without needing to log in separately for each farm.</p>
<h3>Accessing the Group Dashboard</h3>
<p>Navigate to the main Dashboard and click <strong>Group Overview</strong> at the top of the page (visible only when two or more farm holdings are registered). The Group Overview tab shows one summary card per holding.</p>
<h3>What each farm card shows</h3>
<ul>
<li><strong>Farm name and CPH number.</strong></li>
<li><strong>Overall compliance status:</strong> a traffic-light indicator (Green = all systems compliant, Amber = some items requiring attention, Red = critical non-compliances outstanding).</li>
<li><strong>Count of overdue tasks.</strong></li>
<li><strong>Certificate expiry warnings:</strong> the number of staff certificates within 90 days of expiry.</li>
<li><strong>Outstanding movement notifications.</strong></li>
<li><strong>Active withdrawal periods.</strong></li>
</ul>
<h3>Navigating to an individual farm</h3>
<p>Click any farm card to switch context to that farm's full dashboard — all modules, records, and data switch to the selected holding. The farm selector in the top sidebar shows the currently active farm. Switch back to the group view at any time by clicking Group Overview from the main dashboard.</p>`,
  ],

  // 176 — Settlement Notes — Recording Grain and Livestock Settlement Documents
  [
    "How to record grain and livestock settlement notes in BDE Farm Trac, including payment references and document attachment.",
    `<h2>Settlement Notes — Recording Grain and Livestock Settlement Documents</h2>
<p>Settlement notes — the payment documentation from grain merchants, abattoirs, milk buyers, and auction marts — are the final link in the farm trading chain. BDE Farm Trac records each settlement document with its reference, amount, and payment status, and links it to the underlying sale records it relates to.</p>
<h3>Recording a grain settlement note</h3>
<p>Navigate to <strong>Finance &amp; Business → Sales → Settlement Notes</strong> and click <strong>New Settlement</strong>. Select the settlement type (Grain, Livestock Deadweight, Mart, Milk Statement, Egg, or Poultry Batch). Record the settlement reference number, the period covered, the total amount (£), the payment date or expected payment date, and the payment status (Invoiced, Paid, or Overdue).</p>
<h3>Document attachment</h3>
<p>Attach the merchant's or processor's settlement PDF to the record. For grain settlements, the attachment typically includes the full tonnage summary by grade, moisture, protein, and price calculations. For kill sheet settlements, the PDF shows the EUROP grade breakdown, deductions, and net payment. Having the original document attached means you can reconcile any query with the merchant without searching through physical files.</p>
<h3>Linking to sale records</h3>
<p>The settlement note can be linked to the specific grain sale records or kill sheet records it covers. This creates a cross-reference from every sale line to its settlement document — important when a merchant's statement covers multiple loads or a period's deliveries rather than a single transaction.</p>`,
  ],

  // 177 — Inspector Mode — Advisor Portal Filtered Compliance View
  [
    "How the Inspector Mode in BDE Farm Trac gives advisors and inspectors a filtered, read-only view of farm compliance records.",
    `<h2>Inspector Mode — Advisor Portal Filtered Compliance View</h2>
<p>Inspector Mode is the term for the restricted view that an external advisor, vet, agronomist, or assurance scheme assessor sees when they access your BDE Farm Trac records via an advisor account or a time-limited inspection session. It provides the records they need without exposing sensitive business data or administrative settings.</p>
<h3>What an advisor sees in Inspector Mode</h3>
<p>An advisor with a permanent advisor account sees only the modules you have granted access to via the scope selector. Within those modules, they see all operational records — spray applications, medicine treatments, movement records, soil samples, nutrient management plans, staff certificates, and inspections — but they do not see financial data (sales records, PO values, invoices) unless the Finance module is explicitly granted.</p>
<h3>What an assessor sees in an inspection session</h3>
<p>A time-limited inspection session can be scoped to any combination of modules. The assessor's view shows record lists and record details in read-only format — they cannot create, edit, or delete any record. All records they view are logged in the Access Log with a timestamp.</p>
<h3>Common advisor access configurations</h3>
<ul>
<li><strong>Agronomist:</strong> Sprays &amp; Inputs, Field &amp; Crop Management, Soil Management, and NVZ.</li>
<li><strong>Vet:</strong> Livestock &amp; Feed Management, Medicine Records, and Biosecurity.</li>
<li><strong>Red Tractor assessor session:</strong> All modules relevant to the assessed scheme standard.</li>
<li><strong>Bank or lender:</strong> Finance &amp; Business and Carbon &amp; Sustainability (read only).</li>
</ul>`,
  ],

  // 178 — Smart Date Validation — How Date Fields Work Across the Platform
  [
    "How BDE Farm Trac's smart date validation works to prevent future dates on past-event records and past dates on future-event records.",
    `<h2>Smart Date Validation — How Date Fields Work Across the Platform</h2>
<p>Every date field in BDE Farm Trac is bound to a logical date constraint. Fields that record an event that has already happened do not accept future dates. Fields that schedule a future action do not accept past dates. This prevents the most common category of compliance record error — a date entered in the wrong year, or a record created with a future date that implies the event happened in advance of its actual occurrence.</p>
<h3>Past-event date fields</h3>
<p>These fields accept only dates on or before today:</p>
<ul>
<li>Medicine treatment dates</li>
<li>Spray application dates</li>
<li>Livestock movement dates</li>
<li>Harvest dates</li>
<li>Weigh-in dates</li>
<li>Calving and lambing dates</li>
<li>Soil sample dates</li>
<li>Biosecurity visitor log dates</li>
</ul>
<h3>Future-event date fields</h3>
<p>These fields accept only dates on or after today (or within a logical future window):</p>
<ul>
<li>Expected calving dates (from AI and service records)</li>
<li>Expected lambing dates (from scanning records)</li>
<li>Task due dates</li>
<li>Certificate renewal reminders</li>
</ul>
<h3>Flexible range fields</h3>
<p>Some fields accept both past and future dates — NVZ application planning records (which can record a planned future application for budget forecasting), and agreement start/end dates for agri-environment schemes that have fixed calendar terms regardless of the current date.</p>`,
  ],

  // 179 — Staff Auto-Populate — Operator and Assessor Fields Pre-Fill from Your Login
  [
    "How BDE Farm Trac automatically fills operator, assessor, and 'recorded by' fields from the logged-in user's name.",
    `<h2>Staff Auto-Populate — Operator and Assessor Fields Pre-Fill from Your Login</h2>
<p>Across BDE Farm Trac, any field that asks who carried out an operation — the spray operator, the assessor, the person completing an inspection, the operator who recorded a harvest, or the staff member who administered a treatment — is automatically pre-filled with the name of the currently logged-in user. You can override this if you are entering a record on behalf of a colleague, but in most cases you will not need to type your name at all.</p>
<h3>Where auto-population applies</h3>
<ul>
<li><strong>Spray records:</strong> Operator field (the person who applied the spray).</li>
<li><strong>Viticulture records:</strong> Observer (phenology), Operator (canopy operations, harvest), Scouted By (disease scouting).</li>
<li><strong>Welfare assessments:</strong> Assessed By field.</li>
<li><strong>Grain drying and conditioning:</strong> Recorded By field.</li>
<li><strong>Inspection records:</strong> Completed By field.</li>
<li><strong>Medicine treatments:</strong> Administered By field.</li>
<li><strong>Timesheets:</strong> submitted as the current user automatically.</li>
</ul>
<h3>Overriding the auto-populated name</h3>
<p>In scenarios where a manager is entering records for a team member who is not logged in — for example, entering spray records from a written spray operator sheet at the end of the day — select the correct operator from the staff picker or type their name in the manual text field. The auto-populated name is just a default; it can be overridden on any record.</p>`,
  ],

  // 180 — Viticulture Module Overview — Vine Register, Blocks, Phenology, Operations, Harvest & Scouting
  [
    "A comprehensive overview of the Viticulture module in BDE Farm Trac, covering all twelve tabs and their compliance purpose.",
    `<h2>Viticulture Module Overview — Vine Register, Blocks, Phenology, Operations, Harvest & Scouting</h2>
<p>The Viticulture module is BDE Farm Trac's dedicated compliance workspace for UK commercial vineyard operations. It provides twelve tabs covering every aspect of vineyard management — from vine variety records and block lifecycle management through to winery licensing, HMRC excise duty returns, and Challenge 25 age verification. Viticulture subscribers automatically receive bundled access to Sprays &amp; Inputs, COSHH, Staff &amp; Training, Equipment &amp; Vehicles, and Trade Contacts &amp; Stock.</p>
<h3>Vineyard record tabs</h3>
<ul>
<li><strong>Vine Register:</strong> variety, rootstock, vine count, spacing, date planted, GI classification, wine colour, and removal status — 24 UK varieties and 14 rootstocks available.</li>
<li><strong>Vineyard Blocks:</strong> permanent block sites with active planting lifecycle (Active, Suspended, Removed), retire and replant workflows, and full planting history.</li>
<li><strong>Phenology:</strong> BBCH growth stage observation log (stages 00–97) with percentage reached and temperature.</li>
<li><strong>Operations:</strong> canopy and pruning operations including winter pruning, shoot thinning, leaf removal, green harvest, and mechanical/hand harvest.</li>
<li><strong>Harvest:</strong> vintage yield and must chemistry records with destination type, botrytis advisory, and task-raise prompt.</li>
<li><strong>Disease Scouting:</strong> walkabout pressure ratings with notifiable organism alerts for Xylella and Phytophthora.</li>
</ul>
<h3>Winery compliance tabs</h3>
<ul>
<li>Licensing, Excise &amp; Duty, Tastings &amp; Tours, Age Verification (Challenge 25), Wine Production (SO₂ compliance).</li>
</ul>
<h3>Mobile app</h3>
<p>Four dedicated mobile screens: Vine Scouting, Vine Phenology, Vine Operation, and Vine Harvest — each with an active block picker that shows registered blocks with live/suspended status.</p>`,
  ],

  // 181 — Vine Register — UK Variety and Rootstock Selects, Removal Status and Audit Trail
  [
    "How to use the Vine Register in BDE Farm Trac, including UK variety and rootstock selectors, removal records, and the permanent audit trail.",
    `<h2>Vine Register — UK Variety and Rootstock Selects, Removal Status and Audit Trail</h2>
<p>The Vine Register is the master list of every vine variety on your holding. Each entry records the planting details — variety, rootstock, vine count, GI classification, and wine colour — and captures any subsequent removal with a reason and date, providing a permanent audit trail of the vineyard's varietal composition over time.</p>
<h3>Available varieties (24)</h3>
<p>Bacchus, Pinot Noir, Pinot Gris, Pinot Blanc, Pinot Meunier, Chardonnay, Rondo, Solaris, Regent, Sauvignon Blanc, Müller-Thurgau, Ortega, Seyval Blanc, Reichensteiner, Madeleine Angevine, Dornfelder, Phoenix, Siegerrebe, Gewürztraminer, Kernling, Maréchal Foch, Johanniter, Cabernet Cortis, and Other.</p>
<h3>Available rootstocks (14)</h3>
<p>SO4, 5C Teleki, 420A, 3309 Couderc, 161-49 Couderc, 101-14 Millardet de Grasset, Riparia Gloire de Montpellier, 1103 Paulsen, 110 Richter, 140 Ruggeri, 196-17 Castel, Börner, Gravesac, 41B, and Own Rooted.</p>
<h3>GI Classification</h3>
<p>Record each vine's GI classification: English Wine PDO, English Wine PGI, Welsh Wine PDO, Welsh Wine PGI, UK Table Wine, or No GI. This is required for geographical indication compliance under UK wine regulations and is referenced in Harvest records when determining which GI applies to the resulting wine.</p>
<h3>Removal records</h3>
<p>When vines are removed, record the removal date, reason (grubbing up, replanting, disease, or other), and the operative who removed them. The vine is flagged as removed but retained in the register with its full planting history — the audit trail shows exactly what was growing where and when.</p>`,
  ],

  // 182 — Vineyard Block Management — Permanent Block Sites, Active Planting Lifecycle
  [
    "How vineyard block management works in BDE Farm Trac, including permanent block sites, planting lifecycles, retire and replant workflows, and planting history.",
    `<h2>Vineyard Block Management — Permanent Block Sites, Active Planting Lifecycle (Active, Suspended, Removed), Retire and Replant Workflows, and Full Planting History per Block</h2>
<p>Vineyard blocks in BDE Farm Trac are permanent geographic sites — they persist regardless of what is planted in them. Each block has a current active planting, and a complete history of all previous plantings. This design means no data is lost when a block is grubbed up and replanted, and the full productivity history of each site is always accessible.</p>
<h3>Block structure</h3>
<p>Navigate to <strong>Viticulture → Vineyard Blocks</strong>. Each block record shows the block name, reference, aspect, slope, soil type, organic status, BPS/SFI parcel reference, and the current active planting — its variety, rootstock, vine count, spacing, training system, and planting date.</p>
<h3>Planting lifecycle</h3>
<p>Each planting has one of three statuses:</p>
<ul>
<li><strong>Active:</strong> vines are producing — shown in green in the block picker on all record forms.</li>
<li><strong>Suspended:</strong> temporarily out of production (e.g. severe frost damage or replanting gap) — shown in amber.</li>
<li><strong>Removed:</strong> the planting has been grubbed up — historical record only.</li>
</ul>
<h3>Retire and replant workflow</h3>
<p>When a block is grubbed up, click <strong>Retire Planting</strong> on the active planting. Record the deactivation date, reason type (temporary suspension, grubbed up, replanting, or other), the operator, and any notes. The planting moves to Removed status. When the block is replanted, click <strong>Replant Block</strong> to create a new planting record linked to the same permanent block site. The new planting's history shows its relationship to all previous plantings on the same site.</p>`,
  ],

  // 183 — BBCH Phenology Records — Growth Stage Observation Log and Season Comparison
  [
    "How to record BBCH phenology observations in BDE Farm Trac and compare growth stage progression across seasons.",
    `<h2>BBCH Phenology Records — Growth Stage Observation Log and Season Comparison</h2>
<p>BBCH phenology records document the progression of your vineyard through each growth stage from winter dormancy to harvest ripeness. This data is used for spray timing decisions, harvest planning, and season-to-season comparison of how your vineyard develops under different climate conditions.</p>
<h3>Recording a phenology observation</h3>
<p>Navigate to <strong>Viticulture → Phenology</strong> and click <strong>Add Phenology Record</strong>. Record:</p>
<ul>
<li><strong>Observation date.</strong></li>
<li><strong>Block:</strong> selected from your registered vineyard blocks (active blocks shown in green).</li>
<li><strong>BBCH growth stage:</strong> selected from the full 23-stage list — Stage 00 (Winter dormancy) through Stage 97 (Harvest ripeness).</li>
<li><strong>Percentage of vines at this stage:</strong> e.g. 50% at Stage 07 (Bud swell) while 50% are still at Stage 05 (Wool stage).</li>
<li><strong>Description:</strong> free-text observation notes.</li>
<li><strong>Observer:</strong> auto-filled from your logged-in user name.</li>
<li><strong>Air temperature at time of observation (°C).</strong></li>
</ul>
<h3>Season-by-season comparison</h3>
<p>Export all phenology records to CSV and filter by block and BBCH stage to compare the date of budburst, flowering, and veraison across multiple seasons. Comparing your phenology record with weather data and yield outcomes helps identify whether early or late seasons correlate with particular yield or quality results in your vineyard.</p>`,
  ],

  // 184 — Canopy & Pruning Operations — Operation Types, Pruning Systems and Bud Count Records
  [
    "How to record viticulture canopy and pruning operations in BDE Farm Trac, including operation types, pruning systems, and bud count records.",
    `<h2>Canopy & Pruning Operations — Operation Types, Pruning Systems and Bud Count Records</h2>
<p>The Operations tab in the Viticulture module records all vineyard canopy management activities from winter pruning through to pre-harvest green operations. These records provide the evidence trail for the agronomic decisions made in your vineyard each season and the labour and contractor costs associated with them.</p>
<h3>Operation types</h3>
<p>Select from 12 operation types grouped by season:</p>
<ul>
<li><strong>Winter:</strong> Winter Pruning, Spur Pruning, Guyot Pruning, Cane Renewal.</li>
<li><strong>Spring/Summer canopy:</strong> Shoot Thinning, Shoot Positioning / Tucking In, Leaf Removal, Sucker Removal.</li>
<li><strong>Summer:</strong> Green Harvest / Bunch Thinning, Shoot Trimming / Topping.</li>
<li><strong>Harvest:</strong> Mechanical Harvest, Hand Harvest.</li>
</ul>
<h3>Pruning sub-fields</h3>
<p>For pruning operation types, additional fields appear automatically:</p>
<ul>
<li><strong>Pruning system:</strong> Guyot, Cordon, Gobelet / Bush Vine, or other free text.</li>
<li><strong>Target buds per vine.</strong></li>
<li><strong>Actual buds per vine:</strong> the count achieved after pruning — often differs from target due to vine condition and cane quality.</li>
<li><strong>Pruning weight (kg/vine):</strong> recorded to three decimal places for season-to-season vigour comparison.</li>
<li><strong>Shoots removed (%).</strong></li>
</ul>
<h3>Contractor and labour records</h3>
<p>Record the operator (auto-filled), contractor name if the work was contracted out, and hours worked. These feed into labour cost analysis in the Business Reports module for the vineyard enterprise gross margin.</p>`,
  ],

  // 185 — Harvest Records — Yield, Must Chemistry (Brix, pH, TA, Potential Alcohol) and Botrytis Flag
  [
    "How to record vintage harvest records in BDE Farm Trac, including yield data, must chemistry, destination type, and the botrytis advisory.",
    `<h2>Harvest Records — Yield, Must Chemistry (Brix, pH, TA, Potential Alcohol) and Botrytis Flag</h2>
<p>The Harvest tab records the yield and must chemistry data for each vintage and each vineyard block — the core data that winemakers need for processing decisions and that regulatory bodies require for PDO/PGI compliance. BDE Farm Trac includes a botrytis advisory system and an automatic task-raise prompt for concerning quality findings.</p>
<h3>Recording a harvest</h3>
<p>Navigate to <strong>Viticulture → Harvest</strong> and click <strong>Add Harvest Record</strong>. Complete:</p>
<ul>
<li><strong>Harvest date and vintage year.</strong></li>
<li><strong>Block:</strong> from the active block list.</li>
<li><strong>Yield data:</strong> total yield (kg), yield per vine (kg/vine), yield per hectare (t/ha).</li>
<li><strong>Must chemistry:</strong> Brix degrees, pH, titratable acidity (g/L), potential alcohol (%).</li>
<li><strong>Grape condition:</strong> Excellent, Good, Fair, or Poor.</li>
<li><strong>Botrytis present:</strong> toggle — reveals the Botrytis Percentage field. An amber advisory appears when botrytis is recorded, prompting review with the winemaker before processing.</li>
<li><strong>Harvest destination type:</strong> Own Holding / Own Processing, Contract Processor / Contract Winery, or Grape Sale. The contract processor and grape sale options reveal a Trade Contact picker.</li>
<li><strong>Operator:</strong> auto-filled.</li>
</ul>
<h3>Automatic task raise</h3>
<p>If grape condition is rated as Poor, or if botrytis percentage exceeds 30%, the Raise Task dialog opens automatically after saving — pre-filled with the block name, vintage year, yield, botrytis percentage, and Brix — so you can assign a winemaker review task without leaving the harvest workflow.</p>`,
  ],

  // 186 — Disease & Pest Scouting — Pressure Ratings, Xylella and Phytophthora Notifiable Organism Flags
  [
    "How to record disease and pest scouting observations in BDE Farm Trac, including pressure ratings and mandatory APHA alerts for Xylella and Phytophthora.",
    `<h2>Disease & Pest Scouting — Pressure Ratings, Xylella and Phytophthora Notifiable Organism Flags</h2>
<p>Regular disease and pest scouting is essential for vineyard protection and is required as evidence of integrated pest management for some assurance schemes. BDE Farm Trac's Disease Scouting tab provides a structured walkabout log with pressure ratings, automatic notification triggers, and mandatory APHA alert prompts for notifiable organisms.</p>
<h3>Pressure rating system</h3>
<p>Each scouting record captures pressure ratings on a four-point scale (0 None, 1 Low, 2 Medium, 3 High) for six pathogens and pests: Botrytis, Downy Mildew, Powdery Mildew, Phomopsis, Leafhopper, and Spider Mite. Additionally, flag-type switches capture: Vine Weevil sighted, Eutypa Dieback sighted, and two notifiable organism flags.</p>
<h3>Notifiable organism flags</h3>
<p>Two mandatory alert flags cover notifiable vine diseases:</p>
<ul>
<li><strong>Xylella fastidiosa suspected:</strong> triggers a red mandatory advisory reminding you to contact APHA immediately on 0300 1000 313 before moving any plant material.</li>
<li><strong>Phytophthora viticola suspected:</strong> same mandatory alert.</li>
</ul>
<p>Neither of these organisms is currently present in the UK. Early detection and immediate reporting to APHA is the only effective response to prevent establishment. Both flags generate critical SMS alerts to all opted-in users immediately on saving the record.</p>
<h3>Automatic task raise</h3>
<p>After saving a scouting record with Medium or High pressure for any disease, a Vine Weevil sighting, or a notifiable organism flag, the Raise Task dialog opens automatically on the dashboard — pre-filled with the scouting details — so you can assign a spray review or APHA notification task immediately.</p>`,
  ],

  // 187 — Viticulture Mobile Screens — Vine Scouting, Phenology, Operations and Harvest with Active Block Picker
  [
    "How the four viticulture mobile screens in BDE Farm Trac work, including the active block picker and offline behaviour.",
    `<h2>Viticulture Mobile Screens — Vine Scouting, Phenology, Operations and Harvest with Active Block Picker</h2>
<p>The BDE Farm Trac mobile app includes four dedicated viticulture recording screens for use in the vineyard — Vine Scouting, Vine Phenology, Vine Operation, and Vine Harvest. Each screen features an Active Block Picker that shows your registered blocks with their live planting status, making block selection fast and accurate even on a mobile screen.</p>
<h3>Active Block Picker</h3>
<p>The block picker appears at the top of each viticulture mobile screen. It fetches all registered vineyard blocks from the local cache. Active plantings are shown with a green indicator; suspended plantings are shown in amber. If no blocks are registered (or when offline with an empty cache), the picker falls back to a free-text entry field for manual block name entry.</p>
<h3>Vine Scouting screen</h3>
<p>Tap-to-set pressure pickers for each disease and pest (None / Low / Medium / High), Vine Weevil and Eutypa Dieback flags, and notifiable organism checkboxes (Xylella and Phytophthora) with mandatory APHA alert prompts. The Raise Task sheet opens for high-pressure findings.</p>
<h3>Vine Phenology screen</h3>
<p>BBCH stage picker with season filter tabs (Winter / Spring / Summer / Autumn) to narrow the stage list. Percentage reached and temperature fields.</p>
<h3>Vine Operation screen</h3>
<p>Operation type picker grouped by season. Pruning sub-form (system, bud counts, pruning weight) appears automatically for pruning operation types. Staff and contractor fields.</p>
<h3>Vine Harvest screen</h3>
<p>Yield fields, must chemistry, grape condition chip picker, botrytis toggle with amber advisory, destination type chip selector (Own Holding / Contract Processor / Grape Sale) with contact name field. Raise Task sheet triggers on Poor condition or botrytis &gt;30%.</p>`,
  ],

  // 188 — Winery Licensing — Premises Licence, Personal Licence, DPS and Expiry Status Records
  [
    "How to record premises and personal licences in BDE Farm Trac's Viticulture winery licensing register.",
    `<h2>Winery Licensing — Premises Licence, Personal Licence, DPS and Expiry Status Records</h2>
<p>UK wineries that sell alcohol directly to the public — cellar door sales, tasting events, mail order — must hold a Premises Licence and a Personal Licence for the Designated Premises Supervisor (DPS). BDE Farm Trac's Licensing tab in the Viticulture module maintains a complete register of all winery licences with expiry tracking.</p>
<h3>Recording a licence</h3>
<p>Navigate to <strong>Viticulture → Licensing</strong> and click <strong>Add Licence</strong>. Record:</p>
<ul>
<li><strong>Licence type:</strong> Premises Licence or Personal Licence.</li>
<li><strong>Licensing authority:</strong> the local council that issued the licence.</li>
<li><strong>Licence reference number.</strong></li>
<li><strong>Issue date and expiry date.</strong></li>
<li><strong>Designated Premises Supervisor (DPS) name:</strong> the named licence holder responsible for the premises.</li>
<li><strong>Status:</strong> Active, Suspended, Expired, or Revoked.</li>
</ul>
<h3>Expiry alerts</h3>
<p>Expired licences are flagged with a red chip on the licence card. Licences expiring within 90 days are flagged amber. Selling alcohol from unlicensed premises is a criminal offence under the Licensing Act 2003. The Licensing tab alerts you well in advance so renewal can be planned before the licence lapses.</p>
<h3>DPS change</h3>
<p>If the DPS changes (the key holder named on the Personal Licence leaves or changes role), this is a material change to the licence. Record a new licence entry for the updated DPS and mark the previous licence as Inactive — the history of who was DPS and when is retained for inspection purposes.</p>`,
  ],

  // 189 — Winery Excise & Duty Returns — HMRC Wine Duty Register, Payment Status and Return Period Tracking
  [
    "How to record HMRC wine excise duty returns in BDE Farm Trac's Viticulture Excise & Duty tab.",
    `<h2>Winery Excise & Duty Returns — HMRC Wine Duty Register, Payment Status and Return Period Tracking</h2>
<p>UK wineries must submit excise duty returns to HMRC for wine produced and any wine removed from bond for home use or sale. The frequency of returns depends on your annual duty liability — most small UK wineries submit quarterly. BDE Farm Trac's Excise &amp; Duty tab maintains a complete register of all duty returns with payment status tracking.</p>
<h3>Recording a duty return</h3>
<p>Navigate to <strong>Viticulture → Excise &amp; Duty</strong> and click <strong>New Return</strong>. Record:</p>
<ul>
<li><strong>Return period start and end date.</strong></li>
<li><strong>Total wine volume (litres):</strong> the volume of wine produced or removed from duty suspension during the period.</li>
<li><strong>Duty rate (£/litre):</strong> the applicable HMRC rate for the wine strength range.</li>
<li><strong>Duty due (£):</strong> calculated automatically from volume × rate, or enter manually if HMRC's calculation differs.</li>
<li><strong>Submission date:</strong> the date the return was submitted to HMRC.</li>
<li><strong>Payment status:</strong> Draft, Submitted, Paid, or Overdue.</li>
<li><strong>HMRC reference number.</strong></li>
</ul>
<h3>Overdue alerts</h3>
<p>Any return in <em>Submitted</em> status where payment has not been recorded by the due date is automatically flagged as Overdue with a red chip. Late payment of wine duty incurs HMRC surcharges. Set the payment status to Paid as soon as the CHAPS or BACs payment clears.</p>`,
  ],

  // 190 — Winery Tastings & Tours — Cellar Door Event Register, Attendee Counts and Session Revenue
  [
    "How to record cellar door tastings, vineyard tours, and other winery events in BDE Farm Trac.",
    `<h2>Winery Tastings & Tours — Cellar Door Event Register, Attendee Counts and Session Revenue</h2>
<p>Cellar door tastings and vineyard tours are increasingly important revenue streams for UK wineries. The Tastings &amp; Tours tab provides a register of all events with attendance, revenue, and DPS presence records — supporting licensing authority reporting and winery income tracking in the Finance module.</p>
<h3>Recording a tasting or tour event</h3>
<p>Navigate to <strong>Viticulture → Tastings &amp; Tours</strong> and click <strong>New Event</strong>. Record:</p>
<ul>
<li><strong>Session date.</strong></li>
<li><strong>Session type:</strong> Public Tasting, Trade Tasting, Private Tasting, or Vineyard Tour.</li>
<li><strong>Number of attendees.</strong></li>
<li><strong>Ticket or cover price (£).</strong></li>
<li><strong>Total session revenue (£).</strong></li>
<li><strong>DPS present:</strong> toggle to confirm the Designated Premises Supervisor was present during the session. This is a licensing condition for many Premises Licences — the DPS must be on site when alcohol is sold or supplied.</li>
<li><strong>Operator name:</strong> the member of staff who led the session (auto-filled from logged-in user).</li>
<li><strong>Notes.</strong></li>
</ul>
<h3>Revenue integration</h3>
<p>Session revenue figures feed into the Farm Diversification module's income records for tax and gross margin reporting. The total revenue from cellar door activities is shown in the annual revenue summary alongside accommodation, farm shop, and other diversification income streams.</p>`,
  ],

  // 191 — Winery Age Verification (Challenge 25) — ID Check Register, Outcome Log and Compliance Audit Trail
  [
    "How to maintain the Challenge 25 age verification register in BDE Farm Trac for winery on-site wine sales compliance.",
    `<h2>Winery Age Verification (Challenge 25) — ID Check Register, Outcome Log and Compliance Audit Trail</h2>
<p>The Challenge 25 policy requires winery staff to ask any customer who looks under 25 to produce valid photographic ID before purchasing or consuming alcohol on the premises. Maintaining a contemporaneous log of Challenge 25 checks is both a best practice defence against underage sales and, in some licences, a condition of the Premises Licence.</p>
<h3>Recording a Challenge 25 check</h3>
<p>Navigate to <strong>Viticulture → Age Verification</strong> and click <strong>New Check Record</strong>. Record:</p>
<ul>
<li><strong>Check date and time.</strong></li>
<li><strong>Operator name:</strong> the staff member who carried out the check (auto-filled from logged-in user).</li>
<li><strong>Location:</strong> Cellar Door, Tasting Room, Farm Shop, Event, or other.</li>
<li><strong>Outcome:</strong> Passed — over 18, Refused — under 18, or Inconclusive (could not verify).</li>
<li><strong>ID type presented:</strong> Passport, Driving Licence, PASS-accredited ID card, or Other.</li>
<li><strong>Action taken:</strong> sale completed (for passes), sale refused (for failures or inconclusives).</li>
</ul>
<h3>Compliance audit trail</h3>
<p>The complete register of Challenge 25 checks provides the documented audit trail that demonstrates your Challenge 25 policy is being actively applied at the point of sale. In the event of an HMRC or licensing authority check or complaint, this register is the primary evidence that your team follows the policy consistently.</p>`,
  ],

  // 192 — Wine Production — SO₂ Compliance, Additive Records and Organic Wine Certification per Vintage
  [
    "How to record wine production SO₂ compliance and additive records in BDE Farm Trac for each vintage, including organic wine certification.",
    `<h2>Wine Production — SO₂ Compliance, Additive Records and Organic Wine Certification per Vintage</h2>
<p>The Wine Production tab records SO₂ and additive use per vintage and per wine type. It covers both conventional and organic wine production in a single register — the tab is shared between the Viticulture module and the Organic Viticulture module, so all records are visible from both places.</p>
<h3>Recording a wine production entry</h3>
<p>Navigate to <strong>Viticulture → Wine Production</strong> and click <strong>New Record</strong>. Each entry covers one additive used in one vintage:</p>
<ul>
<li><strong>Vintage year.</strong></li>
<li><strong>Wine colour:</strong> Red, White, Rosé, or Sparkling.</li>
<li><strong>Production volume (litres).</strong></li>
<li><strong>Certified organic:</strong> toggle — reveals the certifier name and certifier reference fields.</li>
<li><strong>Additive name and type:</strong> Sulphites / SO₂, Fining Agent, Stabiliser, Acidifier, Preservative, or Other.</li>
<li><strong>Quantity used and unit.</strong></li>
<li><strong>Maximum permitted level.</strong></li>
<li><strong>Actual SO₂ (mg/L) and maximum SO₂ permitted (mg/L).</strong></li>
<li><strong>SO₂ compliant flag.</strong></li>
</ul>
<h3>Organic wine SO₂ limits</h3>
<p>For organic wines, UK-retained EU Regulation 203/2012 sets maximum total SO₂ of 100 mg/L for red wine and 150 mg/L for white and rosé. Where actual SO₂ exceeds the applicable limit, the record shows an Exceeds Limit chip in red — a compliance breach that must be investigated and resolved with your certifier before the wine can be sold as organic.</p>`,
  ],

  // 193 — Organic Livestock — Feed Records Log, Date Defaults & Species-Filtered Herd Selector
  [
    "How the Organic Livestock feed records log works in BDE Farm Trac, including date defaults and species-filtered herd selection.",
    `<h2>Organic Livestock — Feed Records Log, Date Defaults & Species-Filtered Herd Selector</h2>
<p>Organic livestock feeding records document the ration composition for each herd or flock on a daily or batch basis — confirming that the minimum organic feed proportion is maintained and that no non-permitted feed materials are being used. The BDE Farm Trac Organic Livestock module makes this recording as efficient as possible through intelligent defaults and filtered selectors.</p>
<h3>Species-filtered herd selector</h3>
<p>When opening a new Organic Livestock feed record, the herd picker automatically shows only herds of the species relevant to the currently selected record type. If you are adding a cattle feed record, only cattle herds are shown. This prevents data entry errors where feed records for the wrong species are accidentally linked to a herd.</p>
<h3>Date defaults</h3>
<p>The feed record date field defaults to today. For records entered daily (as recommended), this means you only need to confirm the date rather than re-selecting it each time. For batch records covering a full week or fortnight of the same ration, the start and end date range is entered once.</p>
<h3>Organic feed proportion calculation</h3>
<p>Each feed component is entered with its organic status (Certified Organic, In Conversion Organic, or Conventional). The record calculates the organic dry matter proportion automatically — the total organic and in-conversion DM as a percentage of total DM. Conventional feed may be included up to 10% of DM (25% for ruminants in their first year of conversion). Records where the conventional proportion exceeds the permitted allowance are flagged for review.</p>`,
  ],

  // 194 — Organic Livestock — Feed Derogations: Case Management, Correspondence Log & Document Storage
  [
    "How to manage organic livestock feed derogation cases in BDE Farm Trac, including correspondence logs and document storage.",
    `<h2>Organic Livestock — Feed Derogations: Case Management, Correspondence Log & Document Storage</h2>
<p>When organic-certified feed for a specific ingredient or species is genuinely unavailable, organic producers may apply to their certifier for a feed derogation — permission to use a non-organic ingredient for a defined period. BDE Farm Trac provides a full case management workflow for organic livestock feed derogations.</p>
<h3>Creating a derogation case</h3>
<p>Navigate to <strong>Organic → Livestock → Feed Derogations</strong> and click <strong>New Case</strong>. Record the ingredient requiring derogation, the species it applies to, the certifying body, the search evidence for organic availability (date and reference of the availability search), the application date, and the justification. Save — the case is created at <em>Pending</em> status.</p>
<h3>Recording a decision</h3>
<p>When the certifier issues a decision, open the case and click <strong>Record Decision</strong>. Enter the decision date, outcome (Approved, Refused, Withdrawn, or Expired), expiry date (for approvals), and any approval conditions specified by the certifier.</p>
<h3>Correspondence log</h3>
<p>Expand any case card to view and add correspondence entries — each with the date, direction (Inbound/Outbound), type (Email, Letter, Phone Call, Decision Notice, or other), summary, and reference number. This creates a complete communication trail from first application to decision, satisfying the certifier audit requirement that derogation evidence includes the full correspondence history.</p>
<h3>Document storage</h3>
<p>Attach the availability search evidence, application submission, and approval/refusal letter to the case. All documents are stored permanently in the case record and can be retrieved instantly for an annual inspection.</p>`,
  ],

  // 195 — Organic Livestock — Outdoor Access Log, Herd Register Cascade & Compliance Status
  [
    "How to record organic livestock outdoor access events in BDE Farm Trac and maintain compliance status in the herd register.",
    `<h2>Organic Livestock — Outdoor Access Log, Herd Register Cascade & Compliance Status</h2>
<p>UK Organic Regulations 2020 require that organic livestock have access to open-air areas (outdoor runs or pasture) whenever weather and ground conditions permit. The Outdoor Access Log records when outdoor access is provided and when it is withheld, including the reason for any restriction — creating the documented evidence that certifiers look for at annual inspections.</p>
<h3>Recording outdoor access</h3>
<p>Navigate to <strong>Organic → Livestock → Outdoor Access</strong> and click <strong>New Record</strong>. For each day or period, record:</p>
<ul>
<li><strong>Herd or flock:</strong> from the species-filtered herd selector.</li>
<li><strong>Date or date range.</strong></li>
<li><strong>Access provided:</strong> Yes / No.</li>
<li><strong>If No — reason for restriction:</strong> Weather (excessive rainfall, frost, snow), Ground conditions (poached or waterlogged), Veterinary advice, or Other.</li>
<li><strong>Hours of access provided:</strong> if partial day access.</li>
</ul>
<h3>Herd register cascade</h3>
<p>The Outdoor Access Log is linked to the Herd Register entry for each herd. On the herd's record, the compliance status section shows a summary of outdoor access compliance — the number of days access was provided versus denied in the current certification period, and a percentage access figure that can be compared against the certifier's expected minimum.</p>
<h3>Seasonal patterns</h3>
<p>The Outdoor Access chart on the Organic Livestock overview page shows month-by-month access vs restriction across the certification year. Certifiers expect to see a clear pattern of access during spring, summer, and autumn, with documented restrictions concentrated in the winter months when weather and ground conditions typically prevent safe access.</p>`,
  ],

  // 196 — Organic Dairy — Milk Collection Records, Feed Records & Daily Date Defaults
  [
    "How milk collection records and feed records work in BDE Farm Trac's Organic Dairy module, with daily date default functionality.",
    `<h2>Organic Dairy — Milk Collection Records, Feed Records & Daily Date Defaults</h2>
<p>The Organic Dairy module provides dedicated milk collection and feed records for organic dairy herds, designed for quick daily data entry with smart defaults that reduce the time required to maintain accurate records.</p>
<h3>Daily date defaults</h3>
<p>When you open any Organic Dairy record form — milk collection or feed record — the date field defaults to today. For dairy farms where records are entered daily, this means only the quantity or ration details need to be entered — the date is already correct. If entering a historical record, simply change the date before saving.</p>
<h3>Milk collection records</h3>
<p>Navigate to <strong>Organic → Dairy → Milk Collection</strong> and click <strong>New Collection</strong>. Record the collection date, volume collected (litres), collection tanker reference, and milk buyer. The cumulative volume collected month-to-date is shown on the collection record page for quick checking against the dairy's statement.</p>
<h3>Feed records</h3>
<p>Navigate to <strong>Organic → Dairy → Feed Records</strong>. Each feed record logs the date or date range, the herd (selected from the organic cattle herd list), and the ration composition. Each component is entered with its feed type (forage, concentrate, mineral), organic status (Certified Organic, In Conversion, Conventional — within the 10% allowance), and dry matter percentage. The organic DM proportion is calculated automatically. Records where conventional inclusion exceeds the permitted level are flagged for review and certifier notification.</p>`,
  ],

  // 197 — Organic Fresh Produce — Input Log, Supplier Lookup, Applied-By Staff & Date Defaults
  [
    "How the Organic Fresh Produce input log works in BDE Farm Trac, including supplier lookup, applied-by staff records, and date defaults.",
    `<h2>Organic Fresh Produce — Input Log, Supplier Lookup, Applied-By Staff & Date Defaults</h2>
<p>The Organic Fresh Produce Input Log records every input applied to organic-certified growing areas — fertilisers, soil conditioners, pest control products, and biostimulants. Each input must be permitted under the UK Organic Regulations 2020 and traceable to its supplier. BDE Farm Trac's log provides fast, accurate entry through smart defaults and integrated supplier lookup.</p>
<h3>Supplier lookup</h3>
<p>When recording an organic input, the supplier field connects to the Trade Contacts &amp; Stock supplier directory. Searching by name or product type returns registered organic-approved suppliers with their UKOP or certifier approval status visible in the search results. Selecting a registered supplier auto-populates the contact and approval details on the input record — no re-typing required.</p>
<h3>Applied-by staff</h3>
<p>The Applied By field is pre-filled from the logged-in user but can be changed to any registered staff member. Recording who applied each input satisfies the operator traceability requirement of GlobalG.A.P. and Red Tractor Fresh Produce — particularly important for spray operators who must hold PA certificates for pesticide applications.</p>
<h3>Date defaults</h3>
<p>The application date defaults to today. For records entered at the time of application, no date change is needed — simply enter the input details and save. This reduces the risk of date errors in records that need to be entered quickly during a busy operational day.</p>
<h3>Organic approval status</h3>
<p>Each input is assigned an approval status (Permitted, Restricted, Derogation Required, or Not Permitted) from the Organic Input Register. Not Permitted inputs flagged in an application record generate a compliance alert — this input should not have been used on organic land and the certifier must be notified.</p>`,
  ],

  // 198 — Organic Fresh Produce — Input Derogations: Case Register, Correspondence Log & Document Storage
  [
    "How to manage organic fresh produce input derogation cases in BDE Farm Trac, including case workflow, correspondence, and document storage.",
    `<h2>Organic Fresh Produce — Input Derogations: Case Register, Correspondence Log & Document Storage</h2>
<p>When a permitted organic input for a specific application is genuinely unavailable, organic fresh produce growers can apply to their certifier for an input derogation. BDE Farm Trac provides the same full derogation case management workflow for fresh produce as for livestock and viticulture — a split New Case / Record Decision workflow with a correspondence log and document storage.</p>
<h3>New case workflow</h3>
<p>Navigate to <strong>Organic → Fresh Produce → Input Derogations</strong> and click <strong>New Case</strong>. The new case form captures the input name, input type, crop it is required for, regulatory basis, certifying body, availability search date and reference, application date, and justification. On saving, the case is created at Pending status with no decision fields — the decision is recorded separately when received.</p>
<h3>Record decision workflow</h3>
<p>When the certifier issues their decision, open the case card and click <strong>Record Decision</strong>. Enter the decision date, outcome, expiry date (for approvals), and any approval conditions. The case status updates and an expiry urgency badge appears at 90 and 30 days before the approval expires, prompting renewal or a return to permitted organic sources.</p>
<h3>Correspondence log and documents</h3>
<p>Expand any case card to view and add correspondence entries. Attach availability search evidence, application submissions, and certifier decision letters directly to the case record. The complete case file — application, correspondence, and decision — is permanently stored and instantly retrievable for annual certification inspection.</p>`,
  ],

  // 199 — Organic Dairy — Feed Derogation Case Linking in Feed & Nutrition Records
  [
    "How to link organic dairy feed derogation cases to individual feed and nutrition records in BDE Farm Trac.",
    `<h2>Organic Dairy — Feed Derogation Case Linking in Feed & Nutrition Records</h2>
<p>When conventional feed is included in an organic dairy ration under a certifier-approved derogation, the feed record must reference the derogation case to demonstrate that the use is authorised. BDE Farm Trac's Organic Dairy module provides a derogation case picker that links individual feed records to the relevant approved derogation.</p>
<h3>How linking works</h3>
<p>When creating an Organic Dairy Feed Record and marking a feed component as Conventional (within the derogation allowance), a <strong>Derogation Case</strong> field appears. The picker shows all active, approved derogation cases for dairy cattle feed. Select the relevant case — the record is linked to the approved derogation, referencing the certifier's approval reference, the approved ingredient, and the derogation expiry date.</p>
<h3>Why this matters</h3>
<p>At annual inspection, your certifier will check that any conventional feed included in the ration was covered by a valid, unexpired derogation. Without the linkage from each feed record to the specific derogation, you would need to manually cross-reference dates and ingredient names to demonstrate compliance. The derogation link on each record makes this instant — the certifier can see the approval reference on the same record as the feed entry.</p>
<h3>Derogation expiry alert</h3>
<p>If a derogation case linked to a feed record expires before the end of the record's date range, the record is flagged with an amber warning — the derogation was in place at the start of the period but expired before the end. Either obtain a renewed derogation or source a certified organic alternative for the remaining period.</p>`,
  ],

  // 200 — Mobile App — FP Input Derogation Register: Viewing Cases and Logging Derogation-Required Inputs
  [
    "How to view organic fresh produce input derogation cases and log derogation-required inputs from the BDE Farm Trac mobile app.",
    `<h2>Mobile App — FP Input Derogation Register: Viewing Cases and Logging Derogation-Required Inputs</h2>
<p>Organic fresh produce growers who need to apply inputs under an approved derogation can view their active derogation cases and log the resulting input applications directly from the BDE Farm Trac mobile app — particularly useful when applying inputs in the field without returning to an office.</p>
<h3>Viewing derogation cases</h3>
<p>Open the mobile app and navigate to <strong>Organic → FP Derogations</strong>. The screen shows all active input derogation cases with their status chips (Pending, Approved, Refused, Expired, or Withdrawn) and a summary count row. Tap any case card to view the full detail — certifier reference, approval date, expiry date with urgency badge, availability search evidence, justification, and any approval conditions.</p>
<h3>Logging a derogation-required input</h3>
<p>When an approved derogation requires an input application, navigate to the Organic FP Input Log screen. Add a new input record and select the input type. If the input requires a derogation (flagged as Derogation Required in the Input Register), a derogation case picker appears — select the relevant approved case from the list of active approvals. Save the record. The application is logged against the field and linked to the derogation approval for the certifier's audit trail.</p>
<h3>Offline behaviour</h3>
<p>Derogation case data is cached on the device during the last refresh. If you are offline in the field, the cached case data is available in the picker. Records created offline sync automatically when connectivity is restored.</p>`,
  ],

  // 201 — Mobile App — Organic Farming Quick Capture: Herd Lookup, Outdoor Access & Treatment Recording
  [
    "How to use the BDE Farm Trac mobile app for quick organic farming data capture, including herd lookup, outdoor access, and treatment recording.",
    `<h2>Mobile App — Organic Farming Quick Capture: Herd Lookup, Outdoor Access & Treatment Recording</h2>
<p>The BDE Farm Trac mobile app provides a dedicated Organic Farming Quick Capture section that brings the most time-sensitive organic record types together in one place — herd lookups, outdoor access daily records, and treatment compliance checks — for use during daily farm rounds without needing to navigate through multiple screens.</p>
<h3>Herd lookup</h3>
<p>Open <strong>Organic → My Herds</strong> to see all organic herds and flocks registered on your holding with their current certification status (In Conversion or Fully Organic), outdoor access status (Access Provided Today / No Access Today), and any active treatment withdrawal flags. Tap a herd card to open its detail and log records directly against it.</p>
<h3>Outdoor access daily records</h3>
<p>The Outdoor Access quick capture form is pre-populated with today's date and your registered herds. For each herd, tap <em>Access Provided</em> or <em>No Access — Reason</em>. If no access: select the reason (Weather, Ground Conditions, Veterinary Advice, or Other) from the picker. Save. The record is submitted immediately and appears in the Outdoor Access Log on the dashboard.</p>
<h3>Treatment recording</h3>
<p>When an organic animal requires treatment, the mobile treatment form includes an organic compliance layer — the selected product is checked against the permitted medicines list, and a warning appears if the product is not permitted for organic livestock. The organic withdrawal period (typically double the standard label period) is calculated and shown on the treatment confirmation screen.</p>`,
  ],

  // 202 — Organic Viticulture — Block Conversion Register: 3-Year Conversion Tracking and Certifying Body Records
  [
    "How to record vineyard block conversion status in BDE Farm Trac's Organic Viticulture module, including 3-year conversion period tracking.",
    `<h2>Organic Viticulture — Block Conversion Register: 3-Year Conversion Tracking and Certifying Body Records</h2>
<p>Organic vineyard certification in the UK requires a minimum three-year conversion period during which the land is managed organically but the resulting wine cannot be sold as organic wine. The Block Conversion Register in BDE Farm Trac tracks this period per block, showing when each block becomes eligible for full organic certification.</p>
<h3>Recording a block conversion</h3>
<p>Navigate to <strong>Organic Viticulture → Block Conversion</strong> and click <strong>New Record</strong>. Record:</p>
<ul>
<li><strong>Block name:</strong> from the registered vineyard block list.</li>
<li><strong>Certifying body:</strong> Soil Association, OF&amp;G, or other UK-approved certifier.</li>
<li><strong>Conversion start date:</strong> the date on which organic management of the block commenced.</li>
<li><strong>Fully organic date:</strong> typically three years from the conversion start date, unless the certifier specifies a different period based on prior land use. Enter the date confirmed by your certifier.</li>
<li><strong>Status:</strong> In Conversion, Fully Organic, Suspended, or Withdrawn.</li>
<li><strong>Pre-conversion land use:</strong> conventional arable, conventional vineyard, set-aside, etc. — certifiers use this to assess whether the standard three-year period applies or if a longer period is needed.</li>
</ul>
<h3>Compliance display</h3>
<p>The Block Conversion Register shows a countdown for in-conversion blocks — days remaining until each block becomes fully organic. Fully organic blocks display a green Fully Organic chip. The conversion history of each block is retained permanently, providing the evidence required by certifiers to confirm the conversion period was observed.</p>`,
  ],

  // 203 — Organic Viticulture — Organic Input Log: Approved Products, Approval Status and Certifier References
  [
    "How to maintain the Organic Viticulture input log in BDE Farm Trac, recording approved products and certifier references for vineyard inputs.",
    `<h2>Organic Viticulture — Organic Input Log: Approved Products, Approval Status and Certifier References</h2>
<p>The Organic Viticulture Input Log records every input applied to organic-certified vineyard blocks — copper fungicides, sulphur, permitted biofungicides, biostimulants, fertilisers, and soil conditioners. Each input must be approved or derogated under the UK Organic Regulations 2020, and the approval reference must be recorded.</p>
<h3>Recording an organic input</h3>
<p>Navigate to <strong>Organic Viticulture → Organic Inputs</strong> and click <strong>Add Input</strong>. Record:</p>
<ul>
<li><strong>Block and date applied.</strong></li>
<li><strong>Product name and manufacturer.</strong></li>
<li><strong>Input type:</strong> Copper Fungicide, Sulphur Fungicide, Biofungicide, Fertiliser, Soil Conditioner, Biostimulant, or Other.</li>
<li><strong>Quantity applied and area (ha).</strong></li>
<li><strong>Approval status:</strong> Permitted, Restricted, or Derogation Approved.</li>
<li><strong>Certifier approval reference:</strong> the approval number from your certifier for Restricted or Derogation Approved inputs.</li>
<li><strong>Vintage year.</strong></li>
<li><strong>Operator:</strong> auto-filled from logged-in user.</li>
</ul>
<h3>Copper inputs</h3>
<p>Copper-based inputs are automatically cross-referenced to the Copper Register, which tracks the running 28 kg/ha per 7-year limit. Each copper input logged in the Input Log adds to the running copper total shown on the Copper Register — you do not need to make a separate entry in the Copper Register.</p>`,
  ],

  // 204 — Organic Viticulture — Copper Register: Application Log and Running 28 kg Per 7-Year Limit Tracker
  [
    "How the Organic Viticulture Copper Register tracks cumulative copper applications against the 28 kg/ha per 7-year regulatory limit.",
    `<h2>Organic Viticulture — Copper Register: Application Log and Running 28 kg Per 7-Year Limit Tracker</h2>
<p>UK Organic Regulations 2020 cap copper fungicide use at 28 kg of copper metal per hectare over any seven-year period (equivalent to an average of 4 kg/ha/year). The Copper Register in BDE Farm Trac tracks every copper application and displays a running progress bar against this limit — a key compliance record for certifier inspections.</p>
<h3>Recording a copper application</h3>
<p>Navigate to <strong>Organic Viticulture → Copper Register</strong> and click <strong>Add Application</strong>. Record:</p>
<ul>
<li><strong>Application date.</strong></li>
<li><strong>Product name and copper content (%).</strong></li>
<li><strong>Quantity of product applied (kg or litres) and area treated (ha).</strong></li>
<li><strong>Copper kg applied:</strong> calculated from product copper content and quantity, or entered directly. This is the figure your certifier needs for the annual audit.</li>
</ul>
<h3>Running total and progress bar</h3>
<p>The Copper Register page displays:</p>
<ul>
<li>Total copper applied across all records (kg).</li>
<li>A progress bar against the 28 kg/ha per 7-year limit — green (below 70%), amber (70–90%), red (above 90%).</li>
</ul>
<h3>Certifier reporting</h3>
<p>Your certifier requires the copper register to be broken down by block and filtered to a rolling 7-year window for inspection. Export all copper records to CSV and apply a 7-year date filter to produce the report your certifier requires. The raw data provides everything needed to calculate block-level copper use within the regulatory window.</p>`,
  ],

  // 205 — Organic Viticulture — Input Derogations: Case Register, Correspondence Log and Availability Evidence
  [
    "How to manage organic viticulture input derogation cases in BDE Farm Trac, including the availability search requirement.",
    `<h2>Organic Viticulture — Input Derogations: Case Register, Correspondence Log and Availability Evidence</h2>
<p>Organic viticulture input derogations are required for any vineyard input classified as Not Permitted or Restricted under UK Organic Regulations 2020 that you need to use because no suitable permitted alternative is available. The derogation process is formally managed through your certifying body. BDE Farm Trac's case register covers the full application lifecycle.</p>
<h3>Availability search requirement</h3>
<p>Before submitting a derogation application, you must demonstrate that you searched for a certified organic or permitted alternative and found it to be genuinely unavailable or unsuitable. Record the availability search date, the suppliers contacted, and the evidence of non-availability (supplier out-of-stock confirmation, comparative efficacy data, or agronomist report). This evidence must be attached to the derogation case as a document before the application is submitted.</p>
<h3>New case workflow</h3>
<p>Navigate to <strong>Organic Viticulture → Input Derogations</strong> and click <strong>New Case</strong>. Enter the input name, type, regulatory basis (UK Organic Regs 2020, Sch. 1 Part B), certifying body, availability search date and reference, application date, vintage year, and justification. Save — the case is created at Pending status with no decision fields populated.</p>
<h3>Record Decision workflow</h3>
<p>When a decision is received, click <strong>Record Decision</strong> on the case card. Enter the decision date, outcome (Approved, Refused, Withdrawn, or Expired), expiry date, and any approval conditions. Expiry urgency badges appear at 90 and 30 days before the approval expires, prompting renewal before the current season's application needs arise.</p>`,
  ],

  // 206 — Organic Viticulture — Wine Production Additives: SO₂ Compliance, Additive Records and Organic Certification
  [
    "How organic wine production additive records work in BDE Farm Trac, including SO₂ limits and the shared tab with standard Viticulture.",
    `<h2>Organic Viticulture — Wine Production Additives: SO₂ Compliance, Additive Records and Organic Certification (Shared with Standard Viticulture)</h2>
<p>The Wine Production tab is shared between the standard Viticulture module and the Organic Viticulture module — all records are visible and editable from both places. For organic wine producers, the tab includes organic certification fields and applies the lower SO₂ limits mandated by UK-retained EU Regulation 203/2012.</p>
<h3>Organic wine SO₂ limits</h3>
<p>UK-retained EU Regulation 203/2012 sets maximum total SO₂ for organic wine at:</p>
<ul>
<li><strong>100 mg/L</strong> for red organic wine.</li>
<li><strong>150 mg/L</strong> for white and rosé organic wine.</li>
</ul>
<p>These are lower than the limits for conventional wine. Sparkling and sweet wines may have higher permitted levels — check your certifier's guidance for your specific product. When a wine production record shows actual SO₂ above the applicable limit, an Exceeds Limit chip appears in red — a compliance breach that must be addressed before the wine is sold as organic.</p>
<h3>Certifier reference</h3>
<p>For records marked as Certified Organic, enter the certifier name and certifier reference number. This links the wine production record to the specific organic certification under which the wine is produced — traceable by your certifier at annual inspection and by buyers requiring documentation of organic status.</p>
<h3>Regulatory basis field</h3>
<p>Each record includes a Regulatory Basis field where the specific retained regulation is referenced. For organic wine, this is UK-retained EU Regulation 203/2012. Recording the regulatory basis on each entry provides a clear audit trail linking the product's SO₂ management to the specific legal requirement it is demonstrating compliance with.</p>`,
  ],

  // 207 — Organic Viticulture — Certificates: Vineyard and Wine Organic Certificate Register
  [
    "How to maintain the organic certificate register in BDE Farm Trac's Organic Viticulture module, including expiry tracking and condition monitoring.",
    `<h2>Organic Viticulture — Certificates: Vineyard and Wine Organic Certificate Register</h2>
<p>The Certificates tab in the Organic Viticulture module holds all organic certification documents — vineyard organic certificates, organic wine certificates, and in-conversion certificates. Certificate expiry tracking with urgency alerts ensures your certification never lapses through an overlooked renewal deadline.</p>
<h3>Recording a certificate</h3>
<p>Navigate to <strong>Organic Viticulture → Certificates</strong> and click <strong>Add Certificate</strong>. Record:</p>
<ul>
<li><strong>Certifying body:</strong> Soil Association Certification, OF&amp;G, Control Union, or other UK-approved certifier.</li>
<li><strong>Certificate number.</strong></li>
<li><strong>Certificate type:</strong> Vineyard Organic, Organic Wine, In-Conversion, or Other.</li>
<li><strong>Issue date and expiry date.</strong></li>
<li><strong>Scope:</strong> the holding, blocks, or products covered by this certificate.</li>
<li><strong>Status:</strong> Active, Expired, Suspended, or Withdrawn.</li>
</ul>
<p>Attach the certificate document as a PDF.</p>
<h3>Expiry tracking</h3>
<p>Certificates expiring within 90 days display an amber urgency badge. Expired certificates display a red badge. An SMS alert is sent to opted-in managers at 90 days before expiry, providing enough lead time to arrange and complete the annual inspection and certificate renewal before the current certificate lapses.</p>
<h3>Certificate history</h3>
<p>Previous certificates are retained in the register even after they have been superseded by a renewed certificate. This provides an unbroken certification history for the holding — useful for buyers who require proof of organic certification continuity, and for certifiers reviewing conversion history during appeals or transfers of certification between bodies.</p>`,
  ],

  // 208 — Mobile App — Organic Viticulture Derogation Register: Viewing Input Derogation Cases in the Field
  [
    "How to view organic viticulture input derogation cases from the BDE Farm Trac mobile app while working in the vineyard.",
    `<h2>Mobile App — Organic Viticulture Derogation Register: Viewing Input Derogation Cases in the Field</h2>
<p>The Organic Viticulture Derogations screen in the mobile app provides a read-only view of all active and historical input derogation cases — accessible from the vineyard without needing to return to the farm office or use a laptop. This is particularly useful when an agronomist or certifier asks about the authorisation status of a specific input while working in the field.</p>
<h3>Accessing the derogation register</h3>
<p>In the mobile app, navigate to <strong>Organic → Vit Derogations</strong> (accessible from the Organic Viticulture overview page via the Vit Derogations quick action button). The screen displays all input derogation cases with their status chips — Pending, Approved, Refused, Expired, or Withdrawn — and a summary count row showing totals by status.</p>
<h3>Viewing case detail</h3>
<p>Tap any case card to expand it and view the full detail:</p>
<ul>
<li>Certifying body and certifier reference.</li>
<li>Application date and decision date.</li>
<li>Expiry date with urgency badge (amber at 90 days, red at 30 days).</li>
<li>Availability search evidence summary.</li>
<li>Justification for the derogation application.</li>
<li>Any approval conditions specified by the certifier.</li>
<li>Regulatory basis.</li>
</ul>
<h3>Read-only view</h3>
<p>The mobile derogation screen is read-only. To add correspondence, upload documents, record a certifier decision, or edit case details, use the dashboard at <strong>Organic Viticulture → Input Derogations</strong>. Pull down to refresh the screen and ensure the latest case status is displayed.</p>`,
  ],

  // 209 — Organic Livestock — Full Livestock Tab Access
  [
    "How Organic Livestock subscribers in BDE Farm Trac access the full set of core livestock module tabs from within the Organic section.",
    `<h2>Organic Livestock — Full Livestock Tab Access: Herds & Flocks, Animals, Vet Health Plans, Mortality, TB Tests and More</h2>
<p>Organic Livestock subscribers do not need to navigate between the Organic module and the core Livestock &amp; Feed Management module to access their full set of records. The Organic Livestock section includes all standard livestock tabs alongside the organic-specific compliance tabs — so the complete operational and compliance record set for organic herds and flocks is accessible from one place.</p>
<h3>Standard livestock tabs included in Organic Livestock</h3>
<ul>
<li><strong>Herds &amp; Animals:</strong> the central herd and flock register with organic certification status overlaid.</li>
<li><strong>Individual Animals:</strong> the individual animal register with organic status, active treatment withdrawal flags, and outdoor access compliance status.</li>
<li><strong>Movements:</strong> all on-farm and off-farm movement records, with movement restriction flags for organically certified animals.</li>
<li><strong>Medicine Records:</strong> treatment records with the organic compliance layer — permitted medicine check and organic withdrawal period calculation.</li>
<li><strong>Vet Health Plans:</strong> annual vet-signed health plans with review date tracking.</li>
<li><strong>Mortality Records:</strong> animal mortality and disposal records with the four-stage tracking workflow.</li>
<li><strong>TB Tests:</strong> bTB test records with APHA references and movement restriction tracking.</li>
<li><strong>Welfare Assessments:</strong> mobility scoring and BCS records.</li>
</ul>
<p>The organic-specific tabs — Feed Records, Outdoor Access, Feed Derogations, Input Log — are the additions that Organic Livestock adds on top of this complete standard livestock record set.</p>`,
  ],

  // 210 — Organic Fresh Produce — Full Fresh Produce Tab Access
  [
    "How Organic Fresh Produce subscribers access the full set of Fresh Produce module tabs from within the Organic section of BDE Farm Trac.",
    `<h2>Organic Fresh Produce — Full Fresh Produce Tab Access: Crops, Water Tests, Harvest, Intake, Packhouse and Allergens</h2>
<p>Organic Fresh Produce subscribers access all standard Fresh Produce module tabs from within the Organic section — crop registration, spray records, water testing, harvest records, pack-out, cold store monitoring, and allergen records — alongside the organic-specific input log and derogation management tabs.</p>
<h3>Standard Fresh Produce tabs included in Organic Fresh Produce</h3>
<ul>
<li><strong>Crop Register:</strong> all crops registered for the season with variety, field, planting date, and growing system. Organic status is shown on each crop record.</li>
<li><strong>Spray Records:</strong> all agrochemical applications with PHI tracking. Products are cross-referenced against the Organic Input Register — non-permitted products are flagged on the application record.</li>
<li><strong>Water Quality Tests:</strong> irrigation water test results linked to crop records.</li>
<li><strong>Harvest Records:</strong> yield, marketable yield, and reject rate per crop with organic certification status on each record.</li>
<li><strong>Pack-out Records:</strong> grade, pack size, packing date, and organic batch code.</li>
<li><strong>Cold Store Temperatures:</strong> temperature monitoring logs for organic produce storage.</li>
<li><strong>Allergen Records:</strong> presence management for organic growing locations and packing lines.</li>
<li><strong>Intake Quality Checks:</strong> for organically certified produce received from other growers.</li>
</ul>
<p>The organic-specific additions — Input Log, Input Derogations — are available from the same navigation alongside this complete standard record set.</p>`,
  ],

  // 211 — Organic Viticulture — Full Viticulture Tab Access
  [
    "How Organic Viticulture subscribers access the complete set of standard Viticulture tabs from within the Organic Viticulture section of BDE Farm Trac.",
    `<h2>Organic Viticulture — Full Viticulture Tab Access: Vine Register, Block Lifecycle, Phenology, Pruning & Canopy, Harvest, Disease Scouting and Winery Compliance</h2>
<p>Organic Viticulture subscribers do not need to switch between the Organic Viticulture module and the standard Viticulture module to access their full record set. The Organic Viticulture page includes all standard Viticulture tabs alongside the organic compliance tabs — the complete operational and winery compliance record set is accessible from one place.</p>
<h3>Standard Viticulture tabs included in Organic Viticulture</h3>
<ul>
<li><strong>Overview:</strong> vineyard block overview and season summary.</li>
<li><strong>Vine Register:</strong> variety, rootstock, GI classification, and planting records with organic block status overlaid.</li>
<li><strong>Vineyard Blocks:</strong> permanent block sites with full planting lifecycle and organic conversion status from the Block Conversion Register.</li>
<li><strong>Phenology:</strong> BBCH growth stage observation log from dormancy through to harvest ripeness.</li>
<li><strong>Pruning &amp; Canopy:</strong> all canopy operations including winter pruning, shoot management, and green harvest.</li>
<li><strong>Harvest:</strong> vintage yield and must chemistry records — inputs cross-referenced to the Organic Input Log for compliance.</li>
<li><strong>Disease Scouting:</strong> pest and disease pressure log with automatic notifications and mandatory APHA notifiable organism alerts for Xylella and Phytophthora.</li>
</ul>
<h3>Winery Compliance tabs (shared with standard Viticulture)</h3>
<ul>
<li>Licensing, Excise &amp; Duty, Tastings &amp; Tours, Age Verification (Challenge 25), Wine Production (SO₂ and additive compliance — with organic SO₂ limits applied for certified wine).</li>
</ul>`,
  ],

  // 212 — Accident Book — Four-Stage Investigation Workflow
  [
    "How the Accident Book and four-stage investigation workflow work in BDE Farm Trac for H&S legal compliance.",
    `<h2>Accident Book — Four-Stage Investigation Workflow</h2>
<p>The Social Security (Claims and Payments) Regulations 1979 require all workplaces to maintain an accident book for recording work-related injuries. RIDDOR (Reporting of Injuries, Diseases and Dangerous Occurrences Regulations 2013) requires certain accidents to be reported to the HSE within defined timeframes. BDE Farm Trac's Accident Book provides a structured four-stage investigation workflow to capture all required information and track HSE reporting.</p>
<h3>Stage 1 — Initial Report</h3>
<p>Navigate to <strong>Health, Safety &amp; Risk → Accident Book</strong> and click <strong>New Accident Report</strong>. Record the date, time, location, person injured (name, role, employment type), description of the accident, body part(s) injured, and the nature of the injury (cut, fracture, burn, strain, etc.). Record any witnesses and the person who completed the report.</p>
<h3>Stage 2 — First Aid and Medical Treatment</h3>
<p>Record the first aid treatment given on site, who administered it, whether the person was taken to hospital, and any subsequent medical treatment received.</p>
<h3>Stage 3 — RIDDOR Assessment</h3>
<p>The accident is assessed against RIDDOR reporting criteria — specified injuries (fractures, amputations, loss of consciousness), over-7-day incapacitation, dangerous occurrences, or work-related disease. If RIDDOR reporting is required, record the HSE report reference number and the date of report. RIDDOR online reports must be submitted to the HSE within 10 days for over-7-day injuries, or immediately for specified injuries and fatalities.</p>
<h3>Stage 4 — Investigation and Close</h3>
<p>Record the root cause analysis, contributing factors, and corrective actions taken to prevent recurrence. Attach any photographs, risk assessment reviews, or witness statements. Close the investigation when all actions are complete.</p>`,
  ],

  // 213 — Vet Health Plans — Recording Action Completion and Manager Sign-Off
  [
    "How to record vet health plan action completion and manager sign-off in BDE Farm Trac.",
    `<h2>Vet Health Plans — Recording Action Completion and Manager Sign-Off</h2>
<p>Annual vet health plans are a requirement across all livestock assurance schemes — Red Tractor Dairy, Beef &amp; Lamb, Poultry, and Pigs all require a current signed vet health plan. BDE Farm Trac stores each plan and provides a structured record for documenting the completion of actions recommended by the vet, along with manager sign-off.</p>
<h3>Recording a vet health plan</h3>
<p>Navigate to <strong>Livestock → Vet Health Plans</strong> and click <strong>New Health Plan</strong>. Record the plan date, the vet's name and practice, the species covered, and the plan review date (typically one year from the plan date). Attach the signed plan document as a PDF. The plan remains active until a new plan is created — at which point it is moved to the plan archive with its date range.</p>
<h3>Plan actions</h3>
<p>Many vet health plans include specific recommended actions — vaccination schedule changes, housing improvements, parasite control protocol updates, or investigation referrals. These actions can be logged separately against the health plan record, each with a description, a responsible person, and a target completion date.</p>
<h3>Completing actions</h3>
<p>When a plan action is completed, open it and click <strong>Mark Complete</strong>. Record the completion date, a description of what was done, and any supporting evidence (e.g. a vet revisit confirmation, a test result, or a photograph of a completed improvement). The action status updates to Completed with a timestamp.</p>
<h3>Manager sign-off</h3>
<p>For farms with a formal farm management structure, the completed action requires manager sign-off. The manager reviews the completion evidence and signs off by entering their name in the <em>Signed Off By</em> field. This creates an accountable review trail showing the action was both completed and verified by a manager.</p>`,
  ],

  // 214 — Livestock Mortality Records — Four-Stage Disposal Tracking
  [
    "How the four-stage disposal tracking workflow works for livestock mortality records in BDE Farm Trac.",
    `<h2>Livestock Mortality Records — Four-Stage Disposal Tracking</h2>
<p>Every animal death on farm must be documented and disposed of through an authorised route under the Animal By-Products Regulations (ABP) 2005. BDE Farm Trac's mortality records follow a four-stage workflow that ensures every carcass is accounted for from the moment of death to the confirmation of authorised disposal.</p>
<h3>Stage 1 — Record the death</h3>
<p>Navigate to <strong>Livestock → Mortality Records</strong> and click <strong>New Mortality</strong>. Record the animal (individual tag or group), date of death, cause of death (clinical suspicion, confirmed diagnosis, accident, or unknown), whether a vet attended, and whether a post-mortem was performed. If a notifiable disease is suspected, a red advisory appears prompting APHA contact on 03000 200 301.</p>
<h3>Stage 2 — Arrange collection</h3>
<p>Record the collection date, the collector's name, the collector's APHA approval number, and the collection method (licensed knacker/renderer, hunt kennels, on-farm composting under approval, or incinerator). The collector must hold a valid APHA approval for the relevant ABP category.</p>
<h3>Stage 3 — Confirm documentation</h3>
<p>Record the commercial document (waybill or CMR) reference number. For RIDDOR-notifiable accidents involving a person as well as an animal, cross-reference the Accident Book record. Attach a copy of the collection document where available.</p>
<h3>Stage 4 — Close the record</h3>
<p>When all collection and documentation steps are confirmed, mark the record as Closed. The closed record is permanently retained in the mortality history with all four stages completed. BCMS notification for cattle deaths is confirmed at this stage — the record flags whether the BCMS notification has been made and within the required seven-day window.</p>`,
  ],

  // 215 — Organic Viticulture — Input Derogations: Split New Case / Record Decision Workflow
  [
    "How the split New Case and Record Decision workflow for organic viticulture input derogations maintains clear separation of evidence in BDE Farm Trac.",
    `<h2>Organic Viticulture — Input Derogations: Split New Case / Record Decision Workflow</h2>
<p>The split workflow for organic viticulture input derogations is designed to keep the application evidence and the certifier's decision cleanly separated in the audit trail — which is what certifiers need to see during annual inspections. Combining them in a single form would make it difficult to distinguish what was known at application time from what was decided later.</p>
<h3>Why the split matters</h3>
<p>An organic input derogation case has two distinct phases:</p>
<ol>
<li><strong>Application phase:</strong> you submit a request to your certifier, supported by availability search evidence and a justification. At this point, no decision has been made. The application evidence should stand alone.</li>
<li><strong>Decision phase:</strong> your certifier responds with a decision — Approved, Refused, or with conditions. This is recorded separately, with the date the decision was received.</li>
</ol>
<p>A certifier auditing your records can then clearly see: what you applied for, when you applied, what evidence you provided — and separately — what the certifier decided, when, and under what conditions. The timeline is unambiguous.</p>
<h3>Practical workflow</h3>
<p>Create the New Case record as soon as you submit your application. Leave the Decision fields empty. When the certifier responds, find the case card in the derogation register and click <strong>Record Decision</strong> to open the decision-only form. Enter the outcome, date, expiry, and conditions. Save — the case card now shows both the application and the decision as separate, dated sections of the same case record.</p>`,
  ],

  // 216 — Sheep Disease Monitoring — Reportable Disease Flag and APHA Advisory
  [
    "How the Sheep Production disease monitoring tab in BDE Farm Trac works, including the Reportable Disease flag and the APHA advisory banner.",
    `<h2>Sheep Disease Monitoring — Reportable Disease Flag and APHA Advisory</h2>
<p>The Sheep Production module includes a disease observation tab for logging clinical disease findings in your flock. A key feature is the Reportable Disease flag — a checkbox that, when ticked, immediately displays a red APHA advisory banner on the record and raises a pre-filled task to ensure the mandatory notification obligation is acted on without delay.</p>
<h3>Recording a disease observation</h3>
<p>Navigate to <strong>Sheep Production → Disease Monitoring</strong> and click <strong>New Observation</strong>. Record the date, flock, number of animals affected, clinical signs observed, and the suspected disease. If the clinical signs suggest a notifiable disease — Foot and Mouth Disease, Bluetongue, Sheep Pox, Scrapie, or any other APHA-designated notifiable condition — tick the <strong>Reportable Disease</strong> checkbox.</p>
<h3>APHA advisory banner</h3>
<p>When the Reportable Disease flag is ticked, a red advisory banner appears on the saved record:</p>
<p><em>"Reportable disease suspected — contact APHA immediately on 03000 200 301. Do not wait for laboratory confirmation. Movement restrictions may apply."</em></p>
<p>This advisory remains visible every time the record is opened — it cannot be dismissed until the record is closed with an outcome and the flag is unchecked.</p>
<h3>Raise APHA Task</h3>
<p>The advisory banner includes a <strong>Raise APHA Task</strong> button. Clicking it opens the Raise Task dialog pre-filled with the disease name, flock, observation date, and a description referencing the advisory. Assign the task to the farm manager or owner responsible for making the APHA call. The task appears in the Task Board as type APHA Notification and triggers an SMS alert to the assignee.</p>
<h3>Relationship to the Disease &amp; Incident Log</h3>
<p>The Sheep Production disease observation is a quick-capture field flag for the moment of suspicion. Once APHA has been contacted and an incident reference number received, the formal incident record is created in <strong>Compliance &amp; Plans → Disease &amp; Incident Log</strong> where the APHA reference, isolation measures, and investigation outcome are all recorded.</p>`,
  ],

  // 217 — Herd Health Follow-Up Tasks — Raising Tasks from Clinical Event Timeline Entries
  [
    "How to raise follow-up tasks from clinical event timeline entries in the Herd Health Register in BDE Farm Trac.",
    `<h2>Herd Health Follow-Up Tasks — Raising Tasks from Clinical Event Timeline Entries</h2>
<p>The Herd Health Register in BDE Farm Trac maintains a clinical event timeline for each herd — logging vet visits, disease outbreaks, treatment programmes, and health observations in chronological order. When a clinical event requires follow-up action, a task can be raised directly from the timeline entry without leaving the health record.</p>
<h3>Clinical event timeline</h3>
<p>Navigate to <strong>Livestock → Herd Health Register</strong> and open the herd record. The timeline view shows all logged clinical events for the herd in reverse chronological order — each event shows the date, event type (Vet Visit, Disease Outbreak, Treatment Programme, Welfare Observation, or other), a brief description, and the name of the person who logged it.</p>
<h3>Raising a follow-up task</h3>
<p>On any timeline entry, click the <strong>Raise Task</strong> button. The Raise Task dialog opens pre-filled with:</p>
<ul>
<li><strong>Title:</strong> "Follow-up: [event type] — [herd name] [date]"</li>
<li><strong>Description:</strong> the clinical event description from the timeline entry.</li>
<li><strong>Module:</strong> Livestock.</li>
</ul>
<p>Complete the assignee, due date, and priority fields and click <strong>Raise Task</strong>. The task appears in the Task Board with a link back to the herd health record. The assigned staff member receives an SMS notification and the task appears in their mobile app Task Inbox.</p>
<h3>Follow-up required flag</h3>
<p>When logging a new clinical event, a <strong>Follow-up Required</strong> toggle is available. Enabling it places an amber Follow-up Required chip on the timeline entry card and a Raise Task prompt appears at the top of the timeline view for any entries marked with this flag — ensuring no outstanding follow-ups are overlooked across a busy herd health period.</p>`,
  ],

  // 218 — Poultry Cleanout Swab Testing — Food Safety Advisory and Do Not Restock Guidance
  [
    "How swab testing records and the food safety advisory work in BDE Farm Trac's poultry house cleanout records.",
    `<h2>Poultry Cleanout Swab Testing — Food Safety Advisory and Do Not Restock Guidance</h2>
<p>Environmental swab testing between crops is a critical food safety control in commercial poultry production — particularly for Salmonella National Control Programme (NCP) compliance. BDE Farm Trac's cleanout record includes a swab testing section with an amber food safety advisory that reinforces the mandatory hold before restocking.</p>
<h3>Recording swab testing in a cleanout</h3>
<p>Navigate to <strong>Poultry Production → Cleanouts</strong> and open a cleanout record (or create a new one). In the Swab Testing section, toggle <strong>Swabs Taken</strong> on. Record:</p>
<ul>
<li><strong>Swab type:</strong> pre-clean environmental swabs, post-clean verification swabs, or Salmonella NCP boot swabs.</li>
<li><strong>Swab date.</strong></li>
<li><strong>Laboratory:</strong> the accredited laboratory that will analyse the swabs.</li>
<li><strong>Results:</strong> enter when received — Negative (clear) or Positive (Salmonella SE4b, ST, or other serotype detected).</li>
</ul>
<h3>Food safety advisory</h3>
<p>When Swabs Taken is toggled on and the record is saved, an amber advisory banner appears prominently on the cleanout record card:</p>
<p><strong>"Do not restock until negative swab results have been received and confirmed by your vet or Salmonella NCP co-ordinator."</strong></p>
<p>This advisory remains visible on the card until swab results are entered as Negative. If results are Positive, the card flag changes to a red alert requiring immediate corrective action and notification to your Salmonella NCP co-ordinator.</p>
<h3>Compliance context</h3>
<p>Under the Zoonoses Regulations and Red Tractor Poultry standards, restocking a house before confirming negative environmental swabs is a significant non-conformance. The advisory in BDE Farm Trac acts as an in-system check to prevent inadvertent restocking while swab results are outstanding.</p>`,
  ],

  // 219 — Poultry Environmental Alarm Advisory — Corrective Action Before Next Flush Cycle
  [
    "How the environmental alarm advisory works in BDE Farm Trac's poultry environmental log records and what action it requires.",
    `<h2>Poultry Environmental Alarm Advisory — Corrective Action Before Next Flush Cycle</h2>
<p>Environmental alarms in poultry houses — triggered by high temperature, low temperature, ventilation failure, or gas concentration alarms — represent a welfare risk to the flock and a food safety risk if conditions persist. BDE Farm Trac displays an amber advisory on environmental log records where an alarm was activated, reinforcing the requirement to investigate and document corrective action before the next monitoring period.</p>
<h3>Triggering the advisory</h3>
<p>When recording a Poultry Environmental Log (navigate to <strong>Poultry Production → Environmental Logs</strong>), toggle the <strong>Alarm Activated During Period</strong> switch on. The Alarm Details field appears — record the type of alarm (temperature high/low, ventilation failure, ammonia alarm, CO₂ alarm), its duration, and the immediate action taken.</p>
<p>After saving the record, an amber advisory banner appears on the saved log card:</p>
<p><strong>"Environmental advisory: investigate and document the cause of this alarm before the next flush cycle. Record the corrective action in the Alarm Details field and follow up via the Task Board if further intervention is required."</strong></p>
<h3>Corrective action documentation</h3>
<p>The Alarm Details field is the primary location for documenting corrective action. Record what caused the alarm (equipment failure, blocked air inlet, sensor malfunction, extreme weather), what was done in response (emergency ventilation, emergency heating, equipment repair, manual checks increased), and whether a follow-up vet check was arranged if bird welfare was compromised.</p>
<h3>Dashboard visibility</h3>
<p>Environmental logs with an active alarm advisory are highlighted in the Poultry Production dashboard with an amber indicator, making them visible at a glance to managers reviewing the day's environmental records. The advisory remains on the card until the corrective action documentation is completed and the follow-up task (if raised) is closed.</p>`,
  ],

  // 220 — Harvest Destination Type — Own Holding, Contract Processor and Grape Sale Selector
  [
    "How the harvest destination type selector works in BDE Farm Trac's Viticulture harvest records, including Trade Contact linkage.",
    `<h2>Harvest Destination Type — Own Holding, Contract Processor and Grape Sale Selector</h2>
<p>The harvest destination type field in BDE Farm Trac's Viticulture harvest records provides a structured, three-option selector that replaces a free-text winery name entry. It captures the commercial and traceability relationship between your vineyard and the destination for each vintage's grapes — a key record for UK wine PDO/PGI compliance, HMRC duty chain documentation, and commercial contract evidence.</p>
<h3>The three destination types</h3>
<ul>
<li><strong>Own Holding / Own Processing:</strong> the grapes are vinified by the same business that grew them — either at an on-site winery or at a winery operated by the same business entity at a different location. No external commercial relationship exists. A contact name field is available for optional entry of the processing facility name.</li>
<li><strong>Contract Processor / Contract Winery:</strong> the grapes are delivered to a third-party winery under a contract processing agreement. The vineyard retains ownership of the wine and pays the winery a processing fee. Selecting this type reveals a Trade Contact picker — select the processor from your registered Trade Contacts to link the harvest record directly to the processor record, including their contact details and any purchase order reference.</li>
<li><strong>Grape Sale:</strong> the grapes are sold as fresh fruit to a buyer — the vineyard does not retain ownership of the resulting wine. Selecting this type reveals a Trade Contact picker for the buyer — link the harvest record to the buyer's Trade Contact record for traceability and to support the sales record in the Finance module.</li>
</ul>
<h3>Why destination type matters</h3>
<p>For PDO and PGI wines, the processing location must be within the geographical indication area. Recording the destination type and processor creates the evidence trail that the English or Welsh wine PDO/PGI certification body may request. For HMRC duty purposes, grape sale records provide traceability of when ownership transferred and to whom.</p>`,
  ],

  // 221 — Harvest Botrytis Advisory — Amber Quality Alert and Task Raising on High Botrytis or Poor Condition
  [
    "How the botrytis advisory and automatic task-raise prompt work in BDE Farm Trac's Viticulture harvest records.",
    `<h2>Harvest Botrytis Advisory — Amber Quality Alert and Task Raising on High Botrytis or Poor Condition</h2>
<p>Botrytis cinerea (grey mould) at harvest is one of the most significant quality risks in UK viticulture. High botrytis levels can reduce wine quality, reduce extractable must volume, and complicate winemaking decisions around SO₂ additions and pressing regime. BDE Farm Trac's harvest record includes an integrated botrytis advisory system that ensures winemaker review is always prompted when significant botrytis is recorded.</p>
<h3>The botrytis flag and percentage field</h3>
<p>In the harvest record form, tick the <strong>Botrytis Present at Harvest</strong> checkbox. The <strong>Botrytis Percentage (%)</strong> field appears — enter the estimated or measured percentage of the crop affected. An amber advisory banner appears immediately below the percentage field:</p>
<p><strong>"Botrytis advisory: record the affected percentage. If botrytis exceeds 30% you will be prompted to raise a task for winemaker review before processing."</strong></p>
<h3>Automatic task raise prompt</h3>
<p>After saving a harvest record where either (a) grape condition is rated as <em>Poor</em> or (b) botrytis percentage exceeds 30%, the <strong>Raise Task</strong> dialog opens automatically — without any manual click required. The dialog is pre-filled with:</p>
<ul>
<li><strong>Title:</strong> "Harvest Quality Concern — [Block Name] · [Vintage Year]"</li>
<li><strong>Description:</strong> "Yield: [kg] · Condition: [rating] · Botrytis: [%] · Brix: [°]. Review with winemaker before processing."</li>
<li><strong>Module:</strong> Viticulture.</li>
</ul>
<p>Assign the task to the winemaker or harvest manager, set a due date, and click Raise Task. Skip if the concern has already been communicated verbally and no formal task record is required.</p>
<h3>Mobile app</h3>
<p>The same amber advisory and automatic RaiseTaskSheet prompt are present on the Vine Harvest screen in the mobile app — the task sheet opens after saving whenever Poor condition or botrytis &gt;30% is recorded, ensuring the follow-up is triggered regardless of whether the record is created in the field or at a desk.</p>`,
  ],
];

export const DEFAULT_HELP_ARTICLES: DefaultArticle[] = TITLES.map(([title, category], idx) => {
  const [excerpt, content] = CONTENT[idx] ?? [
    `Help article: ${title}`,
    `<h2>${title}</h2>\n<p>This article is being prepared.</p>`,
  ];
  return {
    title,
    slug: toSlug(title),
    category,
    excerpt,
    published: true,
    sortOrder: idx + 1,
    content,
  };
});
