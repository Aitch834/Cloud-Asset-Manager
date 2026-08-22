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
  ["Organic Arable Seed Stock Ledger — Recording Seed Receipts, Use and Balance", "Organic Arable"],
  ["Organic Arable Module — Bundled Field Management Access Explained", "Organic Arable"],
  ["Organic Arable Field Conversion Tracker and Certification Records", "Organic Arable"],
  ["Organic Arable Input Log and Annex II Substance Compliance", "Organic Arable"],
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
  ["Spray Notifications — Beekeeper & Neighbour Notification Log", "Sprays & Inputs"],
  ["Bee Precaution Flag — Product Register & 48-Hour Planner Alerts", "Sprays & Inputs"],
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
  ["Labour Cross-Reference — Comparing Timesheet Hours Against Field Operations Records", "Staff & Training"],
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
  ["Wine Production — SO₂ Compliance, Additive Records and Organic Wine Certification per Vintage", "Viticulture"],
  ["Winery Stock — Consumable Ledger for Bottles, Corks, Barrels, Fining Agents and SO₂ Products", "Viticulture"],
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
  ["Organic Viticulture — Winery Stock: Consumable Ledger Shared with Standard Viticulture", "Organic Viticulture"],
  ["Mobile App — Organic Viticulture Derogation Register: Viewing Input Derogation Cases in the Field", "Mobile App"],
  ["Organic Livestock — Full Livestock Tab Access: Herds & Flocks, Animals, Vet Health Plans, Mortality, TB Tests and More", "Organic"],
  ["Organic Fresh Produce — Full Fresh Produce Tab Access: Crops, Water Tests, Harvest, Intake, Packhouse and Allergens", "Organic"],
  ["Organic Arable — Certification Tab and Field Conversion Tracker", "Organic Arable"],
  ["Organic Arable — Seed Sourcing Register and Derogation Approval Flow", "Organic Arable"],
  ["Organic Arable — Input Log: Annex II Approved Substances and Restricted Input Workflow", "Organic Arable"],
  ["Organic Arable — Harvest Declarations and Buyer Declaration Record", "Organic Arable"],
  ["Mobile App — Organic Arable: Input, Seed, and Harvest Recording", "Mobile App"],
  ["Organic Viticulture — Full Viticulture Tab Access: Vine Register, Block Lifecycle, Phenology, Pruning & Canopy, Harvest, Disease Scouting, Winery Compliance and Winery Stock", "Organic Viticulture"],
  ["Accident Book — Four-Stage Investigation Workflow", "Health, Safety & Risk"],
  ["Vet Health Plans — Recording Action Completion and Manager Sign-Off", "Livestock"],
  ["Livestock Mortality Records — Four-Stage Disposal Tracking", "Livestock"],
  ["Organic Viticulture — Input Derogations: Split New Case / Record Decision Workflow", "Organic Viticulture"],
  ["Sheep Disease Monitoring — Reportable Disease Flag and APHA Advisory", "Sheep Production"],
  ["Organic Poultry — Certification Tab: Certifying Body, Certificate Type and Status Records", "Organic Poultry"],
  ["Organic Poultry — Outdoor Access Log: Birds on Range, Stocking Density and Compliance Status", "Organic Poultry"],
  ["Organic Poultry — Feed Records: Organic Approval Status, Certifier Reference and Derogation Case Linking", "Organic Poultry"],
  ["Organic Poultry — Derogations: Non-Permitted Input Case Register and Full Lifecycle Tracking", "Organic Poultry"],
  ["SMS Alerts — Configuring Alert Categories, Per-Member Settings and Alert History Log", "Platform Add-ons"],
  ["Goat Production — Enterprise Report Tab: Financial and Production KPIs, Kidding Performance and DLWG Analysis", "Goat Production"],
  ["Mobile App — Organic Poultry: Outdoor Access Log and Feed Record Capture with Offline Sync", "Mobile App"],
  ["Herd Health Follow-Up Tasks — Raising Tasks from Clinical Event Timeline Entries", "Livestock"],
  ["Poultry Cleanout Swab Testing — Food Safety Advisory and Do Not Restock Guidance", "Poultry Production"],
  ["Poultry Environmental Alarm Advisory — Corrective Action Before Next Flush Cycle", "Poultry Production"],
  ["Harvest Destination Type — Own Holding, Contract Processor and Grape Sale Selector", "Viticulture"],
  ["Harvest Botrytis Advisory — Amber Quality Alert and Task Raising on High Botrytis or Poor Condition", "Viticulture"],
  ["Sustainability Reports — Certifying Body Register, Supplier Lookup and PO/Invoice Tracking", "Carbon & Sustainability"],
  ["Goat Production Module — Overview and Getting Started", "Goat Production"],
  ["Goat Herd Register — Herds are Registered in Livestock → Herds & Animals", "Goat Production"],
  ["Goat Mating Records — Buck Selection, Mating Methods and Expected Kidding", "Goat Production"],
  ["Goat Pregnancy Scanning — Does Barren, Singles, Doubles and Triplets", "Goat Production"],
  ["Goat Weigh-in and DLWG — Performance Recording and Body Condition Scoring", "Goat Production"],
  ["Goat Health and Disease Monitoring — CAE, CLA, Johne's and Reportable Diseases", "Goat Production"],
  ["Venison Production Module — Overview and Getting Started", "Venison Production"],
  ["Venison Cull Records — Stalking Events, Carcass Weights and Food Safety Inspection", "Venison Production"],
  ["Venison Cull Records — Notifiable Disease Suspect Flag and APHA Advisory", "Venison Production"],
  ["Venison Carcass Sales — Wild Game Declaration, Facility Type and Destination Recording", "Venison Production"],
  ["Venison Herd Monitoring — Population Surveys: Driven Count, Thermal Imaging and Camera Trap", "Venison Production"],
  ["Venison Health Records — bTB SICCT Skin Test, Gamma-Interferon Blood Test and APHA Reference", "Venison Production"],
  ["Venison Firearms & Stalking Certificates — Section 1 FC, DSC1, DSC2 and WGMI Expiry Tracking", "Venison Production"],
  ["Organic Venison Module — Overview and Getting Started", "Organic Venison"],
  ["Organic Venison — Certification Tab: Certifying Body, Certificate Number and Scope Register", "Organic Venison"],
  ["Organic Venison — Land Register: Grazing Compartment Conversion Status Tracking", "Organic Venison"],
  ["Organic Venison — Feed and Supplement Log: Organic Approval Status and Certifier Reference", "Organic Venison"],
  ["Organic Venison — Derogations: Case Register, Justification, Decision and Approval Conditions", "Organic Venison"],
  ["Year Filters on Livestock Recording Tabs — All Production Modules", "Livestock"],
  ["Document Attachment on Livestock Record Rows — Compact DocAttach Across All Production Tabs", "Livestock"],
  ["Johne's Disease Monitoring — Year Filter, Print Report and Record Attachments", "Livestock"],
  ["Campylobacter Monitoring — Year Filter, Print Report and Record Attachments", "Poultry Production"],
  ["Organic Livestock Outdoor Access Log — Year Filter and Document Attachment on Rows", "Organic Livestock"],
  ["Organic Dairy Feed & Nutrition Tab — Year Filter and Document Attachment on Rows", "Organic Dairy"],
  ["Season Production Report — Gross Margin and Financial Summary", "Fields & Crops"],
  ["Dairy Mobility Scoring — Per-Animal Records, Prevalence and Mobile Recording", "Livestock"],
  ["Seed Drilling Records — Crop Variety, Seed Rate, Treated Seed and Season Cost Tracking", "Fields & Crops"],
  ["Invoice Branding — Farm Logo, Company Details, VAT Number and Bank Information on Invoices", "Getting Started"],
  ["LIS One-Click Submission — Connecting Your Livestock Information Service Account", "Livestock"],
  ["LIS LIP One-Click Cattle Submission — Connecting via LIS Account Sign-In", "Livestock"],
  ["Black-grass Five-in-Five Tracker — Cultural Control Scoring and Herbicide Resistance Risk", "Fields & Crops"],
  ["Horticulture Module — Overview", "Horticulture"],
  ["Getting Started with Horticulture Records", "Horticulture"],
  ["Horticulture Module — Crop Records, Sprays, and Assurance", "Horticulture"],
  ["NMR Recording Visits — Herd Constituents, SCC and Fat:Protein Ratio Trends", "Livestock"],
  ["Seed Store — Batch Tracking, Stock Levels and Bag Labels", "Fields & Crops"],
  ["Seed Rate Calculator — Establishment-Adjusted Sowing Rates", "Fields & Crops"],
  ["Silage & Haylage Recording — Additives, Quality Tests and Clamp Safety Checks", "Environmental"],
  ["Crop Rotation Reason Tags and the Field Map Year Selector", "Fields & Crops"],
  ["Enterprise Cost-of-Production Reports — Dairy, Beef, Sheep, Pig, Poultry, Labour and Fleet", "Dashboards"],
  ["IPM Plan — Integrated Pest Management Recording and SFI CIPM Evidence", "Fields & Crops"],
  ["Resource Planner — Building Your Resource Registry", "Resource Planner"],
  ["Assigning Resources to Tasks — Gantt View, Drag-and-Drop and Conflict Detection", "Resource Planner"],
  ["Dairy Supplies — PPE & Chemical Drawdown Recording", "Livestock"],
  ["Dairy Supplies — Restock Request Workflow", "Livestock"],
  ["Silage & Haylage Stock Tracking — Cut Records, Yield and Clamp Balance", "Environmental"],
  ["Straw Bale Inventory — Bale Batches, Moisture Checks and Biomass Contracts", "Fields & Crops"],
  ["Season Reports — Forage & Straw Tab", "Dashboards"],
  ["Pig Vaccination Programme — Recording and Booster Management", "Livestock"],
  ["Poultry Vaccination Programme — Recording and Booster Management", "Livestock"],
  ["Pig Disease Monitoring Register — PRRS, MH, and AHDB Accreditation", "Livestock"],
  ["Poultry Disease Monitoring Register — AI Surveillance, Marek's, and NCP Serology", "Livestock"],
  ["Marek's Disease & Salmonella NCP Isolation Register Fields — Poultry Biosecurity", "Livestock"],
  ["Individual Animal Profile — Vaccinations History Tab", "Livestock"],
  ["Using the BDE Farm Trac Sandbox Test Environment", "Getting Started"],
  ["Medicine Withdrawal Period SMS Alerts", "Livestock"],
  ["Poultry Inter-Site Transfers — Recording Movements Between Holdings", "Poultry Production"],
  ["Poultry Transport Welfare Documentation (WATD) — Journey Records and 65 km Threshold", "Poultry Production"],
  ["HPAI Zone Alerting — Platform Alerts, Farm Zone Status and Organic 16-Week Housing Clock", "Poultry Production"],
  ["Poultry Placement Delivery Fields — Organic Certification Status and Derogation Period at Arrival", "Poultry Production"],
  ["GI Compliance Tab — PDO & PGI Designations, Block Compliance, Certifications and Harvest Declarations", "Viticulture"],
  ["Inspection Correspondence Log — Recording Communications Against Inspection Records", "Inspections"],
  ["Agri-Environment Scheme Correspondence Log — Recording Communications with Scheme Administrators", "Environmental"],
  ["Data API — Generating and Managing API Keys", "Integrations & API"],
  ["Report Builder — Creating, Running and Saving Custom Reports", "Integrations & API"],
  ["Winery Management — Overview: Harvest Reception, Pressing, Fermentation, Vessel Register, Cellar Ops, Bottling, SO₂ Testing and Equipment Register", "Winery Management"],
  ["Winery Harvest Reception — Grape Intake Records, Source Block Traceability and Must Chemistry", "Winery Management"],
  ["Winery Pressing Records — Press Run Log, Free-Run and Press-Run Volume Fractions", "Winery Management"],
  ["Winery Fermentation — Vessel Logs, Yeast Strain, Daily Gravity, Temperature and pH Reading Series", "Winery Management"],
  ["Winery Vessel Register — Tank and Barrel Register, Capacity, Contents and Status", "Winery Management"],
  ["Winery Cellar Operations — Racking, Fining, Filtering, Blending, SO₂ Addition and Vessel Transfers", "Winery Management"],
  ["Winery Bottling Records — Bottling Run Log, Bottle Type, Closure Type and Label Batch", "Winery Management"],
  ["Winery SO₂ Testing — Analytical Log, Free, Bound and Total SO₂ Readings with UK Limit Compliance Check", "Winery Management"],
  ["Winery Equipment Register — Press, Tank, Filter, Pump and Bottling Line Register with Service Interval Alerts", "Winery Management"],
  ["Mobile App — Winery Production Screens: Reception, Pressing, Fermentation, Cellar Ops and SO₂ Testing with Offline Sync", "Mobile App"],
];

const CONTENT: [string, string][] = [
  // 0 — Getting Started with Red Tractor Compliance
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
  // 1 — Recording Spray Applications
  [
    "How to record a spray application in BDE Farm Trac, including operator certificates, product details, product cost, batch numbers, and weather conditions.",
    `<h2>Recording Spray Applications</h2>
<p>Spray application records are one of the most scrutinised elements of a Red Tractor Combinable Crops or Fresh Produce audit. BDE Farm Trac captures everything an assessor will look for in a single structured record, including product cost for gross margin reporting.</p>
<h3>How to add a spray record</h3>
<p>Navigate to <strong>Sprays &amp; Inputs</strong> and click <strong>New Application</strong>. Complete the following sections:</p>
<ul>
<li><strong>Date and field:</strong> select the field from your registered field list. Multiple fields can be added to one record if the same product and dose was applied across all of them in a single pass.</li>
<li><strong>Operator:</strong> select from your staff list. If the operator's PA1/PA2/PA6 certificate is expired, a warning badge appears — the record can still be saved but the non-compliance is flagged.</li>
<li><strong>Product:</strong> search your product catalogue. The product's active ingredient, MAPP number, and label rates are carried forward automatically.</li>
<li><strong>Dose and water volume:</strong> enter the dose in the product's registered unit. The system checks the dose against the label maximum and warns if exceeded.</li>
<li><strong>Product Cost (£/unit):</strong> enter the cost per litre, kg, or other applicable unit from the product invoice. This is stored in pence for precision, and the Season Production Report multiplies it by the application rate and area sprayed to calculate the total spray cost for the season and its contribution to gross margin.</li>
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
  // 4 — Livestock Movement Records
  [
    "How to record on-farm and off-farm livestock movements in BDE Farm Trac to comply with BCMS, LIS, ScotEID, and APHA reporting requirements.",
    `<h2>Livestock Movement Records</h2>
<p>Every movement of cattle, sheep, pigs, or goats on or off your holding must be recorded and, for cattle and pigs, reported to the relevant authority within the required reporting window. BDE Farm Trac captures the movement data needed for all UK government livestock reporting databases.</p>
<h3>Recording a movement</h3>
<p>Navigate to <strong>Livestock &amp; Feed Management → Movements</strong> and click <strong>New Movement</strong>. Select the movement type:</p>
<ul>
<li><strong>On — Purchase/Transfer In:</strong> animals arriving from another holding.</li>
<li><strong>Off — Sale/Transfer Out:</strong> animals leaving for sale, slaughter, or another holding.</li>
<li><strong>On — Birth:</strong> home-born animals added to the register.</li>
<li><strong>Off — Death:</strong> animals that have died or been culled on farm.</li>
</ul>
<p>Record the species, number of animals, the origin or destination CPH, the movement date, the vehicle registration, the haulier name, and the AML licence number where applicable. For sheep movements, the flock tag prefix is captured. For cattle, individual ear tag numbers are entered or scanned.</p>
<h3>Reporting deadlines and submission routes</h3>
<p>Cattle movements must be reported to BCMS within three days of the event. Pig movements must be reported using an eAML2 document within three days. The platform flags outstanding movement records that are approaching or past their reporting deadline with an amber or red badge.</p>
<p>Submission routes by species and country:</p>
<ul>
<li><strong>England cattle (on/off/birth/death):</strong> Submit the movement on <strong>BCMS Online</strong> (www.bcms.gov.uk), then use the amber <strong>Record BCMS Ref</strong> button on the movement row to log your confirmation reference. The automated CTS Web Services API integration is in development (pending DEFRA vendor registration) — the manual portal ref route provides a complete audit trail in the meantime. The LIS LIP cattle API is temporarily paused while Defra transitions cattle traceability to a new service.</li>
<li><strong>England sheep, goats &amp; deer (on/off):</strong> Use the <strong>LIS tab</strong> in Livestock → Movements. Each row shows a Submit button that sends the movement to the LIS CLA API. Note: the LIS CLA v1.0 API does not support birth or death registration — for births and deaths, register on the LIS keeper portal (cla.livestockinformation.org.uk) and use the <strong>Register via LIS portal</strong> button on the row to record your confirmation reference.</li>
<li><strong>Wales sheep, goats &amp; deer:</strong> Use the <strong>EIDCymru tab</strong> — enter your EIDCymru API key in Farm Settings to activate.</li>
<li><strong>Scotland all species:</strong> Use the <strong>ScotEID tab</strong> — enter your ScotEID API key in Farm Settings to activate.</li>
<li><strong>England pigs:</strong> Click the <strong>eAML2 XML</strong> button above the Movements table to download a compliant XML file for upload to eAML2.org.uk. No credentials required.</li>
</ul>
<h3>Linking to sales records</h3>
<p>Off-farm movements can be linked to deadweight kill sheets or mart sale records in the Finance &amp; Business module, creating a complete chain from BCMS movement to settlement document for Red Tractor traceability requirements.</p>`,
  ],
  // 5 — Visitor Logging and Biosecurity Plan
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
  // 15 — NVZ Rules, Applications and Risk Assessments
  [
    "How to record nitrogen fertiliser applications, costs, risk assessments, and closed period compliance in the NVZ module.",
    `<h2>NVZ Rules, Applications and Risk Assessments</h2>
<p>If any of your fields fall within a Nitrate Vulnerable Zone (NVZ), you must follow the Nitrates Action Programme regulations — keeping records of all nitrogen applications, observing closed periods, and staying within field-level nitrogen limits. BDE Farm Trac's NVZ module manages all of this in one place.</p>
<h3>Nitrogen application records</h3>
<p>Navigate to <strong>Nutrient Management → NVZ Applications</strong> and log every application of manufactured nitrogen fertiliser or organic manure to NVZ fields. Each record captures: field, date, material type (manufactured fertiliser, slurry, farmyard manure, sewage sludge), nitrogen content (kg N/tonne or kg N/m³), quantity applied, calculated nitrogen applied (kg N/ha), and total fertiliser cost (£).</p>
<h3>Recording fertiliser cost</h3>
<p>Each NVZ application record includes a <strong>Total Cost (£)</strong> field — enter the total invoice cost of the fertiliser applied in this application. This is stored in pence for precision and used by the Season Production Report to calculate total fertiliser input costs and gross margin per crop season. It can also be edited after saving if the invoice arrives later.</p>
<h3>Field nitrogen limits</h3>
<p>DEFRA sets a maximum total nitrogen limit per field based on soil type and the crop grown. The NVZ Budget Calculator shows the remaining budget for each field — the limit minus all applications logged to date. Fields approaching or exceeding their limit are highlighted in amber or red.</p>
<h3>Closed period records</h3>
<p>NVZ closed periods prohibit the spreading of certain materials during winter months. The platform displays a countdown to the closed period start date and a countdown to the end date. Applications logged during a closed period are flagged as a non-compliance.</p>
<h3>Risk assessments</h3>
<p>Before spreading on steeply sloping ground, near water, or in wet conditions, a risk assessment must be completed. Record the field, the spreading date, the conditions, and the control measures applied (e.g. application equipment, rate reduction, spread direction). These records satisfy the field risk assessment requirement of the Nitrates Regulations.</p>`,
  ],
  // 16 — Nutrient Management Planning (NMP)
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
  // 18 — Harvest Records and Yield Tracking
  [
    "How to record grain and combinable crop harvest records in BDE Farm Trac, including yield per field, moisture, sale price, and grain position tracking.",
    `<h2>Harvest Records and Yield Tracking</h2>
<p>Harvest records provide the link between the field operations that produced the crop and the grain position and sales records that account for its disposal. BDE Farm Trac captures yield, quality, sale price, and storage data at harvest and connects it directly to your grain trading records and Season Production Report.</p>
<h3>Recording a harvest</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Harvest Records</strong> and click <strong>Add Harvest</strong>. For each field (or field section) harvested, record:</p>
<ul>
<li><strong>Crop and variety.</strong></li>
<li><strong>Harvest date.</strong></li>
<li><strong>Area harvested (ha).</strong></li>
<li><strong>Gross yield (tonnes).</strong></li>
<li><strong>Moisture at harvest (%).</strong></li>
<li><strong>Estimated dry yield (tonnes):</strong> calculated automatically from gross yield and moisture.</li>
<li><strong>Sale Price (£/t):</strong> the agreed or achieved price per tonne for this crop. This is stored precisely in pence and used by the Season Production Report to calculate total revenue and gross margin for the season. You can record it at harvest time or fill it in once the contract is finalised.</li>
<li><strong>Destination store:</strong> linked to a storage location in the Grain &amp; Crop Storage module.</li>
<li><strong>Machine used.</strong></li>
</ul>
<h3>Grain position</h3>
<p>Once a harvest record is saved, the grain enters the Grain Position tracker. This shows total harvested, total moved out (sales and transfers), and current balance in store for each commodity. The balance updates in real time as stock movements are logged.</p>
<h3>Pre-harvest interval check</h3>
<p>The harvest record links to spray application records for the same field. If any application was made within the product's PHI, the record shows a warning that the pre-harvest interval may not have been met — this is a critical food safety check for fresh produce and malting barley crops.</p>
<h3>Gross margin contribution</h3>
<p>The Sale Price per tonne recorded here is picked up automatically by the <strong>Season Production Report</strong> (Field &amp; Crop Management → Season Reports). The report multiplies the sale price by total yield to produce a Revenue figure, then subtracts all recorded input costs (seed, fertiliser, and spray) to arrive at a Gross Margin in £ and £/ha. No re-entry is needed — completing the sale price field here is all that is required.</p>`,
  ],
  // 19 — Livestock Medicine Records and Withdrawal Periods
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
<li><strong>Link to stock register (optional):</strong> select a product from your veterinary medicine store; the quantity used is deducted from stock levels automatically when the record is saved, keeping your medicine inventory in step with your treatment book without a separate manual adjustment.</li>
<li><strong>Link to vet prescription (optional):</strong> choose the authorising written prescription from the Vet Prescriptions register; vet name, dispensing date, and prescription reference auto-populate for a complete medicines audit trail.</li>
</ul>
<h3>Withdrawal period alerts</h3>
<p>Animals with an active withdrawal period are flagged in the Individual Animal Register with an amber badge. An automated check runs hourly across all livestock medicine records — cattle, sheep, goats, deer, and pigs. A warning notification is raised for every active withdrawal period, escalating to critical (with an SMS alert) when the period is within three days of ending, so movements and milk supply can be reinstated promptly.</p>
<h3>Vet authorisation</h3>
<p>For medicines used under a Veterinary Written Direction (VWD) or Cascade prescription, attach the vet's written authorisation to the treatment record. The Vet Prescriptions tab provides a dedicated register for all outstanding prescriptions with their expiry dates.</p>
<h3>Adverse Drug Reaction (ADR) recording and VMD SARSS reporting</h3>
<p>Under the Veterinary Medicines Regulations 2013 (Regulation 58 and Schedule 6), any suspected adverse reaction to a veterinary medicine must be reported to the VMD's Suspected Adverse Reaction Surveillance Scheme (SARSS). BDE Farm Trac provides a structured ADR section on every medicine record.</p>
<p>Toggle <strong>Adverse reaction suspected</strong> on a treatment record to reveal the ADR fields:</p>
<ul>
<li><strong>Clinical signs:</strong> free-text description of signs observed.</li>
<li><strong>Severity:</strong> Mild, Moderate, Severe, or Fatal.</li>
<li><strong>Onset (hours):</strong> how many hours after administration the reaction first appeared.</li>
<li><strong>Outcome:</strong> Recovered, Recovering, Not Recovered, Unknown, or Fatal.</li>
<li><strong>Reported to vet date:</strong> the date you notified your attending vet.</li>
<li><strong>Vet reported to VMD date:</strong> the date your vet submitted the report to VMD via SARSS.</li>
<li><strong>VMD SARSS reference:</strong> the reference number assigned by VMD once the report is logged.</li>
</ul>
<p>A dedicated <strong>ADR Register</strong> tab on the Medicines page lists every suspected reaction across all your treatments — with severity badges, outcome status, vet-report date, and SARSS reference — so you can track reporting progress and ensure nothing is missed.</p>
<p>The <strong>AMR Report</strong> page (Livestock → AMR Report) includes an ADR summary panel showing the total number of suspected reactions for the year, how many were reported to a vet, how many were escalated to VMD via SARSS, and a warning alert if any remain unreported.</p>
<p>ADR recording is available on both the dashboard and the mobile app. To submit a SARSS report directly, visit <a href="https://www.vmd.defra.gov.uk/adversereactionreporting/" target="_blank" rel="noopener noreferrer">www.vmd.defra.gov.uk/adversereactionreporting</a>.</p>`,
  ],
  // 20 — Pest Control and Cleaning Records
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
  // 26 — Organic Arable Seed Stock Ledger — Recording Seed Receipts, Use and Balance
  [
    "How to track organic seed stock — receipts, field consumption, and running balance — using the Seed Stock Ledger in the Organic Arable module.",
    `<h2>Organic Arable Seed Stock Ledger — Recording Seed Receipts, Use and Balance</h2>
<p>The <strong>Seed Stock Ledger</strong> (a sub-tab under <strong>Seed Sourcing</strong> in the Organic Arable module) gives you an auditable running balance of organic seed on farm, from delivery through to drilling. This is essential evidence under UK Retained EU Organic Regulation (e.g. Reg 2018/848), which requires organic land to be sown only with certified organic seed unless a documented derogation applies.</p>
<h3>Setting up a stock line</h3>
<p>Add a stock line for each seed batch: crop name, variety, batch/lot number, seed type (Certified Organic, Untreated Conventional, or Treated Conventional — the latter two only where a derogation applies), supplier name, a reorder threshold in kg, and a storage location.</p>
<h3>Recording movements</h3>
<p>Every change to a stock line is logged as a movement: <strong>Goods In</strong> (a delivery, with PO/GRN/invoice reference and unit cost), <strong>Consumption</strong> (drilled to a field, recording the field and seed rate in kg/ha), <strong>Adjustment</strong>, or <strong>Waste</strong>. Each movement records the date, quantity, and the operator who logged it.</p>
<h3>Reading the balance</h3>
<p>The ledger keeps a running balance for each stock line as movements are added, so you can see at a glance how much of a batch remains and confirm that seed used on organic land was drawn from a certified organic batch. When a stock line's balance falls near its reorder threshold, it is flagged so you can plan the next purchase in good time for drilling.</p>`,
  ],
  // 27 — Organic Arable Module — Bundled Field Management Access Explained
  [
    "How the Organic Arable module shares your farm's field register, sprays and drilling records with the standard Field & Crop Management module.",
    `<h2>Organic Arable Module — Bundled Field Management Access Explained</h2>
<p>The Organic Arable module doesn't duplicate your field data — it is built directly on top of your farm's central field register, so organic compliance records and everyday field operations stay in sync automatically.</p>
<h3>Shared field register</h3>
<p>Every field selector in the Organic Arable module (Field Conversion, Input Log, Harvest Declarations) pulls live from the same field list used across BDE Farm Trac. Add or edit a field once in <strong>Field &amp; Crop Management → Fields</strong> and it is immediately available throughout Organic Arable — there is no separate organic field list to maintain.</p>
<h3>Cross-module traceability</h3>
<p>Because Organic Arable records reference the same field IDs as sprays, drilling and harvest records, you can cross-check organic compliance against general farm operations for the same field — for example confirming that no non-approved spray has been logged against a field that is marked Certified organic.</p>
<h3>Why this matters for audits</h3>
<p>Auditors often ask to see a field's full history, not just its organic paperwork. Because the modules share the same field record, you can show conversion status, certification scope, input applications and standard field operations (drilling, sprays, harvest) side by side without re-keying anything.</p>`,
  ],
  // 28 — Organic Arable Field Conversion Tracker and Certification Records
  [
    "Tracking each field's organic conversion status and your farm's overall certification details in the Organic Arable module.",
    `<h2>Organic Arable Field Conversion Tracker and Certification Records</h2>
<p>Organic status is granted field-by-field, not farm-wide, and must be backed by an active certification. The Organic Arable module provides two linked tabs to manage this: <strong>Field Conversion</strong> and <strong>Certification</strong>.</p>
<h3>Field Conversion tab</h3>
<p>For each field, record its area, conversion status (Pre-Conversion, In Conversion, Certified, or Lapsed), the conversion start date, the expected certification date, the actual certification date once granted, and the field's previous land use. UK Retained EU Organic Regulation requires a minimum <strong>two-year conversion period</strong> for arable land before it can be certified fully organic — the tracker calculates and displays the expected certification date from the start date so you know exactly when each field becomes eligible.</p>
<h3>Certification tab</h3>
<p>Record your farm's overall organic certification: certifying body (e.g. Soil Association, OF&amp;G), certificate number, operator number, status (Certified, In Conversion, Suspended, or Withdrawn), certification date, renewal date, next inspection date, and certification scope (Arable, Horticulture, Livestock, Land, or Handling).</p>
<h3>Why both matter</h3>
<p>An auditor checking Red Tractor Organic Standard or EU organic compliance will want to see both: the farm-level certificate proving you are a certified operator, and the field-level conversion record proving each specific field has served its conversion period and is within the certified scope.</p>`,
  ],
  // 29 — Organic Arable Input Log and Annex II Substance Compliance
  [
    "How to record organic arable inputs using the Annex II SubstancePicker, manage Permitted and Restricted status, and capture certifier approval for restricted inputs.",
    `<h2>Organic Arable Input Log and Annex II Substance Compliance</h2>
<p>The <strong>Input Log</strong> tab in the Organic Arable module records every substance applied to organic or in-conversion arable land, checked against the <strong>Annex II</strong> list of permitted inputs under EU Organic Regulation 2018/848.</p>
<h3>Recording an input</h3>
<p>For each application, record the date, field/parcel, the product or substance (selected from a pre-defined Annex II approved list via the SubstancePicker), the active ingredient, input type, quantity applied, unit (kg/ha, l/ha, etc.), area applied, and supplier. Applications can be linked to a Goods Received Note for batch/lot traceability back to the seed or input delivery.</p>
<h3>Permitted, Restricted and Prohibited status</h3>
<p>Each substance in the picker carries a status: <strong>Permitted</strong> (usable without extra sign-off), <strong>Restricted</strong> (usable only with prior certifier notification), or <strong>Prohibited</strong> (not permitted on organic land under any circumstances). The regulatory basis (e.g. Annex II, EU Reg 2018/848) is shown alongside the substance.</p>
<h3>Certifier approval for restricted inputs</h3>
<p>When a Restricted substance is selected, the form requires a <strong>Certifier Approval Reference</strong> before the record can be saved — the UI displays a warning that restricted substances require prior certifier notification. This ensures you cannot log a restricted input without the paperwork to back it up, which is exactly what an organic inspector will ask to see.</p>`,
  ],
  // 30 — Logging Animal Mortality Records
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
  // 31 — Feed Records and Traceability
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
  // 32 — Water Quality Testing Records
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
  // 33 — Environmental Management — Features, Schemes & Management Events
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
  // 34 — Field Inspections — Logging, Action Flags & Resolution Tracking
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
  // 35 — Farm Buildings & Areas Registry
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
  // 36 — Understanding Business Reports
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
  // 37 — SMS Text Alerts — Setup, Who Receives Them & Opting In
  // 33 — SMS Text Alerts — Setup, Who Receives Them & Opting In
  [
    "How to configure SMS text alerts in BDE Farm Trac, including the category-based opt-in system, what triggers each category, and how each team member controls their own alerts.",
    `<h2>SMS Text Alerts — Setup, Who Receives Them & Opting In</h2>
<p>BDE Farm Trac's SMS Text Alerts module sends instant text messages to opted-in farm users when compliance events occur. Each team member independently chooses which alert categories they receive — so dairy managers only get dairy texts, cereals managers only get arable texts, and no-one is bombarded with alerts outside their role.</p>
<h3>Why category-based alerts?</h3>
<p>On a mixed farm, a dairy manager can enable Dairy alerts and disable Livestock and Arable, so they only receive texts relevant to their role. A livestock manager can do the reverse. A farm administrator might enable all categories to stay across the whole operation. Each person's category settings are personal to them — changing yours does not affect anyone else's preferences.</p>
<h3>Setting up — entering your mobile number</h3>
<p>Navigate to <strong>Account &amp; Notifications</strong> (via your account menu in the top-right corner, or on the mobile app via Settings). Enter your UK mobile number in international format (e.g. +447911123456), tick the consent checkbox, and click <strong>Save preferences</strong>.</p>
<h3>Enabling SMS and choosing your categories</h3>
<p>Toggle <strong>Enable SMS text notifications</strong> on. The alert categories panel appears beneath the master toggle. Switch each category on or off to match your responsibilities. Only categories relevant to your farm's active modules are shown — a farm without the Dairy module will not see the Dairy category.</p>
<p>The master toggle acts as an override: switching it off stops all SMS alerts to you regardless of your category settings, without losing your category preferences for when you re-enable it.</p>
<h3>Alert categories</h3>
<ul>
<li><strong>Livestock &amp; Animals</strong> — Welfare alerts, withdrawal period breaches, notifiable disease suspicions, and herd health follow-ups.</li>
<li><strong>Dairy</strong> — ABR test results, mastitis records, and mobility scoring alerts.</li>
<li><strong>Arable &amp; Crops</strong> — IPM pest and disease threshold alerts, irrigation advisories, and field scouting flags.</li>
<li><strong>Viticulture &amp; Winery</strong> — Vineyard and winery compliance alerts.</li>
<li><strong>Task Assignments &amp; Reminders</strong> — Notifications when tasks are assigned to you, and timesheet submission reminders.</li>
<li><strong>Regulatory Compliance</strong> — Withdrawal period breaches, biosecurity declarations, SSAFO inspections, and RIDDOR incidents.</li>
<li><strong>Quality &amp; Non-conformances</strong> — Non-conformance records, corrective actions, and feed intake rejections.</li>
<li><strong>Stock &amp; Supplies</strong> — Stock-low and stock-out alerts across feed, medicines, and supplies.</li>
</ul>
<h3>Farm Managers</h3>
<p>Farm Managers are automatically included in critical alerts when a mobile number is saved. Disabling SMS entirely always overrides this designation. Your BDE Farm Trac account administrator can update your alert designation.</p>
<h3>Push notifications</h3>
<p>Staff who have the mobile app installed also receive push notifications alongside SMS. Each team member's category settings apply to both channels — enabling or disabling a category affects SMS and push notifications together.</p>`,
  ],
  // 38 — Waste Disposal Logging — Records, Carrier Licences & Legal Requirements
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
  // 39 — Week Ahead & Month Ahead — Your Compliance Planner
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
<li><strong>Beekeeper notification deadlines</strong> — when a spray application uses a product marked as harmful to bees (🐝 flag set in the Product Register) and no notification has yet been logged for that application, an amber card appears in the planner due-dated 48 hours before the spray date with a direct link to Sprays &amp; Inputs → Notifications; once a notification is logged the card disappears automatically</li>
</ul>
<h3>Printing the planner</h3>
<p>Use the Print button to produce a formatted week or month planner suitable for pinning in the office or farm office.</p>`,
  ],
  // 40 — Task Board — Managing Staff Task Assignments
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
  // 41 — Individual Animal Register and Electronic Identification (EID)
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
  // 42 — Milk Recording and Milk Records
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
  // 43 — Mastitis Records and Treatment Logging
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
  // 44 — Calving Records and Colostrum Management
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
  // 45 — Dry Cow Therapy (DCT) Records
  // 42 — Dry Cow Therapy (DCT) Records
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
  // 46 — Workshop & Asset Management — Overview
  // 42 — Equipment Module — Overview
  [
    "An overview of the Equipment module in BDE Farm Trac, covering the Equipment Register, asset numbers, QR labels, service history, PUWER compliance, insurance, depreciation, defect reporting, and Workshop Analytics.",
    `<h2>Equipment Module — Overview</h2>
<p>The Equipment module in BDE Farm Trac provides a full asset lifecycle view for every piece of farm machinery and equipment — from acquisition and asset registration through service history, PUWER compliance, insurance tracking, depreciation, and defect reporting. Workshop job cards, parts store management, fuel records, and analytics are all included within the same module.</p>
<h3>Equipment Register and asset numbers</h3>
<p>Navigate to <strong>Equipment → Equipment Register</strong> to view all registered machinery. Each row displays the asset number (EQ- prefix), make, model, registration or serial number, type, and current status. The asset number column includes an inline <strong>Assign / QR</strong> button — click it to assign an asset number to new equipment or to print the QR label for that machine.</p>
<h3>QR code labels</h3>
<p>Every piece of equipment in the register has a unique EQ- code. Click <strong>Assign / QR</strong> on the equipment row to generate and print the label. Print on weatherproof stock and fix to the machine cab or chassis. Mobile app users can scan the label to open the machine record and log defects, service notes, or pre-use checks instantly.</p>
<h3>PUWER compliance tab</h3>
<p>The PUWER (Provision and Use of Work Equipment Regulations 1998) tab within each equipment record tracks mandatory inspection and thorough examination records. Record the examination date, examining engineer, result (Pass / Fail / Action Required), any defects identified, and the next examination due date. Overdue examinations are flagged with a red warning on the equipment row and on the PUWER tab summary card.</p>
<h3>Insurance tab</h3>
<p>The Insurance tab within each equipment record links the machine to one or more policies from your Farm Insurance Register. Record the policy type (e.g. Combined Farm, Motor/Plant), insurer, policy number, and coverage period per machine. This provides a per-asset insurance audit trail without duplicating policy data held centrally in the Insurance Register.</p>
<h3>Depreciation tab</h3>
<p>The Depreciation tab records the acquisition date, purchase price, and depreciation method (straight-line over a chosen number of years). The current book value is calculated automatically and shown on the asset card for each piece of equipment, ready for inclusion in your farm's balance sheet or asset register for accountancy purposes.</p>
<h3>Defect reports</h3>
<p>Operators report defects from the mobile app by selecting the machine and entering the defect description. The defect appears as an open item in <strong>Equipment → Defect Reports</strong>. High and critical severity defects trigger a warning banner flagging the equipment as potentially unsafe to operate until resolved. Raise Task from any open defect to assign a named staff member with a due date and repair instructions.</p>
<h3>Workshop job cards</h3>
<p>Navigate to <strong>Equipment → Workshop Jobs</strong> to log each workshop job — planned service, breakdown repair, or modification. Each job card captures the machine, fault description or job type, date raised, estimated and actual hours, parts used from the Parts Store, and job status (Open, In Progress, Completed). Job cards can be linked to Farm Services customers and invoiced with one click.</p>
<h3>Workshop Analytics tab</h3>
<p>The Workshop Analytics tab provides a summary of workshop activity across a selected date range — total jobs completed, average completion time, most-serviced machines, mechanic workload breakdown, parts cost totals, and open-job count by priority. Use it to identify machines with high maintenance frequency or to review workshop throughput for cost control.</p>`,
  ],
  // 47 — Scanning QR Codes with the Mobile App
  // 43 — Scanning QR Codes with the Mobile App
  [
    "How to use the BDE Farm Trac mobile app to scan QR codes for fields, animals, equipment, storage locations, and buildings.",
    `<h2>Scanning QR Codes with the Mobile App</h2>
<p>BDE Farm Trac generates unique QR codes for fields, individual animals, equipment, storage locations, and farm buildings. Scanning a QR code in the field opens that item's record instantly — no searching or typing required. This speeds up data entry significantly when recording spray applications, medicine treatments, defect reports, or stock movements at the point of activity.</p>
<h3>How to scan a QR code</h3>
<p>Open the BDE Farm Trac mobile app and tap the QR scanner icon in the top toolbar. Point the camera at the code. If the device is online, the app resolves the item immediately and opens its record. If offline, the item is looked up from the locally cached reference data.</p>
<h3>What you can scan</h3>
<ul>
<li><strong>Field labels:</strong> scan a field stake or gate label to open the field's record and log a spray application, soil sample, or field operation directly against that field.</li>
<li><strong>Animal tags:</strong> scan a QR code printed for an individual animal to open its medicine treatment history, add a new treatment, or record a health observation.</li>
<li><strong>Equipment labels:</strong> scan a machine's EQ- QR label (generated from the Equipment module) to open its service history and log a defect report, pre-use check, or maintenance note instantly from the field or yard.</li>
<li><strong>Storage locations:</strong> scan a grain store or chemical store QR code to view the current stock balance and log a stock movement.</li>
</ul>
<h3>Generating and printing QR labels</h3>
<p>QR labels are generated from the corresponding register page in the dashboard. For fields, use the Field Register. For animals, use the Individual Animal Register. For equipment, use the Equipment Register — click the <strong>Assign / QR</strong> button on any equipment row. Labels are printed as A5 or A4 sheets with the QR code and the item name for easy identification. Use weatherproof label materials for outdoor use.</p>`,
  ],
  // 48 — Generating QR Labels for Fields, Animals, and Storage
  // 44 — Generating QR Labels for Fields, Animals, Equipment, and Storage
  [
    "How to generate and print QR code labels for fields, animals, equipment, and storage locations in BDE Farm Trac.",
    `<h2>Generating QR Labels for Fields, Animals, Equipment, and Storage</h2>
<p>QR code labels provide a fast way to connect physical farm locations and assets to their digital records in BDE Farm Trac. Once a QR label is printed and placed on a gate, tag, machine cab, or store door, any user with the mobile app can scan it to open the relevant record immediately.</p>
<h3>Generating a field label</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Field Register</strong> and open the field detail. Click <strong>Generate QR Label</strong>. The label downloads as a PDF containing the QR code, the field name, the OS parcel reference, and the field area. Print on a weatherproof label or laminate an A5 sheet for gate mounting.</p>
<h3>Generating an animal label</h3>
<p>Navigate to <strong>Livestock → Individual Animals</strong> and open the animal's record. Click <strong>Generate QR Label</strong>. The label shows the QR code alongside the primary ear tag number, species and breed, and date of birth. Print on adhesive label stock or on a durable card for pen-side mounting.</p>
<h3>Generating an equipment label</h3>
<p>Navigate to <strong>Equipment → Equipment Register</strong> and locate the machine in the list. Click the <strong>Assign / QR</strong> button on the equipment row. If no asset number has been assigned yet, you will be prompted to assign one first (EQ- prefix, e.g. EQ-0042). The label downloads as a PDF showing the QR code, the asset number, the machine name (make and model), and the registration or serial number. Print on weatherproof stock and fix to the machine cab or chassis plate. Once printed, mobile app users can scan the label to log defect reports, pre-use checks, and maintenance notes directly against that machine without searching.</p>
<h3>Generating a storage location label</h3>
<p>Navigate to <strong>Grain &amp; Crop Storage → Locations</strong> and open the location record. Click <strong>Generate QR Label</strong>. The label shows the store name, location type, and current commodity. Print and fix to the store door or silo access panel.</p>
<h3>Best practice</h3>
<ul>
<li>Regenerate labels if the item's key details change (e.g. field renamed, animal retagged, equipment renamed).</li>
<li>Mount labels at a consistent height for ease of scanning from the mobile app camera.</li>
<li>Laminate or use UV-resistant printing for outdoor labels to ensure the QR code remains scannable throughout the season.</li>
<li>For equipment, fix labels inside the cab near the steering column or on the chassis where they are protected from dirt and weather.</li>
</ul>`,
  ],
  // 49 — PAT Testing & Fire Extinguisher Records
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
  // 50 — Workshop Risk Assessments & COSHH
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
  // 51 — Getting Started with Pig Production Records
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
  // 52 — Pig Movement and Identification
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
  // 53 — Getting Started with Poultry Production Records
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
  // 54 — Salmonella, Biosecurity and Poultry Health Plans
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
  // 55 — Getting Started with Fresh Produce Records
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
  // 56 — Pre-Harvest Intervals, MRLs and Residue Testing
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
  // 57 — Carbon & Sustainability Records
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
  // 58 — Farm Diversification Records
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
  // 59 — Water & Irrigation Management
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
  // 60 — AI & Reproduction Records for Livestock
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
  // 61 — Veterinary Prescriptions & Medicine Book
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
  // 62 — SFI & Agri-Environment Actions
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
  // 63 — Slurry & Manure Management Records
  // 59 — Slurry & Manure Management Records
  [
    "How to record slurry and organic manure store fills, spreading events, and closed period compliance in BDE Farm Trac — including species-specific storage enforcement.",
    `<h2>Slurry & Manure Management Records</h2>
<p>Slurry and organic manure management is regulated by the Nitrates Regulations in NVZ areas and by the Water Resources (Control of Pollution)(Silage, Slurry and Agricultural Fuel Oil) Regulations (SSAFO) more broadly. BDE Farm Trac provides a comprehensive Slurry &amp; Manure section within the Environmental module covering store registration, fill and intake events, spreading records, and NVZ closed period compliance.</p>
<h3>Slurry store register</h3>
<p>Navigate to <strong>Environmental → Slurry &amp; Manure → Stores</strong> and register each store. Each record captures the store name, type (earth-banked lagoon, above-ground tank, reception pit, concrete-walled store), material type (e.g. Cattle Slurry, Pig Slurry, Poultry Manure), capacity (m³), responsible operator, and build or commission date. The stores table displays a live fill-level progress bar for each store — colour-coded green (below 75%), amber (75–90%), and red (above 90%) — calculated from the total volume of fill events logged against that store. Clicking a store row opens a detail panel with a capacity gauge dial alongside the full store specification.</p>
<h3>Fill &amp; Intake Events</h3>
<p>The Fill &amp; Intake Events sub-register records every occasion material is received into a store. Each event captures the store, date, material type, volume added (m³), and source or origin (e.g. cattle housing, dirty water, import from off-farm). The material type is shown as a green pill badge in the events table. These events feed the fill-level progress bars and provide the intake audit trail needed alongside your spreading records to support nitrogen budget calculations.</p>
<h3>Species-specific storage enforcement</h3>
<p>When a store has a Material Type configured, the Manure Type field on the spreading form and the Material Type field on the fill event dialog are replaced with a <strong>🔒 locked display</strong> that cannot be overridden by the user. This enforces species-specific storage as required by RB209 — ensuring cattle slurry, pig slurry, and poultry manure are always recorded and stored separately. The API enforces the same rule server-side and rejects mismatched entries with a descriptive error explaining which material the store accepts.</p>
<h3>Spreading records</h3>
<p>Each spreading record captures the source store, field, area (ha), volume applied (m³), application rate (m³/ha), application method (trailing shoe, injected, band spreading, splash plate, irrigated), soil condition at spreading, contractor, and NVZ closed-period flag. When a source store with a configured material type is selected, the Manure Type field locks automatically — no manual override is possible.</p>
<h3>Closed period compliance</h3>
<p>NVZ closed periods for slurry spreading (typically 1 October to 31 January for most livestock slurries in England) are shown as a countdown on the Environmental dashboard. Spreading forms display a warning if the selected date falls within a closed period, requiring the user to explicitly confirm before saving. Applications during a closed period are flagged on the record for compliance review.</p>`,
  ],
  // 64 — Grain Storage Quality Records
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
  // 65 — Fly-Tipping — Recording Incidents, Authority Reporting and Photo Evidence
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
  // 66 — Unauthorized Encampments — Recording, Authority Action and Legal Remedies
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
  // 67 — Crop Trials Register — Setting Up and Managing On-Farm Trials
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
  // 68 — Haulage & Transport — Module Overview
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
  // 69 — Dispatch Plans — Planning and Managing Crop Movements
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
  // 70 — Forward Contracts — Managing Grain Sales & Pricing
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
  // 71 — Grain Position — Tracking Your Crop Stock
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
  // 72 — Tail Biting Risk Assessments — Pig Production
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
  // 73 — Farrowing & Sow Records — Pig Production
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
  // 74 — Broiler Welfare Indicators (BWI) — Poultry Production
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
  // 75 — House Cleanout Records — Contractor Tracking, Disinfectant and Cost
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
  // 76 — Right to Work Checks for Farm Employers
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
  // 77 — Staff Management & System Access
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
  // 78 — Thinning Records — Poultry Production
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
  // 79 — Soil Sample Register — Understanding References and Status
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
  // 80 — AI & Reproduction Records — Cattle and Livestock
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
  // 81 — Vet Prescriptions — Storing and Tracking Written Authorisations
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
  // 82 — SFI / ELMS Agreements — Recording and Tracking Agri-Environment Schemes
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
  // 83 — Slurry & Manure Management — Records and Closed Period Compliance
  // 79 — Slurry & Manure Management — Records and Closed Period Compliance
  [
    "How to manage NVZ closed period compliance, store fill tracking, and species-specific material enforcement in BDE Farm Trac's Slurry & Manure module.",
    `<h2>Slurry & Manure Management — Records and Closed Period Compliance</h2>
<p>Slurry and organic manure management is one of the most heavily regulated activities on a livestock farm. The Nitrates Regulations set closed periods during which slurry cannot be spread, minimum store capacity requirements, and field-level nitrogen limits. BDE Farm Trac tracks all of these in the Slurry &amp; Manure section of the Environmental module.</p>
<h3>Closed period overview</h3>
<p>NVZ closed periods for slurry spreading in England vary by material and soil type. For cattle slurry on soil to be autumn-sown cereals, the period typically runs from 1 August to 31 October. For all other situations, the standard period is 1 October to 31 January. The platform shows a countdown to the next closed period start date on the Environmental dashboard. The spreading form includes a dedicated NVZ Closed Period toggle — if turned on before saving, the platform prompts a confirmation to document the reason before the record is created.</p>
<h3>Spreading records</h3>
<p>Each spreading record captures the source store, date, field, area (ha), volume (m³), application rate (m³/ha), application method, soil condition at spreading, and contractor. If a source store with a configured material type is selected, the Manure Type field is locked to that material and cannot be changed — this is the species-specific storage enforcement ensuring your records correctly reflect which animal species' slurry was applied to each field, as required by RB209 nitrogen budgeting. Records are automatically flagged if the spreading date falls within a closed period.</p>
<h3>Fill &amp; Intake Events — tracking what goes in</h3>
<p>Alongside spreading records (what comes out), the Fill &amp; Intake Events log records what material goes into each store: date, store, material type, volume (m³), and source or origin. These events update the live fill-level progress bars shown in the stores table — colour-coded green, amber, and red by fill percentage relative to registered capacity. A capacity gauge dial is shown in the store detail view. Both intake and spreading records are needed to demonstrate that your nitrogen budget calculations start from the correct opening inventory.</p>
<h3>Store capacity compliance</h3>
<p>NVZ regulations require minimum slurry storage capacity equivalent to six months' production for pig and poultry units (five months for cattle). Register each store in the Stores tab with its type and capacity (m³). The stores table shows live fill-level bars so you can see at a glance if any store is approaching capacity — critical for planning emptying runs before the closed period begins.</p>`,
  ],
  // 84 — Grain Storage Quality — Monitoring and Record Keeping
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
  // 85 — Fresh Produce Module — Crop Records, Sprays, and Assurance
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
  // 86 — Carbon & Sustainability — Measuring and Recording Your Farm's Footprint
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
  // 87 — Farm Diversification — Recording Non-Agricultural Activities
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
  // 88 — Water & Irrigation — Abstraction, Usage, and Compliance Records
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
  // 89 — Equipment Defect Reports — Tracking Faults and Repairs
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
  // 90 — Testing Laboratories — Registering Labs and Linking Test Results
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
  // 91 — Pig Production Module — Overview
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
  // 92 — Poultry Production Module — Overview
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
  // 93 — Fresh Produce Module — Overview
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
  // 94 — Carbon & Sustainability Module — Overview
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
  // 95 — Farm Diversification Module — Overview
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
  // 96 — Water & Irrigation Module — Overview
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
  // 97 — AI & Reproduction Records — Livestock
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
  // 98 — Sire Register — Recording Donor Bulls, Rams, Boars & Bucks
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
  // 99 — Straw Inventory — Managing AI Semen Deliveries & Stock Levels
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
  // 100 — Lambing Records — Red Tractor Sheep Assurance
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
  // 101 — Vet Prescriptions & Medicines — Red Tractor Requirements
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
<p>BDE Farm Trac's Medicine Records module captures all required fields for each treatment. Batch numbers are mandatory fields — the record cannot be saved without one. Withdrawal periods are calculated automatically from the product's label data. VWD references link to the Vet Prescriptions register. Stock levels are tracked via the Trade Contacts &amp; Stock module against product batches received in Goods Received Notes, providing the medicine stock record alongside the treatment book. Treatment records can also be directly linked to a stock item in the veterinary medicine register — selecting the stock item and entering the quantity used on the treatment form deducts the amount from the stock level automatically when the record is saved, so usage and stock balance are always in agreement without a separate manual adjustment.</p>`,
  ],
  // 102 — SFI / ELMs Actions & Agreements — Environmental Module
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
  // 103 — Slurry & Manure Management — Environmental Module
  // 99 — Slurry & Manure Management — Environmental Module
  [
    "Full overview of the Slurry & Manure section in BDE Farm Trac — store register with fill-level tracking, Fill & Intake Events log, species-specific material enforcement, spreading records, and mobile app capture.",
    `<h2>Slurry & Manure Management — Environmental Module</h2>
<p>The Environmental module's Slurry &amp; Manure section provides the complete record-keeping framework for NVZ compliance — store registration with live fill-level tracking, Fill &amp; Intake Events, spreading events, closed period monitoring, and species-specific storage enforcement enforced at both the interface and API level.</p>
<h3>Store register and fill-level tracking</h3>
<p>Navigate to <strong>Environmental → Slurry &amp; Manure → Stores</strong> to register each store. Each record captures the store name, type (earth-banked lagoon, above-ground tank, reception pit, concrete-walled store), material type (e.g. Cattle Slurry, Pig Slurry, Poultry Manure), capacity (m³), responsible operator, and build date. The stores table shows a live fill-level progress bar per store — green below 75%, amber at 75–90%, red above 90% — updated automatically as fill events are logged. Clicking a store row opens a detail view with a full capacity gauge dial.</p>
<h3>Fill &amp; Intake Events</h3>
<p>The Fill &amp; Intake Events sub-register records every occasion material is received into a store. Each event captures: store, date, material type, volume added (m³), and source or origin (e.g. cattle housing, dirty water, import). The material type appears as a green pill badge in the events table for quick visual audit confirmation. These events drive the fill-level bars and form the intake side of your complete slurry balance record.</p>
<h3>Species-specific storage enforcement</h3>
<p>This is a hard compliance control built directly into the module. When a store has a Material Type configured, the Manure Type field on the spreading form and the Material Type field on the fill event dialog are replaced with a <strong>🔒 locked display</strong> the user cannot override — the store's configured species is the only value that can be recorded. This prevents cattle, pig, and poultry slurry from being mixed in records, ensuring species-split nitrogen accounting as required by RB209. The same check runs server-side: any API call attempting to log a fill or spreading event with a mismatched material is rejected with a 422 error and a clear message explaining which material the store accepts.</p>
<h3>Spreading event records</h3>
<p>Each spreading record captures: source store (with material type auto-locked from the store), field, area (ha), volume applied (m³), application rate (m³/ha), application method (trailing shoe, injected, band spreading, splash plate, irrigated), soil condition at spreading, contractor, NVZ closed-period flag, and windspeed acceptable flag. The soil condition field shows a run-off warning if Wet, Saturated, or Frozen is selected — prompting the user to review spreading conditions against the Nitrates Regulations before saving.</p>
<h3>Risk assessment for spreading</h3>
<p>Before spreading on steep slopes, near watercourses, or in adverse weather, complete a pre-spreading risk assessment documenting the field risk factors, precautions taken, and the assessor's name — satisfying the Nitrates Regulations requirement for risk-assessed spreading in high-risk situations.</p>
<h3>Mobile app — field capture for spreading and store fills</h3>
<p>Both spreading and fill events can be captured in the field on the BDE Farm Trac mobile app. The <strong>Slurry / Manure Spreading</strong> screen shows your registered stores as selectable tiles, locks the material type to the store's configured species, provides a field picker, soil condition chips (with run-off warnings), NVZ closed-period gate, and GPS capture — all saved offline and synced when connectivity returns. The <strong>Slurry Store Fill / Intake</strong> screen shows the receiving store with a live capacity bar indicating what percentage of the store's capacity the intake represents, locks the material type, and saves offline to sync to the fill events log.</p>`,
  ],
  // 104 — Grain Store Quality Management — Equipment Module
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
  // 105 — Soil Sample Register — Format and Reference Numbers
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
  // 106 — Farm Insurance Register
  // 102 — Farm Insurance Register
  [
    "How to record farm insurance policies in BDE Farm Trac, including coverage types, sums insured, renewal dates, per-machine insurance tabs in Equipment, and policy documents.",
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
<h3>Per-machine insurance tab in Equipment</h3>
<p>Each individual equipment record in the Equipment Register has an Insurance tab. Use this tab to link one or more policies from your Farm Insurance Register to that specific machine — recording the policy type, insurer, policy number, and coverage period per asset. This gives you a per-machine insurance audit trail without duplicating the full policy details held centrally in the Insurance Register. For example, you might link a Motor/Plant policy to a combine harvester and a separate Public Liability policy when that machine is used for contract work.</p>
<h3>Renewal alerts</h3>
<p>Policies approaching renewal (within 60 days) are flagged with amber warnings on the Insurance Register dashboard card. An SMS alert is sent to opted-in managers at 60 days before expiry.</p>
<h3>Coverage cross-reference</h3>
<p>The Farm Services &amp; Contracting module cross-references the insurance register to flag when equipment hire or contracting jobs are booked outside the current public liability or employer's liability policy period.</p>`,
  ],
  // 107 — Purchase Orders — Raising and Managing POs
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
  // 108 — Goods Received Notes (GRN) — Logging Deliveries and Linking to POs
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
  // 109 — Batch & Lot Traceability in Spray Application Records
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
  // Spray Notifications — Beekeeper & Neighbour Notification Log
  [
    "How to record pre-spray notifications to beekeepers and neighbouring landowners in BDE Farm Trac, including the 48-hour lead time check, contact book, and printable notification letter.",
    `<h2>Spray Notifications — Beekeeper & Neighbour Notification Log</h2>
<p>Red Tractor Combinable Crops, Fresh Produce, and Horticulture standards require you to document that beekeepers and neighbouring landowners were notified before applying products harmful to bees or near a boundary. BDE Farm Trac's Notification Log provides a complete, auditable record of every communication made.</p>
<h3>Which products require notification?</h3>
<p>Not all sprays — only those whose product label carries a "harmful to bees" or bee precaution statement. This primarily covers insecticides (pyrethroids, organophosphates, neonicotinoids where still approved, carbamates) and a small number of fungicides applied during flowering. Herbicides and most fungicides do not require beekeeper notification, though courtesy notice to neighbouring landowners before any boundary application is good practice. Check the product label — if it carries a bee precaution statement, tick the <strong>🐝 Harmful to Bees</strong> flag in the Product Register. This is the trigger for all planner alerts described below.</p>
<h3>How to log a notification</h3>
<p>Navigate to <strong>Sprays &amp; Inputs → Notifications</strong> and click <strong>Log Notification</strong>. Complete the following:</p>
<ul>
<li><strong>Notification date:</strong> the date you gave notice — must be at least 48 hours before the planned spray date.</li>
<li><strong>Planned spray date:</strong> enter this to activate the 48-hour lead time check. The system shows a green badge ("✓ X days notice") or a red warning ("⚠ Under 48-hour notice") immediately.</li>
<li><strong>Recipient type:</strong> Beekeeper, Neighbour, or Other.</li>
<li><strong>Recipient name and contact:</strong> phone number or email address of the person notified.</li>
<li><strong>Recipient address:</strong> postal address — used to auto-fill the printable notification letter.</li>
<li><strong>Contact method:</strong> Phone, Email, Letter, In-person, or Text.</li>
<li><strong>Products notified:</strong> list the products you mentioned in the notification.</li>
<li><strong>Fields / areas:</strong> the fields or parcels where spraying is planned.</li>
<li><strong>Linked spray application:</strong> optionally link to an existing spray application record for full audit trail.</li>
<li><strong>Confirmation received:</strong> tick once the recipient acknowledges the notification. Enter the confirmation date, method, and reference.</li>
</ul>
<h3>Contact Book</h3>
<p>Save your regular beekeepers and neighbouring landowners in the <strong>Contact Book</strong> (the button sits alongside Log Notification). Each contact stores their type, name, phone/email, and postal address. When logging a new notification, open the quick-pick dropdown to select a saved contact — all fields pre-fill instantly so repeat notifications take seconds rather than minutes.</p>
<h3>The 48-hour lead time check</h3>
<p>The summary panel at the top of the Notifications tab shows a red card titled <em>Under 48hr Notice</em> if any notification in the log has fewer than 48 hours between the notification date and the planned spray date. Each notification row carries a colour-coded badge — green for compliant, red for short notice. Red Tractor assessors will look at the gap between these two dates; the badge makes the status immediately clear.</p>
<h3>Printable notification letter</h3>
<p>Click the printer icon on any notification row to generate a formal, A4-ready notification letter. The letter is pre-filled with your farm name, address, and CPH number from Farm Settings, addressed to the recipient using the address you entered, and includes a table of the planned spray details (date, products, fields). Beekeeper letters ask for hive precautions to be taken; neighbour letters reference the Voluntary Initiative Code of Practice. The letter opens in a standard print dialog — no additional software needed. Print a copy for your records and post or hand deliver the original.</p>
<h3>BeeConnected</h3>
<p>An information panel at the top of the Notifications tab links to <a href="https://www.beeconnected.org.uk" target="_blank">BeeConnected</a> — the free BBKA / Bayer service that automatically alerts registered beekeepers by radius when you log a planned spray. Register once at beeconnected.org.uk and enter your field boundaries; the service then handles automatic beekeeper notification electronically. Use the BDE Farm Trac Notification Log to document any beekeepers not registered with BeeConnected and all neighbouring landowner notifications.</p>
<h3>Mobile quick-entry</h3>
<p>The mobile app includes a Spray Notification screen for quick in-field logging. Select the recipient type, enter the name and contact, choose the method, and save. The record syncs to the dashboard when connectivity is restored.</p>`,
  ],
  // Bee Precaution Flag — Product Register & 48-Hour Planner Alerts
  [
    "How to mark a spray product as harmful to bees in the Product Register, and how the 48-hour notification deadline then surfaces automatically in the Week Ahead Planner.",
    `<h2>Bee Precaution Flag — Product Register & 48-Hour Planner Alerts</h2>
<p>BDE Farm Trac's bee precaution system connects three things — the product label, the spray application calendar, and the Week Ahead Planner — so that the 48-hour notification requirement is flagged proactively rather than checked after the fact.</p>
<h3>Step 1 — Mark the product in the Product Register</h3>
<p>Navigate to <strong>Sprays &amp; Inputs → Product Register</strong> and open or add the product. The form includes a <strong>🐝 Harmful to Bees (Bee Precaution)</strong> checkbox with an amber highlight when ticked. Tick this if the product label carries a "harmful to bees", "do not apply when bees are foraging", or similar bee precaution statement. Once saved, a 🐝 icon appears on the product row in the register and an amber banner is shown inside the product detail panel as a persistent reminder. Products without the flag set are treated as not requiring beekeeper notification.</p>
<h3>Step 2 — Log a spray application with a future date</h3>
<p>When a spray application is logged using a bee-precaution product and the application date is in the future (or within the planner's look-ahead window), the system automatically checks whether a notification has been recorded in the Notification Log for that application.</p>
<h3>Step 3 — Week Ahead Planner alert</h3>
<p>If no notification is found, an amber event card appears in the <strong>Farm Planner → Week Ahead</strong> view titled <em>Beekeeper Notification Required — [Product Name]</em>. The card is due-dated 48 hours before the planned spray date — the notification deadline. The description states the spray date and links directly to <strong>Sprays &amp; Inputs → Notifications</strong> so you can log the notification immediately. If the deadline has already passed without a notification being logged, the card appears in the overdue section in red. Once a notification is logged for the application, the planner card disappears automatically on the next refresh.</p>
<h3>Assigning the notification task</h3>
<p>Every planner card, including bee-precaution notification reminders, has an <strong>Assign</strong> button. This opens the task assignment panel where you can delegate the notification to a named staff member with an SMS alert sent immediately. The assignment tracks pending / in-progress / completed status on the Task Board.</p>`,
  ],
  // 110 — Farm Planner — Week Ahead & Month Ahead View
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
  // 111 — Grants & Funding Register — Tracking FETF and Scheme Applications
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
  // 112 — Inspections Module — Tabs, Non-Conformances and Farm Assurance Certificates
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
  // 113 — Risk Assessments — Using Hazard Templates and Recording COSHH Assessments
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
  // 114 — Waste Disposal — EWC Codes and Duty of Care
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
  // 115 — Documents Module — Red Tractor Required Documents Checklist
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
  // 116 — Crop Contracts — Recording Grain Marketing Agreements
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
  // 117 — Haulage Module — Movement Records, Grain Position and Haulier Directory
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
  // 118 — Mobile App — Offline Data and How Reference Pickers Work
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
  // 119 — Fuel & Energy Management — HMRC Compliance, Oil Storage, LPG and Grid Energy
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
  // 120 — Feed Management — UFAS/FEMAS Traceability, Medicated Feed and Stock Levels
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
  // 121 — Compliance & Plans — Feed Contingency Plan, Disease Log and Feed Recalls
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
  // 122 — Sales & Trading — Recording Farm Output
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
  // 123 — Continuous Soil Monitoring — Sensor Probes and Readings
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
  // 124 — Organic Compliance Overview & Certification Tracking
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
  // 125 — Recording Organic Inspections & Attaching Documents
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
  // 126 — Organic Input Register & Restricted Inputs
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
  // 127 — Field Conversion Tracker & Parallel Production
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
  // 128 — Organic Livestock — Herd Register Linkage & Conversion
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
  // 129 — Organic Livestock — Treatment Compliance (No Double Entry)
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
  // 130 — Organic Dairy — Herd Conversion & Milk Collection Records
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
  // 131 — Organic Dairy — Treatment Compliance & Organic Feed Records
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
  // 132 — TB Testing — Enhanced Data Capture & History
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
  // 133 — Welfare Outcome Assessments — Scoring, Reporting & Mobile Recording
  // 129 — Welfare Outcome Assessments — Scoring, Reporting & Mobile Recording
  [
    "How to record welfare outcome assessments (WOAs) in BDE Farm Trac, including assessor type selection, species-adaptive measures, walkthrough tally, and external assessor purchase orders.",
    `<h2>Welfare Outcome Assessments — Scoring, Reporting & Mobile Recording</h2>
<p>Welfare Outcome Assessments (WOAs) — sometimes called outcome-based measures — assess the welfare of animals at a specific point in time. Red Tractor Dairy, Red Tractor Beef &amp; Lamb, Red Tractor Pigs, and RSPCA Assured all require regular welfare outcome assessments. BDE Farm Trac provides structured, species-adaptive forms for each assessment type.</p>
<h3>Creating a new assessment</h3>
<p>Navigate to <strong>Livestock → Welfare Outcome Assessments</strong> and click <strong>New Assessment</strong>. Select the assessment type and species — the herd picker filters your herd register to show only herds of the matching species. Assessment measures then adapt automatically: cattle, sheep, pig, and poultry assessments each display only the welfare indicators relevant to that species.</p>
<h3>Choosing the assessor type</h3>
<p>Select whether the assessment is being carried out by a <strong>Staff Member</strong> or an <strong>External Assessor</strong>:</p>
<ul>
<li><strong>Staff Member</strong> — select the person from your staff register; their name auto-populates. An in-app Walkthrough Observations tally dialog is available to count animals per observation category as you walk the herd — tally values feed the calculated outcome scores automatically.</li>
<li><strong>External Assessor</strong> — select the assessor from your Supplier register (a vet practice, consultant, or contracted assessor service). Record the expected assessment fee. On save, BDE Farm Trac automatically generates a linked purchase order (PO-YYYY-NNNN) so the cost appears immediately in your procurement trail under Trade Contacts &amp; Stock → Purchase Orders — no manual PO needed.</li>
</ul>
<h3>Recording the outcome</h3>
<p>Enter scores for each welfare indicator. The overall outcome calculates automatically and is classified as <strong>Good</strong>, <strong>Satisfactory</strong>, or <strong>Action Required</strong>. Record any corrective actions taken and set a follow-up date if required.</p>
<h3>Viewing and printing</h3>
<p>All WOA records use a view-before-edit panel so you review the record before making changes. A <strong>Print Report</strong> button generates a formatted A4 assessment report suitable for presenting to your Red Tractor assessor during an audit visit.</p>
<h3>Mobile recording</h3>
<p>Tap <strong>Record → Welfare Outcome</strong> in the mobile app to log an assessment in the field. The form saves offline if you have no signal and syncs to the dashboard automatically when connectivity is restored.</p>`,
  ],
  // 134 — Fallen Stock Records — Contractor, Veterinary Details & Invoice Tracking
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
  // 135 — Sheep Dipping Records — Pesticide Certificates & Stock Usage
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
  // 136 — Vet Prescriptions — Linking Treatments to Written Authorisations
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
  // 137 — Department Management — Creating Departments & Assigning Staff
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
  // 138 — Task Assignment — Filtering by Department & Viewing Department Tasks
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
  // 139 — Contractor H&S File — Reviews, Compliance Tasks & Supplier Badges
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
  // 140 — Task Board — New Task Types & Filtering Completed Tasks by Date
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
  // 141 — PPE Register — Where to Find It & How the Three Sub-Registers Work
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
  // 142 — PPE Stock Register — Supplier Traceability, Invoice Refs & Stock Levels
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
  // 143 — PPE Issue Register — Issuing PPE to Staff & Recording Condition Checks
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
  // 144 — PPE Risk Assessments — Recording Assessments Under PPE at Work Regulations 2022
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
  // 145 — PPE Compliance Pack — Printing the Full PPE Register for Inspection
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
  // 146 — PPE Staff Record — Printing an Individual Staff Member's PPE History
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
  // 147 — Sheep Production Module — Overview and Getting Started
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
  // 148 — Sheep Flock Register — Flocks are Registered in Livestock → Herds & Animals
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
  // 149 — Sheep Tupping Records — Ram Selection, Service Dates and Scanning Expectation
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
  // 150 — Sheep Scanning Records — Pregnancy Scanning, Litter Sizes and Expected Lambing
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
  // 151 — Sheep Weigh-in and DLWG — Performance Recording and Target Tracking
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
  // 152 — Sheep Shearing Records — Fleece Weight, Contractor Details and BWMB Traceability
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
  // 153 — Red Tractor Sheep Assurance Checklist — Preparing for an Assessor Visit
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
  // 154 — Beef Production Module — Overview and Getting Started
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
  // 155 — Beef Weigh-in and DLWG Records — Tracking Growth Performance
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
  // 156 — Beef Finishing Records — Entry Weight, Exit Weight and Deadweight Settlement
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
  // 157 — Beef Body Condition Scoring — Recording and Monitoring BCS on the 1–5 Scale
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
  // 158 — Medicated Feed Withdrawal Tracking — Recording Active Ingredients and Clearance Dates
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
  // 159 — Grain Drying Records — Logging Drying Events, Moisture Reduction and Costs
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
  // 160 — Grain Quality Tests — Mycotoxin, Pesticide Residue, Specific Weight and Conditioning
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
  // 161 — Training Competency Matrix — Staff × Certificate Traffic-Light Compliance View
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
  // 162 — Red Tractor Audit Pack Generator — Assembling Evidence Packs for Assessor Visits
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
  // 163 — NVZ Closed Period Automation — Countdown Widgets and Application Budget Remaining
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
  // 164 — Carbon Auto-Calculator — DEFRA 2023 Emission Factors and Scope 1, 2 and 3 Calculations
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
  // 165 — Crop Rotation Planner — Field × Year Grid, OSR Interval Warnings and Sequence Planning
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
  // 166 — Labour Management — Setup Order, Rota, Timesheet Submission & Approval Workflow
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
  // 167 — Labour Management — Timesheet Approval, SMS Notifications & Submission Status Grid
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
  // 168 — Labour Management — Mobile Leave Requests, Pending Approval Panel & SMS Notifications
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
  // 169 — Labour Management — Holiday Planner, Conflict Detection and Month-by-Month Calendar View
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
  // 170 — Labour Management — Printable Blank Leave Request Form (FT-LR-01) and Paper Submission Workflow
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
  // 171 — Labour Management — Actual Attendance Recording, Discrepancy Flags and Bradford Factor Sickness Analysis
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
  // 172 — Labour Management — Department Grouping and Colour-Coded Section Headers Across All Six Tabs
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
  // 173 — Labour Cross-Reference — Comparing Timesheet Hours Against Field Operations Records
  // 169 — Labour Cross-Reference — Comparing Timesheet Hours Against Field Operations Records
  [
    "How to use the Labour Cross-Reference tab in BDE Farm Trac to compare timesheet hours against field operations hours and annotate discrepancies.",
    `<h2>Labour Cross-Reference — Comparing Timesheet Hours Against Field Operations Records</h2>
<p>Red Tractor requires farms to cross-check labour records against operational records and to demonstrate that discrepancies have been investigated and documented. The Labour Cross-Reference tab in Labour Management provides this comparison automatically for every staff member across any calendar month.</p>
<h3>Where to find it</h3>
<p>Navigate to <strong>Staff &amp; Training → Labour Management</strong> and click the <strong>Cross-Reference</strong> tab. Use the month and year selectors at the top of the page to choose the period you want to review.</p>
<h3>What the table shows</h3>
<p>Each row in the cross-reference table represents one staff member active in the selected period. Columns show:</p>
<ul>
<li><strong>Timesheet Hours</strong> — the total hours logged in that person's approved timesheets for the period.</li>
<li><strong>Field Operations Hours</strong> — the total hours attributed to that person in Field Operations records (spray applications, cultivations, planting, harvesting) for the same period.</li>
<li><strong>Variance</strong> — the arithmetic difference (Timesheet minus Field Operations hours).</li>
<li><strong>Status badge</strong> — colour-coded: <span style="color:#16a34a">Matching</span> (green, difference within tolerance), <span style="color:#d97706">Over-Reported</span> (amber, timesheet hours significantly exceed field operations), or <span style="color:#dc2626">Under-Reported</span> (red, field operations hours significantly exceed timesheets).</li>
</ul>
<h3>Adding an annotation</h3>
<p>For any row showing a discrepancy, click the annotation icon on the right of the row to open the Annotation dialog. Add a free-text note explaining the discrepancy — for example, "Contractor hours not yet entered in Field Ops" or "Overtime on maintenance tasks not in Field Ops scope." Then mark the discrepancy as <strong>Explained</strong> (you have a recorded reason) or <strong>Resolved</strong> (underlying records have been corrected). Save the annotation. The row then displays a coloured badge (<strong>Explained</strong> or <strong>Resolved</strong>) alongside a preview of your note, so any reviewer can immediately see that the gap has been considered.</p>
<h3>Why this matters</h3>
<p>Red Tractor assessors look for evidence that farms actively monitor the consistency of their labour records. An unexplained gap between timesheet hours and field operations records is a potential compliance finding. The Labour Cross-Reference tab, together with its annotation audit trail, provides a single place to demonstrate that any discrepancy has been identified, investigated, and either explained or corrected — without requiring additional spreadsheets or manual reconciliation reports.</p>`,
  ],
  // 174 — Livestock Deadweight Sales — Linking Kill Sheets to Off-Farm Movement Records (BCMS Audit Trail)
  // 170 — Livestock Deadweight Sales — Linking Kill Sheets to Off-Farm Movement Records (BCMS Audit Trail)
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
  // 175 — Livestock Mart / Auction Sales — Linking Sale Records to Off-Farm Movement Records (LIS Audit Trail)
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
  // 176 — TB Test to Movement Record Linkage — APHA Pre-Movement Testing Evidence and Cross-Compliance
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
  // 177 — Grain Sale Call-Off to Forward Contract Linkage — Traceability from Merchant Contract to Weighbridge
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
  // 178 — Benchmarking Panels — AHDB and Andersons Performance Comparisons
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
  // 179 — NVZ Budget Calculator — Per-Field Nitrogen Budget vs DEFRA Field Limit
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
  // 180 — Multi-Farm Consolidated Dashboard — Group Compliance Overview Across Holdings
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
  // 181 — Settlement Notes — Recording Grain and Livestock Settlement Documents
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
  // 182 — Inspector Mode — Advisor Portal Filtered Compliance View
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
  // 183 — Smart Date Validation — How Date Fields Work Across the Platform
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
  // 184 — Staff Auto-Populate — Operator and Assessor Fields Pre-Fill from Your Login
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
  // 185 — Viticulture Module Overview — Vine Register, Blocks, Phenology, Operations, Harvest & Scouting
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
  // 186 — Vine Register — UK Variety and Rootstock Selects, Removal Status and Audit Trail
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
  // 187 — Vineyard Block Management — Permanent Block Sites, Active Planting Lifecycle (Active, Suspended, Removed), Retire and Replant Workflows, and Full Planting History per Block
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
  // 188 — BBCH Phenology Records — Growth Stage Observation Log and Season Comparison
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
  // 189 — Canopy & Pruning Operations — Operation Types, Pruning Systems and Bud Count Records
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
  // 190 — Harvest Records — Yield, Must Chemistry (Brix, pH, TA, Potential Alcohol) and Botrytis Flag
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
  // 191 — Disease & Pest Scouting — Pressure Ratings, Xylella and Phytophthora Notifiable Organism Flags
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
  // 192 — Viticulture Mobile Screens — Vine Scouting, Phenology, Operations and Harvest with Active Block Picker
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
  // 193 — Winery Licensing — Premises Licence, Personal Licence, DPS and Expiry Status Records
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
  // 194 — Winery Excise & Duty Returns — HMRC Wine Duty Register, Payment Status and Return Period Tracking
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
  // 195 — Winery Tastings & Tours — Cellar Door Event Register, Attendee Counts and Session Revenue
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
  // 196 — Winery Age Verification (Challenge 25) — ID Check Register, Outcome Log and Compliance Audit Trail
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
  // 197 — Wine Production — SO₂ Compliance, Additive Records and Organic Wine Certification per Vintage
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
  // Winery Stock — Consumable Ledger for Bottles, Corks, Barrels, Fining Agents and SO₂ Products
  [
    "How to track winery consumables in BDE Farm Trac's Winery Stock tab — bottles, corks, barrels, fining agents and SO₂ products — with deliveries, usage, stocktakes and a running balance.",
    `<h2>Winery Stock — Consumable Ledger for Bottles, Corks, Barrels, Fining Agents and SO₂ Products</h2>
<p>The Winery Stock tab in the Viticulture module provides a dedicated stock ledger for winery consumables — items specific to wine production that are not covered by the general Sprays &amp; Inputs or Stock &amp; Suppliers modules. Track bottles, corks, fining agents, SO₂ products, and everything else needed in the winery from delivery through to end-of-vintage stocktake.</p>
<h3>Adding stock items</h3>
<p>Navigate to <strong>Viticulture → Winery Stock</strong> and click <strong>Add Item</strong>. For each item record:</p>
<ul>
<li><strong>Item name</strong> — describe the specific product (e.g. Sauvignon Blanc Bottles 75cl, Cork #8 Natural, Potassium Metabisulphite).</li>
<li><strong>Category</strong> — choose from Bottles, Corks &amp; Stoppers, Capsules &amp; Closures, Labels, Barrels &amp; Oak, Fining Agents, SO₂ &amp; Preservatives, Yeast &amp; Nutrients, Packaging &amp; Cases, or Other.</li>
<li><strong>Unit</strong> — units, bottles, cases (12), cases (6), kg, g, L, mL, or sheets.</li>
<li><strong>Low stock alert</strong> (optional) — the item displays a Low stock badge when the running balance reaches or falls below this value.</li>
<li><strong>Notes</strong> (optional).</li>
</ul>
<h3>Recording movements</h3>
<p>Click <strong>+ Movement</strong> on any item row to open the movement dialog. Five movement types are available:</p>
<ul>
<li><strong>Delivery / Received</strong> — stock arriving from a supplier. Enter the quantity, supplier name, and optional cost per unit. Added to the running balance.</li>
<li><strong>Used in Production</strong> — stock consumed during winemaking. Enter the quantity used and an optional reference (e.g. vintage year or batch). Deducted from the running balance.</li>
<li><strong>Write-off / Wastage</strong> — broken items, spillage, or other losses, recorded separately from production usage for a clean audit trail.</li>
<li><strong>Stocktake (Actual Count)</strong> — enter the physical count from a stocktake; the system automatically calculates and applies the adjustment delta (actual minus recorded balance) so you do not need to compute the difference manually.</li>
<li><strong>Manual Adjustment</strong> — any other signed correction, positive or negative.</li>
</ul>
<h3>Running balance and history</h3>
<p>The main table shows the current balance for each item — updated immediately after each movement. Click the history icon (eye symbol) on any item row to open the movement history dialog, which lists every movement in chronological order with the running balance after each entry. Individual movements can be deleted if recorded in error; the running balance recalculates automatically.</p>
<h3>Low stock alerts</h3>
<p>When a stock item's balance falls to or below its configured threshold, a Low stock badge appears on the row and the row is highlighted amber — a prompt to reorder before production is interrupted.</p>
<h3>Shared with Organic Viticulture</h3>
<p>The Winery Stock tab is shared between the standard Viticulture module and the Organic Viticulture module. Items and movements added from either page are visible from both.</p>`,
  ],
  // 198 — Organic Livestock — Feed Records Log, Date Defaults & Species-Filtered Herd Selector
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
  // 199 — Organic Livestock — Feed Derogations: Case Management, Correspondence Log & Document Storage
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
<h3>Rejection handling</h3>
<p>When a certifier issues a rejection, the Record Decision form captures the <strong>Rejection Reason</strong> (the certifier's stated grounds), the <strong>Rejection Reference</strong> (the certifier's correspondence reference), and a <strong>Corrective Action</strong> field for recording the steps taken in response — for example, sourcing a certified organic alternative, varying the ration, or preparing a new application with additional evidence. Until a corrective action is recorded, the case card displays an <strong>Action Required</strong> badge to ensure rejected cases are not left unresolved. The mobile app viewer mirrors this badge so field staff are aware of open action items.</p>
<h3>Internal decision date</h3>
<p>The Record Decision form includes an <strong>Internal Decision Date</strong> — the date your farm team noted or processed the certifier's decision, which may differ from the certifier's official decision date. Recording both dates provides a complete internal/external decision timeline for audit purposes.</p>
<h3>Document storage</h3>
<p>Attach the availability search evidence, application submission, and approval/refusal letter to the case. All documents are stored permanently in the case record and can be retrieved instantly for an annual inspection.</p>`,
  ],
  // 200 — Organic Livestock — Outdoor Access Log, Herd Register Cascade & Compliance Status
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
  // 201 — Organic Dairy — Milk Collection Records, Feed Records & Daily Date Defaults
  // 196 — Organic Dairy — Milk Collection Records, ABR Testing, Buyer Lab Results & Retest Linkage
  [
    "How milk collection records work in BDE Farm Trac's Organic Dairy module, including ABR testing, temperature recording, buyer lab results, and retest linkage.",
    `<h2>Organic Dairy — Milk Collection Records, ABR Testing, Buyer Lab Results & Retest Linkage</h2>
<p>The Organic Dairy module provides comprehensive milk collection records for organic dairy herds. The add and edit form is split into three tabs to keep related fields grouped and reduce scrolling during data entry.</p>
<h3>Daily date defaults</h3>
<p>The Collection Date field defaults to today whenever you open a new milk collection form. For dairy farms entering records at the time of each uplift, no date change is needed — enter the collection details and save. To record a historical collection, overtype the date before saving.</p>
<h3>Tab 1 — Collection Details</h3>
<p>Navigate to <strong>Organic → Dairy → Milk Collections</strong> and click <strong>New Collection</strong>. The Collection Details tab captures:</p>
<ul>
<li><strong>Collection Date</strong> (defaults to today), Volume (litres), Collector / Milk Buyer, Vehicle Registration, Processor Ref, Collection Docket / Slip Ref.</li>
<li><strong>Organic certified flag</strong> — toggle off if this collection is non-organic (e.g. antibiotic withdrawal period); a Reason field appears when unchecked.</li>
<li><strong>Deductions (pence) and Net Value (pence)</strong> — for recording the tanker driver's docket deductions and the net payment amount.</li>
<li><strong>Witnessed By</strong> — name of the farm staff member present at collection.</li>
<li><strong>Recorded By / Notes</strong>.</li>
</ul>
<h3>Tab 2 — Quality & ABR</h3>
<p>The Quality &amp; ABR tab records the on-farm quality measurements and antibiotic residue test:</p>
<ul>
<li><strong>Milk Temperature (°C)</strong> — the temperature of the milk at the point of collection; record who tested it in the Temp Tested By field.</li>
<li><strong>Fat %, Protein %, Lactose %</strong> — on-farm compositional measurements.</li>
<li><strong>SCC (000s/mL) and TBC (000s/mL)</strong> — somatic cell count and total bacterial count from the on-farm reading.</li>
<li><strong>ABR Test Result</strong> — four-state result: Negative, Positive, Borderline, or Invalid. A colour-coded badge (green / red / amber / grey) is displayed on every row in the Milk Collections table for an instant at-a-glance compliance view without opening individual records.</li>
<li><strong>ABR Tested By</strong>, <strong>ABR Kit Lot</strong>, and <strong>ABR Kit Batch</strong> — for full traceability of the test kit used.</li>
</ul>
<h3>Tab 3 — Buyer Lab Results</h3>
<p>The Buyer Lab Results tab holds the independent quality analysis returned by the milk processor or buyer — typically available a few days after the collection:</p>
<ul>
<li><strong>Status</strong> — Pending (awaiting results), Received (results in), or Failed (buyer rejected the collection).</li>
<li><strong>Result Date and Buyer Lab Reference</strong>.</li>
<li><strong>Buyer SCC, Buyer TBC, Buyer Fat %, Buyer Protein %, Buyer Lactose %</strong> — the processor's returned figures, sitting alongside the on-farm readings for direct comparison.</li>
</ul>
<h3>Retest linkage</h3>
<p>If an initial ABR result is borderline or positive and a confirmatory retest is required before the collection is accepted, record the retest as a new collection entry. Toggle on <strong>This is a retest</strong> and use the <strong>Retest of</strong> picker to select the original collection that prompted the retest. The link is stored permanently, giving certifiers and your milk buyer a clear audit trail connecting the original and confirmatory results.</p>
<h3>Feed records</h3>
<p>Navigate to <strong>Organic → Dairy → Feed Records</strong>. Each feed record logs the date or date range, the herd (selected from the organic cattle herd list), and the ration composition. Each component is entered with its feed type (forage, concentrate, mineral), organic status (Certified Organic, In Conversion, Conventional — within the 10% allowance), and dry matter percentage. The organic DM proportion is calculated automatically. Records where conventional inclusion exceeds the permitted level are flagged for review and certifier notification.</p>
<h3>Document attachments</h3>
<p>The full view dialog for any Milk Collection record includes a RecordAttachments panel. Attach PDFs, photos, or documents — for example a copy of the collection docket, an ABR test printout, or the buyer's lab results letter — directly to the record. Attachments are stored permanently in secure cloud storage and accessible instantly during certifier inspection. The same attachment capability is available on Herd Conversion records and Feed &amp; Nutrition records.</p>`,
  ],
  // 202 — Organic Fresh Produce — Input Log, Supplier Lookup, Applied-By Staff & Date Defaults
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
  // 203 — Organic Fresh Produce — Input Derogations: Case Register, Correspondence Log & Document Storage
  // 198 — Organic Fresh Produce — Input Derogations: Case Register, Correspondence Log & Document Storage
  [
    "How to manage organic fresh produce input derogation cases in BDE Farm Trac, including case workflow, correspondence, and document storage.",
    `<h2>Organic Fresh Produce — Input Derogations: Case Register, Correspondence Log & Document Storage</h2>
<p>When a permitted organic input for a specific application is genuinely unavailable, organic fresh produce growers can apply to their certifier for an input derogation. BDE Farm Trac provides the same full derogation case management workflow for fresh produce as for livestock and viticulture — a split New Case / Record Decision workflow with a correspondence log and document storage.</p>
<h3>New case workflow</h3>
<p>Navigate to <strong>Organic → Fresh Produce → Input Derogations</strong> and click <strong>New Case</strong>. The new case form captures the input name, input type, crop it is required for, regulatory basis, certifying body, availability search date and reference, application date, and justification. On saving, the case is created at Pending status with no decision fields — the decision is recorded separately when received.</p>
<h3>Record decision workflow</h3>
<p>When the certifier issues their decision, open the case card and click <strong>Record Decision</strong>. Enter the decision date, outcome, expiry date (for approvals), and any approval conditions. The case status updates and an expiry urgency badge appears at 90 and 30 days before the approval expires, prompting renewal or a return to permitted organic sources.</p>
<h3>Rejection handling</h3>
<p>When a certifier rejects an input derogation application, the Record Decision form captures the <strong>Rejection Reason</strong>, the <strong>Rejection Reference</strong>, and a <strong>Corrective Action</strong> field for recording the farm's response — sourcing a permitted alternative, modifying the treatment approach, or preparing a revised application with additional evidence. Until a corrective action is recorded, the case card shows an <strong>Action Required</strong> badge. This ensures rejected cases are flagged for resolution and not overlooked during the growing season. The mobile app viewer mirrors the same badge so field teams can see open action items without logging into the dashboard.</p>
<h3>Internal decision date</h3>
<p>An <strong>Internal Decision Date</strong> field in the Record Decision form records the date the farm team noted or processed the decision — which may differ from the certifier's official decision date. Both dates are stored on the case record for a complete decision timeline.</p>
<h3>Correspondence log and documents</h3>
<p>Expand any case card to view and add correspondence entries. Attach availability search evidence, application submissions, and certifier decision letters directly to the case record. The complete case file — application, correspondence, and decision — is permanently stored and instantly retrievable for annual certification inspection.</p>`,
  ],
  // 204 — Organic Dairy — Feed Derogation Case Linking in Feed & Nutrition Records
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
  // 205 — Mobile App — FP Input Derogation Register: Viewing Cases and Logging Derogation-Required Inputs
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
  // 206 — Mobile App — Organic Farming Quick Capture: Herd Lookup, Outdoor Access & Treatment Recording
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
  // 207 — Organic Viticulture — Block Conversion Register: 3-Year Conversion Tracking and Certifying Body Records
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
  // 208 — Organic Viticulture — Organic Input Log: Approved Products, Approval Status and Certifier References
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
  // 209 — Organic Viticulture — Copper Register: Application Log and Running 28 kg Per 7-Year Limit Tracker
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
  // 210 — Organic Viticulture — Input Derogations: Case Register, Correspondence Log and Availability Evidence
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
<p>When a decision is received, click <strong>Record Decision</strong> on the case card. Enter the <strong>Internal Decision Date</strong> (when your farm team noted the decision), the official <strong>Decision Date</strong>, and the outcome (Approved, Refused, Withdrawn, or Expired). For approved cases, enter the expiry date and any approval conditions. Expiry urgency badges appear at 90 and 30 days before the approval expires, prompting renewal before the current season's application needs arise.</p>
<h3>Refusal handling</h3>
<p>When a certifier refuses an application, the Record Decision form captures the <strong>Refusal Reason</strong> (the certifier's stated grounds), the <strong>Refusal Reference</strong> (the certifier's correspondence reference), and a <strong>Corrective Action</strong> field for documenting the farm's response — sourcing a permitted alternative, amending the treatment programme, or submitting a revised application with additional evidence. Until a corrective action is recorded, the case card displays an <strong>Action Required</strong> badge to ensure refused applications do not remain unresolved. The mobile app viewer mirrors this badge so field teams see open items without logging into the dashboard.</p>`,
  ],
  // 211 — Organic Viticulture — Wine Production Additives: SO2 Compliance, Additive Records and Organic Certification (Shared with Standard Viticulture)
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
  // 212 — Organic Viticulture — Certificates: Vineyard and Wine Organic Certificate Register
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
  // Organic Viticulture — Winery Stock: Consumable Ledger Shared with Standard Viticulture
  [
    "How the Winery Stock tab in Organic Viticulture works and how it shares data with the standard Viticulture module for tracking permitted fining agents, SO₂ products and winery consumables.",
    `<h2>Organic Viticulture — Winery Stock: Consumable Ledger Shared with Standard Viticulture</h2>
<p>The Winery Stock tab in the Organic Viticulture module is identical to the Winery Stock tab in the standard Viticulture module — it is the same tab, showing the same data. Any items or movements recorded from Organic Viticulture are immediately visible from the Viticulture page and vice versa. Organic wine producers do not need to switch between modules to maintain their consumable ledger.</p>
<h3>Relevant categories for organic winemakers</h3>
<p>The following stock categories are particularly relevant for organic wine production compliance:</p>
<ul>
<li><strong>Fining Agents</strong> — track bentonite, plant-based protein alternatives, and any other permitted fining agents. For organic wine, only fining agents permitted under UK-retained EU Regulation 203/2012 and your certifier's approved input list may be used. Maintaining a stock record creates a clear audit trail of what was ordered, when it was received, and how much was consumed per vintage.</li>
<li><strong>SO₂ &amp; Preservatives</strong> — log potassium metabisulphite and other sulphite additions. Combined with the Wine Production tab's SO₂ compliance records, the Winery Stock ledger provides both the stock-level view (how much was ordered and used in total) and the product-level view (what was added to each wine at what concentration).</li>
<li><strong>Yeast &amp; Nutrients</strong> — track approved commercial yeast strains and yeast nutrients. Only permitted strains may be used in certified organic wine.</li>
<li><strong>Barrels &amp; Oak</strong> — log barrel deliveries and disposals; useful for tracing barrel source if your certifier requires evidence that barrels were not treated with prohibited substances.</li>
</ul>
<h3>Winery Stock alongside Wine Production Additives</h3>
<p>The Winery Stock tab and the Wine Production Additives tab serve different but complementary purposes. Winery Stock records the quantity of consumables held and consumed — it is a stock ledger. Wine Production Additives records how much of a specific additive was used in a specific vintage and at what concentration — it is a production and compliance record. Together they provide a complete picture: you can confirm that the fining agent used in a vintage was drawn from a known stock batch, and that the quantity applied was within your certified permitted input levels.</p>
<h3>Recording movements</h3>
<p>All movement recording (deliveries, usage, write-offs, stocktakes and adjustments) works identically to the standard Viticulture Winery Stock tab. See the <strong>Winery Stock — Consumable Ledger</strong> help article for full recording instructions.</p>`,
  ],
  // 213 — Mobile App — Organic Viticulture Derogation Register: Viewing Input Derogation Cases in the Field
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
  // 214 — Organic Livestock — Full Livestock Tab Access: Herds & Flocks, Animals, Vet Health Plans, Mortality, TB Tests and More
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
  // 215 — Organic Fresh Produce — Full Fresh Produce Tab Access: Crops, Water Tests, Harvest, Intake, Packhouse and Allergens
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
  // 216 — Organic Arable — Certification Tab and Field Conversion Tracker
  // 211 — Organic Arable — Certification Tab and Field Conversion Tracker
  [
    "How to record organic arable certification status, certifying body details, and per-field conversion tracking with progress bars in BDE Farm Trac.",
    `<h2>Organic Arable — Certification Tab and Field Conversion Tracker</h2>
<p>The Organic Arable module in BDE Farm Trac provides a complete audit trail for organic arable holdings — from the holding's overall certification status down to the per-field conversion history required by UK Organic Regulations 2020 and your certifying body.</p>
<h3>Certification Tab</h3>
<p>Navigate to <strong>Organic Arable → Certification</strong> to record the holding-level certification card:</p>
<ul>
<li><strong>Certifying body:</strong> Soil Association, OF&amp;G, Organic Farmers &amp; Growers, Biodynamic, or other (free text).</li>
<li><strong>Certificate number and operator number:</strong> as shown on the certificate issued by your certifying body.</li>
<li><strong>Certification date and next renewal date:</strong> amber and red alerts surface in advance of the renewal date so it is never missed.</li>
<li><strong>Status:</strong> In Conversion / Certified / Suspended / Withdrawn — displayed as a colour-coded badge on the certification card.</li>
<li><strong>Parallel production flag:</strong> tick if the holding runs both organic and non-organic arable on the same unit. An amber compliance notice appears citing the UK Organic Regulations 2020 requirement for prior written certifier approval and the annual notification obligation. Record the certifier's written approval against the certification record and attach a scanned copy.</li>
</ul>
<p>Click the paperclip icon on any certification record to attach scanned certificates, certifier correspondence, or outcome letters directly to the record.</p>
<h3>Field Conversion Tracker</h3>
<p>Navigate to <strong>Organic Arable → Field Conversion</strong>. Each row represents a single field's conversion record:</p>
<ul>
<li><strong>Field:</strong> selected from your registered field list using the FieldSelector picker (type to filter by field name or number; switch to free text if the field is not yet registered).</li>
<li><strong>Conversion start date:</strong> the date on which the statutory two-year conversion period began for this field.</li>
<li><strong>Expected certification date:</strong> auto-calculated as two years from conversion start; override if the certifying body has confirmed a different date.</li>
<li><strong>Actual certification date:</strong> fill in once the certifying body confirms the field is fully certified organic.</li>
<li><strong>Previous land use:</strong> what the field was used for immediately before conversion — required by certifiers to assess the pre-conversion status of the land.</li>
<li><strong>Status:</strong> In Conversion / Certified / Suspended / Withdrawn.</li>
</ul>
<p>A visual progress bar on each field conversion record shows the percentage through the statutory conversion period, with a days-remaining countdown. Conversion records follow the view-before-edit pattern: click a row to open the structured view dialog; click Edit within the dialog to modify the record. Attach certifier confirmation letters directly to each field conversion record using RecordAttachments within the view dialog.</p>
<h3>Reporting</h3>
<p>The Print Register button on the Field Conversion tab generates a formatted A4 landscape report of all field conversion records, suitable for presentation to your certifying body at an annual inspection. The Export CSV button exports all records with the current filter applied.</p>`,
  ],
  // 217 — Organic Arable — Seed Sourcing Register and Derogation Approval Flow
  // 212 — Organic Arable — Seed Sourcing Register and Derogation Approval Flow
  [
    "How to record organic arable seed sourcing, certified organic seed status, and the derogation approval flow when no certified organic equivalent is available.",
    `<h2>Organic Arable — Seed Sourcing Register and Derogation Approval Flow</h2>
<p>Under UK Organic Regulations 2020, organic arable producers must use certified organic seed wherever it is commercially available. Where no certified organic equivalent can be sourced, a seed derogation is required from your certifying body before untreated conventional seed may be used. BDE Farm Trac's Seed Sourcing register records all seed purchases alongside their organic status and manages the derogation approval evidence trail.</p>
<h3>Recording a Seed Purchase</h3>
<p>Navigate to <strong>Organic Arable → Seed Sourcing</strong> and click <strong>Add Seed Record</strong>. Complete the following fields:</p>
<ul>
<li><strong>Crop:</strong> selected from your registered commodity types.</li>
<li><strong>Variety:</strong> variety name; auto-filtered by the selected crop where variety data is available.</li>
<li><strong>Seed lot number:</strong> the batch or lot number from the seed label — essential for traceability back to the supplier batch if a recall or quality query arises.</li>
<li><strong>Certified organic seed:</strong> tick if the seed is certified organic (carrying an organic seed certificate from an accredited certifying body). If ticked, no further approval fields are required.</li>
<li><strong>Treatment status:</strong> Untreated / Heat Treated / Derogation Approved — only Untreated or Heat Treated seed may be used without a derogation; if you are using treated conventional seed a derogation is required regardless of organic status.</li>
<li><strong>Supplier, quantity, area drilled (ha), and drilling date.</strong></li>
</ul>
<h3>Derogation Approval Flow</h3>
<p>When <strong>Treatment status: Derogation Approved</strong> is selected, two additional fields appear and an amber advisory panel is displayed:</p>
<blockquote><em>"Organic seed derogation required — you must verify that no certified organic equivalent is commercially available (OFAS/UKOAS search) before applying for derogation from your certifying body."</em></blockquote>
<ul>
<li><strong>Certifier approval reference:</strong> the reference number of the written approval issued by your certifying body for this derogation. Required — the record cannot be saved without it once Derogation Approved is selected.</li>
<li><strong>Derogation expiry date:</strong> the date until which the approval is valid. Records with an expiry date within 30 days display an amber urgency badge; expired records display a red badge.</li>
</ul>
<p>Attach the certifier's derogation approval letter and the OFAS/UKOAS availability search evidence directly to the seed record using RecordAttachments within the view dialog.</p>
<h3>Filtering and Reporting</h3>
<p>The Seed Sourcing tab has FilterPills for Certified Organic, Untreated, Heat Treated, and Derogation Approved status, plus a crop-year selector. The Print Register generates a formatted A4 report of all seed records for certifier inspection; Export CSV exports the current filtered view.</p>`,
  ],
  // 218 — Organic Arable — Input Log: Annex II Approved Substances and Restricted Input Workflow
  // 213 — Organic Arable — Input Log: Annex II Approved Substances and Restricted Input Workflow
  [
    "How to record organic arable inputs using the Annex II SubstancePicker, manage Permitted and Restricted status, and capture certifier approval for restricted inputs.",
    `<h2>Organic Arable — Input Log: Annex II Approved Substances and Restricted Input Workflow</h2>
<p>Organic arable production is governed by UK Organic Regulations 2020 (retained EU Reg 834/2007 and 889/2008 as amended). Only substances listed in Annex II may be used on organic arable land. BDE Farm Trac's Input Log provides a searchable list of 33 Annex II approved inputs and manages the mandatory certifier approval trail for any restricted substance.</p>
<h3>Logging an Input Application</h3>
<p>Navigate to <strong>Organic Arable → Input Log</strong> and click <strong>Add Input</strong>. Complete the form:</p>
<ul>
<li><strong>Substance name:</strong> select from the SubstancePicker — a searchable list of 33 Annex II approved inputs across all categories (plant protection products, fertilisers and soil conditioners, pest control agents, cleaning agents). If the substance you need is not listed, switch the picker to free-text entry and record the name manually.</li>
<li><strong>Input category:</strong> auto-populated from the selected substance; edit if entering free text.</li>
<li><strong>Permitted status:</strong> Permitted / Restricted / Derogation Required — assigned automatically from the SubstancePicker selection; override if needed for free-text entries.</li>
<li><strong>Field:</strong> FieldSelector picker (filtered from your registered field list).</li>
<li><strong>Crop, application date, quantity, unit, area applied (ha), and applied by.</strong></li>
</ul>
<h3>Restricted Input Workflow</h3>
<p>When <strong>Permitted status: Restricted</strong> or <strong>Derogation Required</strong> is selected, an amber advisory panel appears:</p>
<blockquote><em>"Restricted input — certifier approval is required before application. Record the certifier approval reference and confirm the certifier has been notified."</em></blockquote>
<p>Two additional fields become mandatory:</p>
<ul>
<li><strong>Certifier approval reference:</strong> the written approval reference from your certifying body — required before the record can be saved.</li>
<li><strong>Certifier notified:</strong> a checkbox confirming the certifier has been informed of the application. Records where this box is unticked display an amber "Certifier not yet notified" badge in the table and view dialog, prompting follow-up.</li>
</ul>
<p>Attach the certifier's written approval, any supporting technical justification, and label instructions directly to the input record using RecordAttachments within the view dialog.</p>
<h3>Filtering and Reporting</h3>
<p>FilterPills above the table show live record counts by permitted status. Combine with the year and crop dropdowns to narrow the view for a specific inspection period. Print Register and Export CSV apply the active filter to the output.</p>`,
  ],
  // 219 — Organic Arable — Harvest Declarations and Buyer Declaration Record
  // 214 — Organic Arable — Harvest Declarations and Buyer Declaration Record
  [
    "How to record organic arable harvest events and attach a separate buyer declaration from within the harvest view dialog in BDE Farm Trac.",
    `<h2>Organic Arable — Harvest Declarations and Buyer Declaration Record</h2>
<p>Organic arable producers must be able to demonstrate the organic provenance of grain and combinable crops at every point in the supply chain — from the field through to the first buyer. BDE Farm Trac records the harvest event and the buyer declaration separately, keeping agronomic harvest data and commercial buyer information cleanly partitioned while linking both to the same crop and field record.</p>
<h3>Recording a Harvest Event</h3>
<p>Navigate to <strong>Organic Arable → Harvest Declarations</strong> and click <strong>Add Harvest</strong>:</p>
<ul>
<li><strong>Crop and variety:</strong> from registered commodity types and associated variety data.</li>
<li><strong>Field:</strong> FieldSelector picker from your registered field list.</li>
<li><strong>Harvest date, yield (t/ha), total yield (t), moisture (%), and grade.</strong></li>
<li><strong>Organic certified:</strong> flag confirming the crop was harvested from land with current organic certification — a certifier harvest reference field appears when this is ticked.</li>
<li><strong>Storage destination:</strong> where the grain was placed at harvest — grain store name or merchant position.</li>
</ul>
<p>Click any row to open the view dialog. From within the view dialog, the <strong>Add / View Buyer Declaration</strong> button opens a second dialog for the buyer record.</p>
<h3>Buyer Declaration</h3>
<p>The Buyer Declaration dialog captures the commercial transaction details separately from the harvest record:</p>
<ul>
<li><strong>Buyer name and buyer address.</strong></li>
<li><strong>Buyer certifier reference:</strong> the organic certification reference of the first buyer — required for the organic supply chain audit trail.</li>
<li><strong>Declared quantity (t):</strong> the tonnage covered by this declaration (may differ from total harvest if grain is sold in tranches).</li>
<li><strong>Declaration date.</strong></li>
<li><strong>Transport and identity preservation notes:</strong> any segregation or transport conditions applying to this load.</li>
</ul>
<p>Both the harvest record and the buyer declaration support document attachments via RecordAttachments — attach weighbridge tickets, dispatch notes, identity preservation declarations, and buyer certifier correspondence directly to each record.</p>
<h3>Filtering and Reporting</h3>
<p>Filter by crop year, crop type, and organic certified status using the dropdowns and FilterPills. Print Register generates an A4 landscape harvest register; Export CSV exports the filtered harvest records.</p>`,
  ],
  // 220 — Mobile App — Organic Arable: Input, Seed, and Harvest Recording
  // 215 — Mobile App — Organic Arable: Input, Seed, and Harvest Recording
  [
    "How to record organic arable inputs, seed sourcing, and harvest declarations offline in the BDE Farm Trac mobile app.",
    `<h2>Mobile App — Organic Arable: Input, Seed, and Harvest Recording</h2>
<p>The BDE Farm Trac mobile app provides four dedicated screens for organic arable recording. All three field screens (Input Recording, Seed Sourcing, Harvest Recording) save locally when offline and sync to the dashboard automatically when network connectivity is restored — essential for in-field use where signal is intermittent.</p>
<h3>Overview Screen</h3>
<p>The Organic Arable hub screen displays a summary of your certification status and live counts pulled from the API (field conversions in progress, input records this season, seed records this season, harvest declarations). Quick-action buttons navigate directly to each of the three field recording screens without going back through the menu.</p>
<h3>Input Recording</h3>
<p>The Input Recording screen allows you to log an approved organic input in the field:</p>
<ul>
<li>Select the <strong>permitted status</strong> using chips: Permitted (green) / Restricted (amber) / Derogation Required (red). Selecting Restricted or Derogation Required displays an amber advisory and makes the Certifier Approval Reference field mandatory before saving.</li>
<li><strong>FieldPicker</strong> loads your registered fields from the last successful API sync; falls back to free text when offline.</li>
<li>Enter substance name, quantity, unit, area (ha), crop, and applied-by name.</li>
<li>For restricted inputs: enter the certifier approval reference and confirm the certifier has been notified using the toggle.</li>
</ul>
<h3>Seed Sourcing</h3>
<p>The Seed Sourcing screen records a seed purchase on the go:</p>
<ul>
<li>Select the crop using a chip picker (loaded from the last API sync).</li>
<li>Enter variety, seed lot number, supplier, quantity, area, and drilling date.</li>
<li>Toggle <strong>Certified Organic Seed</strong> on or off. If off, select treatment status from chips: Untreated / Heat Treated / Derogation Approved.</li>
<li>When Derogation Approved is selected, an amber advisory appears and the Certifier Approval Reference field becomes required.</li>
</ul>
<h3>Harvest Recording</h3>
<p>The Harvest Recording screen captures a harvest event from the combine cab or grain store:</p>
<ul>
<li>Select the <strong>organic certified</strong> status using chips (Certified Organic / Conventional). Selecting Certified Organic displays the Certifier Harvest Reference field.</li>
<li><strong>FieldPicker</strong> for field selection (with offline free-text fallback).</li>
<li>Enter crop, variety, harvest date, yield (t/ha), total yield (t), moisture (%), and grade.</li>
</ul>
<p>All records created offline are queued in local device storage (AsyncStorage) and uploaded to the API automatically on the next successful connection. The sync badge on the Overview screen shows the number of unsynced records outstanding.</p>`,
  ],
  // 221 — Organic Viticulture — Full Viticulture Tab Access: Vine Register, Block Lifecycle, Phenology, Pruning & Canopy, Harvest, Disease Scouting and Winery Compliance (Licensing, Excise & Duty, Tastings & Tours, Age Verification, Wine Production)
  // 216 — Organic Viticulture — Full Viticulture Tab Access
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
</ul>
<h3>Winery Stock (shared with standard Viticulture)</h3>
<ul>
<li>Consumable ledger for bottles, corks, fining agents, SO₂ products, yeast, barrels and other winery inputs. Record deliveries, production usage, write-offs and stocktakes with a running balance per item. Organic producers can use the ledger to evidence permitted fining agent and SO₂ product usage alongside their Wine Production Additives compliance records. All items and movements are shared with the standard Viticulture module — visible from both pages.</li>
</ul>`,
  ],
  // 222 — Accident Book — Four-Stage Investigation Workflow
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
  // 223 — Vet Health Plans — Recording Action Completion and Manager Sign-Off
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
  // 224 — Livestock Mortality Records — Four-Stage Disposal Tracking
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
  // 225 — Organic Viticulture — Input Derogations: Split New Case / Record Decision Workflow
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
  // 226 — Sheep Disease Monitoring — Reportable Disease Flag and APHA Advisory
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
  // 227 — Herd Health Follow-Up Tasks — Raising Tasks from Clinical Event Timeline Entries
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
  // 228 — Poultry Cleanout Swab Testing — Food Safety Advisory and Do Not Restock Guidance
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
  // 229 — Poultry Environmental Alarm Advisory — Corrective Action Before Next Flush Cycle
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
  // 230 — Harvest Destination Type — Own Holding, Contract Processor and Grape Sale Selector
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
  // 235 — SMS Alerts — Configuring Alert Categories, Per-Member Settings and Alert History Log
  [
    "How to configure SMS alert categories, control which farm members receive each alert type, and review the alert history log in BDE Farm Trac.",
    `<h2>SMS Alerts — Configuring Alert Categories, Per-Member Settings and Alert History Log</h2>
<p>The SMS Alerts module lets your farm send automated text message notifications to relevant team members when compliance-critical events occur — withdrawal periods expiring, inspection deadlines approaching, NVZ closed periods opening, and more. This article explains how to configure which alert categories are active and which team members receive each type.</p>
<h3>Navigating to SMS Alerts configuration</h3>
<p>Go to <strong>Account &amp; Notifications</strong> (your account icon in the top-right corner, then <strong>Notifications</strong>) to manage your personal SMS alert preferences. Farm administrators can review the farm-level alert configuration and team recipient status under <strong>SMS &amp; Alert Settings</strong>. A subscription to the Platform Add-ons module is required for SMS Alerts to be active.</p>
<h3>Enabling and disabling alert categories</h3>
<p>On <strong>Account &amp; Notifications</strong>, enter a valid mobile number, switch on <strong>Enable SMS text notifications</strong>, then choose the alert categories relevant to your role. Only categories relevant to your farm are shown. They can include:</p>
<ul>
<li><strong>Livestock &amp; Animals</strong></li>
<li><strong>Dairy</strong></li>
<li><strong>Arable &amp; Crops</strong></li>
<li><strong>Viticulture &amp; Winery</strong></li>
<li><strong>Task Assignments &amp; Reminders</strong></li>
<li><strong>Regulatory Compliance</strong></li>
<li><strong>Quality &amp; Non-conformances</strong></li>
<li><strong>Stock &amp; Supplies</strong></li>
</ul>
<p>Toggle categories on or off, tick the SMS consent box, then click <strong>Save preferences</strong> to store your changes.</p>
<h3>Per-member settings</h3>
<p>Each farm member controls their own SMS opt-in from <strong>Account &amp; Notifications</strong>. Members can opt in to some categories and out of others — for example, a herd manager may choose <strong>Livestock &amp; Animals</strong> and <strong>Task Assignments &amp; Reminders</strong> while leaving unrelated categories off.</p>
<p>Farm administrators can view each member's current SMS preference status from <strong>SMS &amp; Alert Settings → Team Recipients</strong>. This read-only panel shows each member's phone, SMS preference, and whether alerts are active. Individual member settings can only be changed by the member themselves from their own <strong>Account &amp; Notifications</strong> page.</p>
<h3>SMS number setup</h3>
<p>Each member must have a valid UK mobile number saved to their profile for SMS delivery. If a number is missing, the member's status appears as not receiving SMS in the team recipient view. The member can add or update their number from <strong>Account &amp; Notifications</strong>.</p>
<h3>Alert history log</h3>
<p>Open the <strong>History</strong> tab in <strong>SMS &amp; Alert Settings</strong> to see a full timestamped log of recent alerts sent by the platform. Each row shows the sent time, alert type, message, severity, and number of recipients. Use this log to review recent alert activity and confirm that notifications were generated for the farm.</p>`,
  ],
  // 236 — Harvest Botrytis Advisory — Amber Quality Alert and Task Raising on High Botrytis or Poor Condition
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
  // 232 — Sustainability Reports — Certifying Body Register, Supplier Lookup and PO/Invoice Tracking
  // 222 — Sustainability Reports — Certifying Body Register, Supplier Lookup and PO/Invoice Tracking
  [
    "How to record, track, and manage carbon and sustainability reports submitted to supply chain customers using BDE Farm Trac's Sustainability Reports tab.",
    `<h2>Sustainability Reports — Certifying Body Register, Supplier Lookup and PO/Invoice Tracking</h2>
<p>An increasing number of retailers, processors, and assurance schemes require farms to submit formal carbon footprint reports or sustainability declarations as part of their supply chain compliance requirements. The Sustainability Reports tab in the Carbon &amp; Sustainability module provides a dedicated register for tracking every report submitted — who it was submitted to, which certifying body assessed it, its current status, and the associated purchase order and invoice references.</p>
<h3>Accessing the Sustainability Reports tab</h3>
<p>Navigate to <strong>Carbon &amp; Sustainability → Sustainability Reports</strong>. The tab shows a summary card row (total reports, submitted this year, accepted count, and reports under review or pending) followed by a sortable list of all records.</p>
<h3>Adding a new sustainability report record</h3>
<p>Click <strong>Add Report</strong> to open the record form. The required fields are:</p>
<ul>
<li><strong>Report title:</strong> a descriptive name — the Suggested Title hint pre-fills based on the audit tool and customer (e.g. "2024 Agrecalc Carbon Report — Tesco").</li>
<li><strong>Supply chain customer:</strong> the retailer, processor, co-operative, or certification body the report was submitted to.</li>
<li><strong>Report type:</strong> Carbon Footprint, Sustainability Declaration, BNG, SFI Evidence, or Other.</li>
<li><strong>Audit tool:</strong> the carbon calculation tool used — Agrecalc, Cool Farm Tool, Farm Carbon Toolkit, SAC Carbon Calculator, AHDB Carbon Calculator, Arla Carbon Check, or Other.</li>
<li><strong>Report year:</strong> the farming year or crop year the report covers.</li>
<li><strong>Submission date:</strong> the date the completed report was submitted to the customer.</li>
<li><strong>Status:</strong> Draft, Submitted, Accepted, Rejected, or Under Review.</li>
</ul>
<h3>Certifying body lookup</h3>
<p>The <strong>Certifying Body</strong> field offers a searchable picker of recognised UK carbon and sustainability assurance bodies:</p>
<ul>
<li>Carbon Trust</li>
<li>BSI (PAS 2060)</li>
<li>LRQA (Lloyd's Register)</li>
<li>Bureau Veritas</li>
<li>SGS UK</li>
<li>Intertek</li>
<li>ADAS</li>
<li>SAC Consulting</li>
<li>Agrecalc Carbon Assurance</li>
<li>Farm Carbon Toolkit</li>
<li>Carbon Footprint Ltd</li>
<li>Soil Association (organic carbon)</li>
<li>Agri Carbon</li>
<li>Other</li>
</ul>
<p>If your certifying body is not listed, select <strong>Other</strong> and add the name in the Notes field.</p>
<h3>PO reference and invoice reference</h3>
<p>Two optional fields capture the commercial paperwork associated with the report submission:</p>
<ul>
<li><strong>PO Reference:</strong> the purchase order number raised by your customer or by your business for the certification fee.</li>
<li><strong>Invoice Reference:</strong> the invoice number issued by the certifying body or audit tool provider for the assessment fee.</li>
</ul>
<p>These fields allow you to reconcile carbon audit costs against your Finance module purchase orders and invoices without leaving the Carbon &amp; Sustainability module.</p>
<h3>Document attachments</h3>
<p>Each Sustainability Report record has a document attachment panel (visible in the View dialog). You can attach:</p>
<ul>
<li>The submitted report document (PDF or Excel).</li>
<li>The acceptance letter or certification notice from the customer or certifying body.</li>
<li>Supporting evidence (GHG data workings, sequestration calculations, third-party audit certificates).</li>
</ul>
<p>Files are stored in secure cloud storage and accessible via a direct View link at any time — including during a Red Tractor or retailer audit visit.</p>
<h3>Status workflow</h3>
<p>Move a report through its lifecycle by editing the Status field:</p>
<ul>
<li><strong>Draft:</strong> report prepared but not yet submitted.</li>
<li><strong>Submitted:</strong> sent to the customer or certifying body — submission date recorded.</li>
<li><strong>Under Review:</strong> customer or certifier has acknowledged receipt and is reviewing.</li>
<li><strong>Accepted:</strong> customer or certifier has confirmed the report meets requirements.</li>
<li><strong>Rejected:</strong> report returned for revision — use the Notes field to record the reason and the corrective action required.</li>
</ul>
<h3>View-before-edit</h3>
<p>Clicking any record in the list opens a structured <strong>View</strong> dialog first, showing all fields and attached documents. An <strong>Edit</strong> button within the view dialog opens the edit form, preventing accidental overwrites during audits.</p>
<h3>Linking to the Auto-Calculator</h3>
<p>After using the Carbon Auto-Calculator to pre-fill a new Carbon Audit record (see the Carbon Auto-Calculator help article), the resulting audit record provides the verified tCO₂e figures that form the basis of your Sustainability Report submission. Record the corresponding audit year in the Sustainability Report's Report Year field and attach the completed audit workings document to create a complete evidence chain from raw farm data through to the submitted supply chain declaration.</p>`,
  ],
  // 233 — Goat Production Module — Overview and Getting Started
  // 232 — Goat Production Module — Overview and Getting Started
  [
    "An overview of the Goat Production module in BDE Farm Trac, covering all record types and how to get started.",
    `<h2>Goat Production Module — Overview and Getting Started</h2>
<p>The Goat Production module provides dedicated records for the key stages of the commercial and dairy goat production calendar. Herds are registered and managed centrally in <strong>Livestock → Herds &amp; Animals</strong> — the single herd register used across the platform — and every Goat Production record links back to the relevant herd from there.</p>
<h3>Record types available</h3>
<ul>
<li><strong>Mating:</strong> buck-to-doe service records with buck breed, ear tag, owner, mating method (natural, AI fresh/frozen, ET), expected kidding date, and CIDR / progesterone sponge flag.</li>
<li><strong>Pregnancy Scanning:</strong> scanning results per herd including barren, singles, doubles, and triples with automatic scanning percentage calculation.</li>
<li><strong>Weigh-in &amp; DLWG:</strong> group or individual weigh-in events with animal category (Kids, Weanlings, Yearlings, Does, Bucks), DLWG auto-calculated and colour-coded against target, and BCS (Body Condition Score).</li>
<li><strong>Cull / Market Records:</strong> destination CPH, auction or slaughter date, number of head, liveweight, deadweight, kill-out percentage, EUROP grade, sale value, and reason for cull.</li>
<li><strong>Health — Vaccination Programmes:</strong> product name, batch number, dose, route, withdrawal period (days), and vet prescription flag.</li>
<li><strong>Health — Disease Monitoring:</strong> CAE, CLA, Johne's disease, foot rot, cryptosporidiosis, mycoplasma, toxoplasmosis, chlamydiosis, and faecal egg count records with testing body, samples, positive/negative results, status, actions taken, and next test due date.</li>
</ul>
<h3>Analytics tab</h3>
<p>The Analytics tab summarises performance across all record types: four KPI cards (mating cycles, average scanning %, average DLWG in g/day, total cull head), a Kid Type Distribution pie chart aggregated from all scanning events (barren / singles / doubles / triplets), a DLWG by Batch horizontal bar chart for the most recent ten weigh-in groups, a Cull &amp; Market Summary, and a Mating Summary.</p>
<h3>Mobile recording</h3>
<p>All six record types are available in the BDE Farm Trac mobile app under the Record tab. Records save offline and sync automatically when connectivity is restored — useful when scanning, weighing, or vaccinating outdoors.</p>
<h3>Print reports</h3>
<p>Every record type includes a Print button that generates a formatted A4 report suitable for assurance scheme audit packs. Mating and scanning reports include a footer reminding you to retain records for a minimum of 3 years.</p>`,
  ],
  // 234 — Goat Herd Register — Herds are Registered in Livestock → Herds & Animals
  // 233 — Goat Herd Register — Herds are Registered in Livestock → Herds & Animals
  [
    "How goat herds are registered and managed in BDE Farm Trac, and how the herd register links to Goat Production records.",
    `<h2>Goat Herd Register — Herds are Registered in Livestock → Herds &amp; Animals</h2>
<p>BDE Farm Trac uses a single herd and flock register across the entire platform. Goat herds are created and managed in <strong>Livestock → Herds &amp; Animals</strong> — not in the Goat Production module directly. Every tab in the Goat Production module (Mating, Scanning, Weigh-in, Cull / Market, and Health) links back to herds from that register.</p>
<h3>Setting up a goat herd</h3>
<p>Navigate to <strong>Livestock → Herds &amp; Animals</strong> and click <strong>Add Herd / Flock</strong>. Set the species to Goat. Record the herd name, breed, purpose (dairy, meat, dual-purpose, or fibre), your CPH herd number, and any notes. The herd status defaults to Active — archived herds are hidden from record forms but their historical records are retained.</p>
<h3>Herd number (CPH herd identifier)</h3>
<p>Your goat herd number is required for LIS (Livestock Information Service) goat movement submissions via the England CLA API. It appears on movement records and should match the registration held with APHA and LIS. Ensure the herd number is populated on each goat herd record in Livestock → Herds &amp; Animals before raising LIS movement submissions.</p>
<h3>How herd selection works in Goat Production</h3>
<p>When adding any Goat Production record, a herd picker displays all active goat herds registered on the farm. Select the relevant herd — its ID is stored with the record for reporting and filtering. If no goat herds appear in the picker, check that at least one herd with species set to Goat is registered as Active in Livestock → Herds &amp; Animals.</p>`,
  ],
  // 235 — Goat Mating Records — Buck Selection, Mating Methods and Expected Kidding
  // 234 — Goat Mating Records
  [
    "How to record goat mating and breeding events in BDE Farm Trac, including buck details, mating method, expected kidding date, and CIDR/sponge use.",
    `<h2>Goat Mating Records — Buck Selection, Mating Methods and Expected Kidding</h2>
<p>Mating records document each breeding cycle on the holding — which buck was used, which does were exposed, the method of service, and the expected kidding date. These records provide the traceability evidence needed to manage kidding preparation and are retained for assurance scheme audits.</p>
<h3>Adding a mating record</h3>
<p>Navigate to <strong>Goat Production → Mating</strong> and click <strong>Add Record</strong>. Complete the following fields:</p>
<ul>
<li><strong>Mating Start Date *</strong> — date the buck was introduced to the group.</li>
<li><strong>Mating End Date</strong> — date the buck was removed.</li>
<li><strong>Buck Breed</strong> — selected from a list of UK commercial and dairy goat breeds (Boer, Kiko, Savanna, Anglo-Nubian, Cashmere, Pygmy, Pygmy x, Crossbred, and Other).</li>
<li><strong>Buck Ear Tag</strong> — the individual ear tag number of the buck used.</li>
<li><strong>Buck Owner</strong> — name of the owner if the buck was hired or belongs to another holding.</li>
<li><strong>Buck Hired or Owned</strong> — indicates whether the buck is owned by the farm or hired in for the season.</li>
<li><strong>Does Exposed</strong> — number of does in the mating group.</li>
<li><strong>Mating Method</strong> — Natural, AI (fresh), AI (frozen), or ET (embryo transfer).</li>
<li><strong>Expected Kidding Date</strong> — enter the expected kidding date based on your chosen gestation period; standard goat gestation is 150 days from mating start.</li>
<li><strong>CIDR / Progesterone Sponge Used</strong> — tick if intravaginal progesterone devices were used to synchronise oestrus before mating.</li>
</ul>
<h3>Analytics</h3>
<p>The Analytics tab Mating Summary shows the total number of mating cycles recorded, total does exposed across all cycles, and the number of distinct buck breeds used.</p>
<h3>Print report</h3>
<p>The Mating Records print report is a landscape A4 table including all key fields with a footer noting the 3-year record retention requirement. Suitable for compliance document packs and assurance scheme audits.</p>
<h3>Mobile recording</h3>
<p>Mating records can be entered in the mobile app's Record tab under <em>Goat Mating Record</em>. The record saves offline and syncs to the dashboard automatically when connectivity is restored.</p>`,
  ],
  // 236 — Goat Pregnancy Scanning — Does Barren, Singles, Doubles and Triplets
  // 235 — Goat Pregnancy Scanning
  [
    "How to record goat pregnancy scanning results in BDE Farm Trac, including does barren, singles, doubles, triplets, scanning percentage, and expected total kids.",
    `<h2>Goat Pregnancy Scanning — Does Barren, Singles, Doubles and Triplets</h2>
<p>Pregnancy scanning determines the litter distribution of the kidding crop and allows you to plan housing, nutrition, and labour requirements before kidding begins. BDE Farm Trac records the scanning event with a full litter breakdown and calculates the scanning percentage automatically.</p>
<h3>Adding a scanning record</h3>
<p>Navigate to <strong>Goat Production → Scanning</strong> and click <strong>Add Record</strong>. Complete the following fields:</p>
<ul>
<li><strong>Scan Date *</strong> — date of the scanning event.</li>
<li><strong>Scanner Name</strong> — name of the scanning technician or vet performing the scan.</li>
<li><strong>Scanner Company</strong> — the scanning company or veterinary practice.</li>
<li><strong>Does Scanned *</strong> — total number of does put through the scanner.</li>
<li><strong>Barren</strong> — number of does confirmed empty.</li>
<li><strong>Singles</strong> — number of does carrying one kid.</li>
<li><strong>Doubles</strong> — number of does carrying twins.</li>
<li><strong>Triplets</strong> — number of does carrying three kids.</li>
<li><strong>Scanning %</strong> — automatically calculated as (expected total kids ÷ does scanned) × 100; can be overridden if your scanning report shows a different figure.</li>
<li><strong>Expected Kids Total</strong> — calculated from the litter breakdown entered above.</li>
</ul>
<h3>Analytics</h3>
<p>The Analytics tab aggregates all scanning records into a <strong>Kid Type Distribution</strong> pie chart showing the proportion of barren, singles, doubles, and triplets across all scanning events on the farm. The <strong>Avg Scanning %</strong> KPI card shows the mean across all recorded rounds.</p>
<h3>Print report</h3>
<p>The Pregnancy Scanning print report uses landscape A4 layout with the full litter breakdown and a record retention footer. Suitable for veterinary health plan reviews and CAE accreditation scheme audit packs.</p>`,
  ],
  // 237 — Goat Weigh-in and DLWG — Performance Recording and Body Condition Scoring
  // 236 — Goat Weigh-in and DLWG
  [
    "How to record goat weigh-in events in BDE Farm Trac, including DLWG calculation, body condition scoring, and performance tracking against target.",
    `<h2>Goat Weigh-in and DLWG — Performance Recording and Body Condition Scoring</h2>
<p>Regular weight recording is the most reliable way to monitor kid and doe performance and to identify production issues early. BDE Farm Trac calculates the Daily Live Weight Gain (DLWG) from consecutive weigh-in records and colour-codes the result against your target to make underperformance immediately visible.</p>
<h3>Adding a weigh-in record</h3>
<p>Navigate to <strong>Goat Production → Weigh-in</strong> and click <strong>Add Record</strong>. Complete the following fields:</p>
<ul>
<li><strong>Weigh Date *</strong> — date of the weigh-in event.</li>
<li><strong>Animal Category</strong> — Kids, Weanlings, Yearlings, Does, or Bucks — the age or class group being weighed.</li>
<li><strong>Batch / Group Reference</strong> — a label to identify the group across multiple weigh-ins (e.g. "Spring Kids 2025"); used to link consecutive records when calculating DLWG.</li>
<li><strong>Number Weighed</strong> — count of animals in the group at this weigh-in.</li>
<li><strong>Average Weight (kg)</strong> — mean weight for the group or batch.</li>
<li><strong>Lightest Weight (kg)</strong> and <strong>Heaviest Weight (kg)</strong> — range captured at the same event to indicate spread within the group.</li>
<li><strong>Target Weight (kg)</strong> — the breed-standard or management target for this group at this stage.</li>
<li><strong>Previous Weigh Date</strong> and <strong>Previous Avg Weight (kg)</strong> — used to calculate DLWG; enter the date and average weight from the preceding weigh-in for this batch.</li>
<li><strong>DLWG (g/day)</strong> — calculated automatically from the difference between current and previous average weights divided by the number of days between weigh dates; colour-coded green (on or above target), amber (within 10% below target), or red (significantly below target).</li>
<li><strong>BCS (Body Condition Score)</strong> — the 1–5 body condition score assessed at the time of weighing.</li>
</ul>
<h3>Raise Task</h3>
<p>Each weigh-in record includes a <strong>Raise Task</strong> button in the View dialog. Use it to create a follow-up task when a group's DLWG is below target — the task appears on the Task Board assigned to the responsible team member.</p>
<h3>Analytics</h3>
<p>The Analytics tab shows the average DLWG (g/day) across all records as a KPI card and a <strong>DLWG by Batch</strong> horizontal bar chart for the most recent ten weigh-in groups. Groups consistently below target are immediately visible.</p>`,
  ],
  // 238 — Goat Health and Disease Monitoring — CAE, CLA, Johne's and Reportable Diseases
  // 237 — Goat Health and Disease Monitoring
  [
    "How to record goat vaccination programmes and disease monitoring in BDE Farm Trac, covering CAE, CLA, Johne's disease, and the reportable disease advisory.",
    `<h2>Goat Health and Disease Monitoring — CAE, CLA, Johne's and Reportable Diseases</h2>
<p>The Health tab in Goat Production provides two sub-sections: <strong>Vaccination Programmes</strong> for recording all vaccination events per herd, and <strong>Disease Monitoring</strong> for logging the results of disease surveillance tests and health observations.</p>
<h3>Vaccination Programmes</h3>
<p>Navigate to <strong>Goat Production → Health → Vaccinations</strong> and click <strong>Add Vaccination</strong>. Capture:</p>
<ul>
<li><strong>Product Name</strong> — the vaccine or biological product (e.g. Heptavac P Plus, Lambivac, Covexin 10, Bravoxin 10).</li>
<li><strong>Batch / Lot Number</strong> — for product traceability in medicine records.</li>
<li><strong>Vaccination Date *</strong> — date of administration.</li>
<li><strong>Number of Animals</strong> — animals vaccinated in this event.</li>
<li><strong>Dose (ml)</strong> and <strong>Route</strong> — subcutaneous, intramuscular, or oral.</li>
<li><strong>Withdrawal Period (days)</strong> — the meat and/or milk withdrawal period for this product; displayed prominently on the saved record as a compliance reminder.</li>
<li><strong>Vet Prescribed</strong> — tick if administered under veterinary prescription (POM-V product).</li>
</ul>
<p>Vaccination records print as a formatted A4 compliance document including batch traceability and withdrawal period reminder, suitable for veterinary health plan reviews and assurance scheme audits.</p>
<h3>Disease Monitoring</h3>
<p>Navigate to <strong>Goat Production → Health → Disease Monitoring</strong> and click <strong>Add</strong>. Monitoring types include:</p>
<ul>
<li><strong>CAE (Caprine Arthritis Encephalitis)</strong> — the most significant viral disease in UK dairy and fibre goat herds; records support CAE Accreditation Scheme documentation requirements (scheme reference, testing body, samples, result status).</li>
<li><strong>CLA (Caseous Lymphadenitis)</strong> — caseous lymphadenitis serology or post-mortem confirmation records per herd.</li>
<li><strong>Johne's Disease</strong> — paratuberculosis surveillance tests; tracks herd risk level and next test due across monitoring rounds.</li>
<li><strong>Foot rot surveillance, Cryptosporidiosis, Toxoplasmosis, Chlamydiosis, Mycoplasma</strong> — additional important disease conditions captured with the same record structure.</li>
<li><strong>Faecal egg count (worms)</strong> — FEC results per batch with number of samples and positive count for SCOPS-aligned anthelmintic decision making.</li>
</ul>
<p>Each monitoring record captures the testing body or laboratory, number of samples, positive and negative results, overall status (Pending / Clear / Positive / Inconclusive), actions taken, and the next test due date. Status is shown as a colour-coded badge — green for Clear, red for Positive, amber for Inconclusive or Pending.</p>
<h3>Reportable diseases</h3>
<p>If you suspect a notifiable disease — including Foot and Mouth Disease, Bluetongue, Anthrax, Scrapie, or any other listed disease — contact APHA immediately on <strong>03000 200 301</strong> before recording the observation in BDE Farm Trac. The statutory notification obligation is triggered by reasonable suspicion, not by laboratory confirmation. The formal incident record including the APHA reference number, isolation measures applied, and case outcome is recorded in <strong>Compliance &amp; Plans → Disease &amp; Incident Log</strong>.</p>`,
  ],
  // 239 — Venison Production Module — Overview and Getting Started
  // Venison Production
  [
    "Overview of stalking & cull records, carcass processing, herd monitoring, health records, and the firearms certificate register for farmed and estate deer enterprises.",
    `<h2>Venison Production Module — Overview</h2>
<p>The <strong>Venison Production</strong> module provides a complete compliance and operational record for UK deer enterprises. It is available to any farm that has the <strong>Venison Production</strong> module enabled under Settings → Modules.</p>
<h3>Tabs in this module</h3>
<ul>
<li><strong>Herds</strong> — shows your deer herds registered in Livestock → Herds &amp; Animals. Deer herds are the anchor for all records in this module.</li>
<li><strong>Cull Records</strong> — stalking and culling events with full carcass yield data and food safety inspection results.</li>
<li><strong>Carcass Sales</strong> — carcass processing and venison sales records with Wild Game Declaration numbers.</li>
<li><strong>Herd Monitoring</strong> — population survey log supporting your annual deer management plan.</li>
<li><strong>Health</strong> — vaccination, bTB test results, vet visits, and notifiable disease alerts.</li>
<li><strong>Firearms &amp; Licences</strong> — certificate register for all stalkers and certificate holders, with expiry alerts.</li>
<li><strong>Analytics</strong> — KPI cards, cull-by-species pie chart, and monthly cull trend chart.</li>
</ul>
<h3>Getting started</h3>
<p>Before using this module, register your deer herd(s) in <strong>Livestock → Herds &amp; Animals</strong> and set the species to a deer species (Red Deer, Fallow Deer, Sika, Roe Deer, Muntjac, etc.). All records in Venison Production link back to herds from that central register.</p>`,
  ],
  // 240 — Venison Cull Records — Stalking Events, Carcass Weights and Food Safety Inspection
  [
    "Record stalking and culling events with species, sex, age class, beat location, larder number, carcass weight data, and food safety inspection result.",
    `<h2>Venison Cull Records</h2>
<p>A cull record documents each individual or batch culling event on your deer enterprise. It is the primary compliance record for your stalking operations and supports Wild Game meat safety obligations.</p>
<h3>Fields</h3>
<ul>
<li><strong>Cull Date</strong> — the date the cull took place (required).</li>
<li><strong>Stalker Name</strong> — the name of the person who carried out the stalk or cull.</li>
<li><strong>Species</strong> — select from Red Deer, Roe Deer, Fallow Deer, Sika Deer, Muntjac, Chinese Water Deer, Reindeer, or Other (required).</li>
<li><strong>Sex</strong> — Stag, Hind, Buck, Doe, Calf, Fawn, Kid, or Unknown.</li>
<li><strong>Age Class</strong> — Calf/Fawn, Yearling (Pricket/Knobber), Adult, or Unknown.</li>
<li><strong>Location / Beat</strong> — the beat name or map compartment where the cull took place.</li>
<li><strong>Larder Number / Carcass Number</strong> — reference numbers assigned at the larder for traceability.</li>
<li><strong>Weights</strong> — liveweight (kg), gralloch weight (kg), and carcass weight (kg) for full yield tracking.</li>
<li><strong>Kill-out %</strong> — calculated or entered kill-out percentage.</li>
<li><strong>Cull Method</strong> — Rifle (stalking), Driven/Sika drive, or Trap (licensed).</li>
<li><strong>Cull Reason</strong> — Population management (annual cull plan), Damage control, Welfare, Sporting cull, or Licensed out-of-season emergency.</li>
<li><strong>Food Safety Inspection Result</strong> — Passed / Conditionally passed / Failed / Not inspected. Colour-coded badge on each record.</li>
</ul>`,
  ],
  // 241 — Venison Cull Records — Notifiable Disease Suspect Flag and APHA Advisory
  [
    "Tick the Notifiable Disease Suspect flag to trigger an APHA advisory and record that APHA was contacted on 03000 200 301.",
    `<h2>Notifiable Disease Suspect Flag — Venison Cull Records</h2>
<p>When a disease is noticed during gralloch or larder inspection that may be notifiable (for example, signs consistent with bTB, foot-and-mouth disease, or bluetongue), you must tick the <strong>Notifiable Disease Suspect</strong> checkbox on the cull record.</p>
<h3>What happens when you tick the box</h3>
<p>A red advisory panel appears in the form reminding you:</p>
<blockquote>Contact APHA immediately on <strong>03000 200 301</strong>. Mandatory notification must be made before laboratory confirmation.</blockquote>
<h3>Legal requirement</h3>
<p>Under the Animal Health Act 1981 and associated disease control legislation, keepers are legally required to notify APHA of any suspected notifiable disease. Failure to notify is a criminal offence. The system records the flag on the cull record so inspectors can see which events prompted APHA contact.</p>
<p>APHA's emergency number is available 24 hours a day, 7 days a week: <strong>03000 200 301</strong>.</p>`,
  ],
  // 242 — Venison Carcass Sales — Wild Game Declaration, Facility Type and Destination Recording
  [
    "Record each carcass sale or processing event with facility type, destination, buyer details, Wild Game Declaration number, price per kg, and total value.",
    `<h2>Venison Carcass Sales — Wild Game Declaration and Destination Recording</h2>
<p>The Carcass Sales tab records every carcass processing event and venison sale from your deer enterprise.</p>
<h3>Facility Types</h3>
<ul>
<li><strong>On-farm approved larder</strong> — registered on-farm facility for primary processing.</li>
<li><strong>AGHE (Approved Game Handling Establishment)</strong> — FSA-approved facility for wild game; required for venison entering commercial food chain without trained hunter inspection.</li>
<li><strong>Licensed Game Handling Establishment (GHE)</strong> — licensed processor for game carcasses.</li>
<li><strong>Direct on-farm slaughter</strong> — for farm retail and direct sales.</li>
</ul>
<h3>Wild Game Declaration (WGD)</h3>
<p>A WGD is required under retained UK food hygiene law (Regulation (EC) No 852/2004) when deer carcasses enter the commercial food chain. It must be completed by a trained hunter holding a WGMI (Wild Game Meat Inspector) or equivalent certificate. Record the WGD reference number in the <strong>Wild Game Declaration No.</strong> field against each carcass batch sale.</p>
<h3>Destination types</h3>
<p>Game dealer, Butcher/butchery, Wholesale, Direct consumer sale, Restaurant/catering, Export, or Own consumption.</p>
<h3>Financial fields</h3>
<p>Record price per kg (£), total weight (kg), and total value (£) to track enterprise income across the season. The Analytics tab aggregates these into a total sales value KPI.</p>`,
  ],
  // 243 — Venison Herd Monitoring — Population Surveys: Driven Count, Thermal Imaging and Camera Trap
  [
    "Log regular herd population surveys using driven counts, thermal imaging, camera trap census, or aerial methods to support your annual deer management plan.",
    `<h2>Venison Herd Monitoring — Population Surveys</h2>
<p>The Herd Monitoring tab provides a log of population surveys across your deer range. Regular surveys are required as evidence for annual deer management plans submitted to deer management groups, SNH (NatureScot), or APHA where required.</p>
<h3>Survey Methods</h3>
<ul>
<li><strong>Driven Count</strong> — organised drive with counters stationed at fixed positions; most reliable for woodland deer.</li>
<li><strong>Thermal Imaging — Ground-based</strong> — vehicle or static-mounted thermal camera used at night; effective for open-ground and parkland deer.</li>
<li><strong>Fixed Point Count (Vantage Point)</strong> — observer counts from elevated positions at dawn or dusk.</li>
<li><strong>ADE Count — Aerial</strong> — aerial distance estimation from a low-level aircraft; used for red deer counts in open Scottish Highland.</li>
<li><strong>Thermal Drone Survey</strong> — UAV-mounted thermal camera; increasingly used for estate and parkland deer.</li>
<li><strong>Camera Trap Census</strong> — systematic camera trap grid with mark-recapture analysis.</li>
</ul>
<h3>Key recorded data</h3>
<p>Species, male/female/young/total counts, male:female ratio, recruitment rate %, observer name, and weather conditions. The Analytics tab shows the average herd count across all survey events as a KPI card.</p>`,
  ],
  // 244 — Venison Health Records — bTB SICCT Skin Test, Gamma-Interferon Blood Test and APHA Reference
  [
    "Record vaccination events, bTB SICCT skin tests, gamma-interferon blood tests, post mortem examinations, and vet treatments with withdrawal period tracking.",
    `<h2>Venison Health Records — bTB Testing and Vet Treatments</h2>
<p>The Health Records tab in Venison Production provides a structured event log for all health-related activities on your deer enterprise.</p>
<h3>bTB Testing</h3>
<p>Farmed deer holdings may be subject to bovine tuberculosis (bTB) testing by APHA, particularly in High Risk Area (HRA) and Edge Area (EA) counties. Two test types are available:</p>
<ul>
<li><strong>bTB SICCT Skin Test</strong> — Single Intradermal Comparative Cervical Test; the standard statutory test.</li>
<li><strong>bTB Gamma-Interferon Blood Test</strong> — interferon-gamma assay (IFN-γ); used as a supplementary or ancillary test in restricted herds.</li>
</ul>
<p>Record the test date, number of animals tested, APHA reference number, and overall result (Clear / Negative, Standard Reactor, Inconclusive Reactor, or Not Applicable). Results display with colour-coded badges: green for Clear, red for reactor results.</p>
<h3>Withdrawal periods</h3>
<p>Any veterinary medicine administered to deer must have its withdrawal period (in days) recorded. This is particularly important if carcasses are entering the human food chain — the food safety inspection at the larder must confirm no animals are within a withdrawal period at time of cull.</p>
<h3>Notifiable disease suspect</h3>
<p>If a notifiable disease is suspected during a health event or post mortem, tick the Notifiable Disease Suspect checkbox. Contact APHA on <strong>03000 200 301</strong> immediately.</p>`,
  ],
  // 245 — Venison Firearms & Stalking Certificates — Section 1 FC, DSC1, DSC2 and WGMI Expiry Tracking
  [
    "Register Section 1 Firearms Certificates, DSC1, DSC2, WGMI hunter food hygiene certificates, and other stalker licences with 90-day expiry alerts.",
    `<h2>Firearms &amp; Stalking Certificates Register</h2>
<p>The Firearms &amp; Licences tab provides a central register of all certificates and licences held by your stalkers and estate team. This register helps you ensure no one enters the field without current, valid authorisation.</p>
<h3>Certificate Types</h3>
<ul>
<li><strong>Section 1 Firearms Certificate (FC)</strong> — required for any rifle used to cull deer; issued by the local police force; renewed every 5 years. The FC specifies the calibre(s) and condition of use.</li>
<li><strong>Section 2 Shotgun Certificate (SGC)</strong> — required for shotguns; issued by local police; renewed every 5 years.</li>
<li><strong>Deer Stalking Certificate Level 1 (DSC1)</strong> — foundation qualification covering deer biology, law, and rifle safety; issued by LANTRA/Deer Initiative.</li>
<li><strong>Deer Stalking Certificate Level 2 (DSC2)</strong> — practical assessment of competent deer management; required for commercial venison suppliers in many supply chain contracts.</li>
<li><strong>Scottish Stalking Certificate</strong> — Scottish equivalent qualification.</li>
<li><strong>Hunter Food Hygiene Certificate (WGMI)</strong> — Wild Game Meat Inspector qualification; required to complete Wild Game Declarations for carcasses entering the commercial food chain.</li>
<li><strong>Larder Hygiene Certificate</strong> — required for anyone operating an approved larder for primary processing.</li>
</ul>
<h3>Expiry alerts</h3>
<p>An <strong>amber warning banner</strong> appears when any certificate expires within 90 days. A <strong>red banner</strong> appears for expired certificates. Review and renew certificates before the expiry date — lapsed FCs must be reported to the police authority and stalking must cease until a renewed certificate is obtained.</p>`,
  ],
  // 246 — Organic Venison Module — Overview and Getting Started
  [
    "Overview of the Organic Venison module — certification, land register, feed and supplement log, and derogation case management for certified organic farmed deer enterprises.",
    `<h2>Organic Venison Module — Overview</h2>
<p>The <strong>Organic Venison</strong> module provides organic compliance records for certified farmed deer enterprises under UK Organic Regulations (retained from EC No. 834/2007 and Commission Regulation (EC) No. 889/2008).</p>
<h3>Important: wild venison cannot be certified organic</h3>
<p>Only farmed deer — born and raised under organic management on certified organic land — are eligible for organic certification. Wild deer culled on open ground cannot hold organic status regardless of habitat or feeding habits.</p>
<h3>Tabs in this module</h3>
<ul>
<li><strong>Certification</strong> — certifying body and certificate register (Soil Association, OF&amp;G, Biodynamic Association, OF&amp;G Scotland).</li>
<li><strong>Land Register</strong> — deer park and grazing compartment conversion status register.</li>
<li><strong>Feed &amp; Supplements</strong> — log of supplementary feed and mineral inputs with organic approval status.</li>
<li><strong>Derogations</strong> — input derogation case management from application through to decision.</li>
</ul>
<h3>Certifying bodies</h3>
<p>The main UK organic certifying bodies for deer enterprises are <strong>Soil Association Certification</strong> and <strong>OF&amp;G (Organic Farmers &amp; Growers)</strong>. Both are accredited under UKAS to certify against the UK Organic Regulations.</p>`,
  ],
  // 247 — Organic Venison — Certification Tab: Certifying Body, Certificate Number and Scope Register
  [
    "Record certifying body details, certificate numbers, issue and expiry dates, scope, and active/pending/suspended status for organic venison certification.",
    `<h2>Organic Venison — Certification Tab</h2>
<p>The Certification tab is the central record of your organic certification status as a deer enterprise.</p>
<h3>Certificate Types</h3>
<ul>
<li><strong>Venison / Deer Park</strong> — certification specifically covering your farmed deer enterprise for venison production.</li>
<li><strong>Full Holding — All Products</strong> — whole-farm organic certification covering all enterprises.</li>
<li><strong>Specific Enterprise Only</strong> — certification limited to the deer enterprise, with other enterprises operating conventionally.</li>
<li><strong>In-Conversion Certificate</strong> — issued during the conversion period before full organic status is achieved.</li>
</ul>
<h3>Status values</h3>
<ul>
<li><strong>Active</strong> — current valid certificate. Shown in green.</li>
<li><strong>Pending</strong> — application submitted, awaiting first inspection. Shown in amber.</li>
<li><strong>Suspended</strong> — certificate suspended pending investigation.</li>
<li><strong>Withdrawn</strong> — certificate withdrawn by certifier.</li>
<li><strong>Expired</strong> — certificate lapsed and not renewed.</li>
</ul>
<h3>Scope field</h3>
<p>Use the Scope field to record what the certificate covers, for example: <em>"Farmed red and fallow deer for venison — Deer Park compartments A, B and C"</em>. This helps cross-reference the certificate against the Land Register compartments.</p>`,
  ],
  // 248 — Organic Venison — Land Register: Grazing Compartment Conversion Status Tracking
  [
    "Track each deer park or grazing compartment through organic conversion from pre-conversion to certified organic with area, conversion dates, and certifier reference.",
    `<h2>Organic Venison — Land Register</h2>
<p>The Land Register records each discrete grazing compartment or deer park enclosure and tracks its progress through the organic conversion process.</p>
<h3>Conversion Status values</h3>
<ul>
<li><strong>Pre-Conversion</strong> — land not yet notified to certifier as beginning conversion.</li>
<li><strong>Year 1 In-Conversion</strong> — first year of the two-year minimum conversion period.</li>
<li><strong>Year 2 In-Conversion</strong> — second year; eligible for first organic inspection at end of this year.</li>
<li><strong>Certified Organic</strong> — full organic status achieved. Shown in green.</li>
<li><strong>Suspended</strong> — organic status suspended by certifier.</li>
<li><strong>Withdrawn</strong> — organic status withdrawn; land must restart conversion if it is to be recertified.</li>
</ul>
<h3>Key fields</h3>
<ul>
<li><strong>Compartment Name</strong> — name or reference for the deer park block (e.g. North Deer Park, Block A).</li>
<li><strong>Area (ha)</strong> — total area of the compartment in hectares; used to calculate total certified organic area across the KPI card summary.</li>
<li><strong>Conversion Start Date</strong> — the date the conversion period began (must match your certifier's notification record).</li>
<li><strong>Certified Organic Date</strong> — the date full organic status was granted.</li>
<li><strong>Certifier Reference</strong> — the parcel or compartment reference as shown on your certifier's inspection map.</li>
<li><strong>Previous Land Use</strong> — e.g. conventional arable, improved pasture, woodland; reviewed by inspectors when assessing conversion eligibility.</li>
</ul>`,
  ],
  // 249 — Organic Venison — Feed and Supplement Log: Organic Approval Status and Certifier Reference
  [
    "Log all supplementary feed and mineral inputs with organic approval status — Certified Organic, Approved for Organic Use, Derogation Required, or Not Permitted.",
    `<h2>Organic Venison — Feed and Supplement Log</h2>
<p>Under UK Organic Regulations, all supplementary feed and mineral inputs used on an organic deer enterprise must be documented and, where not fully certified organic, must have prior approval or a derogation from your certifying body.</p>
<h3>Organic Approval Status values</h3>
<ul>
<li><strong>Certified Organic</strong> — product is certified organic; no additional approval required.</li>
<li><strong>Approved for Organic Use (non-organic ingredient)</strong> — product contains a non-organic ingredient but has been approved by the certifier for use on an organic holding. Record the Certifier Approval Reference.</li>
<li><strong>Derogation Required</strong> — product is not approved for organic use; a formal derogation must be applied for before use. Raise a case in the Derogations tab.</li>
<li><strong>Not Permitted</strong> — product is prohibited under UK Organic Regulations and must not be used on an organic holding.</li>
</ul>
<h3>Certifier Approval Reference</h3>
<p>When a product has been approved by your certifier for use (status: Approved for Organic Use), record the certifier's approval reference number in this field. This reference is checked by inspectors at your annual inspection to confirm each non-standard input was authorised.</p>
<h3>What inputs must be recorded?</h3>
<p>All supplementary inputs beyond the deer's natural grazing: mineral licks, salt blocks, hay and silage, concentrate feeds, organic concentrates, liquid supplements, and drenches. Natural pasture grazing does not require a separate record.</p>`,
  ],
  // 250 — Organic Venison — Derogations: Case Register, Justification, Decision and Approval Conditions
  [
    "Manage input derogation cases from application through to certifier decision, recording justification, regulatory basis, approval conditions, and expiry date.",
    `<h2>Organic Venison — Derogations</h2>
<p>A derogation is a formal permission from your certifying body to use a non-organic input or practice where no organic alternative is available. Under UK Organic Regulations, derogations must be applied for <strong>before</strong> the input is used.</p>
<h3>Derogation lifecycle</h3>
<ol>
<li><strong>Identify the need</strong> — you need an input for which no certified organic equivalent is commercially available.</li>
<li><strong>Record the availability search</strong> — search the Organic Farming Input Scheme (OFIS) / UKOAS database and record the search date and reference number in the Availability Search Evidence fields.</li>
<li><strong>Apply</strong> — submit a written application to your certifying body with the input name, reason, and the availability search evidence.</li>
<li><strong>Record the application</strong> — add a new derogation case in BDE Farm Trac with Status: Pending, the Application Date, Availability Search Date and OFIS/UKOAS Reference, and Justification text. Leave the Decision fields empty at this stage.</li>
<li><strong>Record the decision</strong> — when the certifier responds, open the case and enter the Internal Decision Date (when you received and noted it), the official Decision Date, and the outcome (Approved or Refused). For approved cases, enter the Expiry Date and Approval Conditions. For refused cases, record the Refusal Reason, Refusal Reference, and the Corrective Action your farm will take.</li>
<li><strong>Expiry</strong> — approved derogations have a fixed expiry date. Renew the application before expiry if the input is still needed.</li>
</ol>
<h3>Refusal handling and Action Required</h3>
<p>When a certifier refuses an application, recording the Refusal Reason and Corrective Action on the case is essential for maintaining your compliance record. Until a corrective action is entered, the case card displays an <strong>Action Required</strong> badge — both in the dashboard and in the mobile app — to ensure refused cases are not left unresolved.</p>
<h3>Regulatory basis</h3>
<p>Record the relevant regulatory article, e.g. <em>UK Organic Reg Art. 24</em> or <em>Commission Reg (EC) 889/2008 Annex V</em>. This demonstrates you applied correctly and that the certifier's approval has a sound legal basis.</p>
<h3>Mobile capture</h3>
<p>New derogation applications can be recorded from the mobile app when connectivity is limited — the form captures all application-phase fields (input name, type, certifying body, availability search date and reference, application date, justification, and regulatory basis) and syncs to the dashboard automatically when you reconnect. For recording decisions and managing correspondence, use the dashboard.</p>
<h3>Inspection review</h3>
<p>Your certifying body inspector will review the derogations register at your annual inspection. All derogation cases — whether approved, refused, or withdrawn — should be retained for audit purposes.</p>`,
  ],
  // 251 — Year Filters on Livestock Recording Tabs — All Production Modules
  [
    "All recording tabs across Sheep, Goat, Beef, Venison, Pig, Dairy, and Poultry production modules include a year filter dropdown that defaults to the current year, so recent records are always shown first.",
    `<h2>Year Filters on Livestock Recording Tabs</h2>
<p>Every recording tab across all specialist livestock production modules includes a <strong>year filter</strong> dropdown. When you open any recording tab the filter defaults to the current year, so your most recent records are always shown without any manual filtering.</p>
<h3>Modules and tabs covered</h3>
<ul>
<li><strong>Sheep Production</strong> — Tupping Records, Pregnancy Scanning, Weigh-in &amp; DLWG, Shearing Records, Disease Monitoring</li>
<li><strong>Goat Production</strong> — Mating Records, Pregnancy Scanning, Weigh-in &amp; DLWG, Cull &amp; Market, Vaccination Programmes, Disease Monitoring</li>
<li><strong>Beef Production</strong> — Weigh-in &amp; DLWG, Finishing Records, Body Condition Scoring, Deadweight Settlement</li>
<li><strong>Venison Production</strong> — Cull Records, Carcass Sales, Herd Population Surveys, Health Records</li>
<li><strong>Pig Production</strong> — Stockmanship Checks, Tail Biting Assessments, Feed Records, Movements, Kill Records, Mortality, Salmonella Monitoring</li>
<li><strong>Poultry Production</strong> — Chick Purchases, Thinning Records, Campylobacter Monitoring</li>
<li><strong>Dairy (standard)</strong> — Body Condition Scoring, Mobility Scoring, Bulk Tank, Johne's Disease Monitoring</li>
<li><strong>Organic Livestock</strong> — Outdoor Access Log</li>
<li><strong>Organic Dairy</strong> — Feed &amp; Nutrition</li>
</ul>
<h3>How to use the year filter</h3>
<p>At the top right of each recording tab you will see a year dropdown (e.g. <em>2025</em>). Click it to select any year for which records exist. The table below updates instantly — no page reload is required.</p>
<h3>Why this matters for audits</h3>
<p>Red Tractor and organic certification schemes require records to be retained for a minimum of three years. The year filter lets you switch between years instantly during an assessor visit, presenting evidence from any past season without scrolling through all historical data. It also makes it straightforward to print a year-specific report for inclusion in an audit pack.</p>`,
  ],
  // 252 — Document Attachment on Livestock Record Rows — Compact DocAttach Across All Production Tabs
  [
    "Every record row across all livestock production recording tabs has a compact attach/view button for uploading PDFs, photos, and Word documents directly against that specific record.",
    `<h2>Document Attachment on Livestock Record Rows</h2>
<p>Every row in every recording tab across all specialist livestock production modules has a compact <strong>document attachment button</strong> (a paperclip or attach icon). Clicking it opens a dialog where you can upload one or more files and link them permanently to that specific record.</p>
<h3>Supported file types</h3>
<ul>
<li>PDF documents (vet certificates, settlement sheets, lab reports, scan certificates, contractor invoices)</li>
<li>Images — JPG, PNG, WebP (photographic evidence, fleece weight tags, ear tag photos)</li>
<li>Word documents — DOC, DOCX (health plans, written contracts, biosecurity declarations)</li>
</ul>
<h3>Modules and tabs covered</h3>
<p>Document attachment is available on record rows across <strong>all recording tabs</strong> in: Sheep Production, Goat Production, Beef Production, Venison Production, Pig Production, Poultry Production (including Thinning Records and Campylobacter Monitoring rows), Dairy (standard) production tabs, Organic Livestock Outdoor Access Log, and Organic Dairy Feed &amp; Nutrition.</p>
<h3>RecordAttachments panel in view dialogs</h3>
<p>On certain record types a full <strong>RecordAttachments panel</strong> is shown inside the view dialog, displaying all documents linked to that record alongside the structured data fields. This applies to:</p>
<ul>
<li>Pig Stockmanship Checks</li>
<li>Pig Tail Biting Assessments</li>
<li>Dairy Johne's Disease Monitoring records</li>
<li>Poultry Chick Purchase records</li>
<li>Poultry Campylobacter Monitoring records</li>
</ul>
<h3>Audit trail</h3>
<p>All attachments are stored in secure cloud storage and linked permanently to the record. They are accessible from the dashboard at any time, including during an assessor visit. Each attachment shows the file name, upload date, and uploader name.</p>`,
  ],
  // 253 — Johne's Disease Monitoring — Year Filter, Print Report and Record Attachments
  [
    "Johne's Disease Monitoring records now include a year filter, a formatted print report for assessor presentation, and a RecordAttachments panel in the view dialog for lab certificates and correspondence.",
    `<h2>Johne's Disease Monitoring — Year Filter, Print Report and Record Attachments</h2>
<p>The Johne's Disease Monitoring Register (Livestock &amp; Feed Management → Johne's Disease) records each quarterly or annual paratuberculosis monitoring round for cattle and dairy herds.</p>
<h3>Year filter</h3>
<p>A year dropdown at the top of the Johne's Disease tab defaults to the current year. Select any past year to review historical monitoring records instantly — useful when demonstrating compliance history to a Red Tractor Beef &amp; Lamb or Dairy assessor.</p>
<h3>Print report</h3>
<p>A <strong>Print Report</strong> button generates a formatted A4 landscape compliance report covering all Johne's Disease monitoring records for the selected year. The report includes:</p>
<ul>
<li>Farm name, CPH number, and report date</li>
<li>Each monitoring round: test method (blood ELISA, milk ELISA, faecal PCR), laboratory, result category (Negative / Low Risk / Low Positive / High Positive), herd risk level, actions applied, and next test due date</li>
</ul>
<p>This report is suitable for inclusion in a Red Tractor audit pack or for sharing with your vet or CHECS/AHDB adviser.</p>
<h3>RecordAttachments in the view dialog</h3>
<p>Opening any Johne's Disease monitoring record shows a full <strong>RecordAttachments panel</strong> alongside the record data. Use it to attach and store:</p>
<ul>
<li>Laboratory result certificates</li>
<li>CHECS monitoring programme letters</li>
<li>AHDB correspondence</li>
<li>Vet recommendations or health plan sections relating to Johne's control</li>
</ul>
<p>Red Tractor Dairy and Beef &amp; Lamb standards require Johne's monitoring records to be retained for a minimum of three years.</p>`,
  ],
  // 254 — Campylobacter Monitoring — Year Filter, Print Report and Record Attachments
  [
    "Campylobacter Monitoring records now include a year filter, a formatted A4 print report for Red Tractor Poultry assessors, and a RecordAttachments panel in the view dialog for NCP lab reports and correspondence.",
    `<h2>Campylobacter Monitoring — Year Filter, Print Report and Record Attachments</h2>
<p>The Campylobacter Monitoring tab (Poultry Production → Campylobacter Monitoring) records every flock's Campylobacter National Control Programme (NCP) test result as required by Red Tractor Poultry standards for all broiler flocks entering the food chain.</p>
<h3>Year filter</h3>
<p>A year dropdown at the top of the Campylobacter Monitoring tab defaults to the current year. Select any past year to review historical NCP records — useful when an assessor requests evidence from a previous production year.</p>
<h3>Print report</h3>
<p>A <strong>Print Report</strong> button generates a formatted A4 landscape compliance report covering all Campylobacter Monitoring records for the selected year. The report includes:</p>
<ul>
<li>Farm name, CPH number, flock details, and report date</li>
<li>Each NCP test: flock, slaughter date, slaughter house, test type (neck skin pooled swab, boot swab, or caecal content), FSA submission reference, result (Negative / Low Positive / Positive), and biosecurity interventions applied following a positive finding</li>
</ul>
<p>This report is designed for direct inclusion in a Red Tractor Poultry audit pack.</p>
<h3>Document attachment on rows</h3>
<p>Every Campylobacter Monitoring record row has a compact attach/view button. Attach NCP lab reports, FSA correspondence, or biosecurity action plans directly against the specific monitoring record.</p>
<h3>RecordAttachments panel in the view dialog</h3>
<p>Opening any Campylobacter Monitoring record shows a full <strong>RecordAttachments panel</strong> in the view dialog alongside the structured record data. This gives a complete evidence file for each individual NCP test result, with all documents accessible in one place during an audit.</p>`,
  ],
  // 255 — Organic Livestock Outdoor Access Log — Year Filter and Document Attachment on Rows
  [
    "The Outdoor Access Log in Organic Livestock now has a year filter and compact document attachment on every row for uploading grazing evidence, paddock maps, and certifier inspection notes.",
    `<h2>Organic Livestock Outdoor Access Log — Year Filter and Document Attachment</h2>
<p>The Outdoor Access Log (Organic Livestock → Outdoor Access) records every grazing event, outdoor space allocation, and stocking density observation required by UK Organic Regulations for organic livestock.</p>
<h3>Year filter</h3>
<p>A year dropdown at the top of the Outdoor Access Log defaults to the current year — matching the current organic certification period for quick review. Select a previous year to retrieve historic records for your certifier's annual inspection or to respond to a compliance query.</p>
<h3>Document attachment on rows</h3>
<p>Every Outdoor Access Log record row has a compact attach/view button. Click it to upload documents and link them permanently to that specific grazing event record. Useful file types include:</p>
<ul>
<li>Paddock maps and field boundary plans</li>
<li>Grazing evidence photos</li>
<li>Certifier inspection notes referencing outdoor access</li>
<li>Third-party stocking density assessments</li>
</ul>
<h3>Compliance context</h3>
<p>UK Organic Regulations require that organic livestock have continuous access to outdoor pasture whenever conditions allow, with stocking density not exceeding the limits set for each species. The Outdoor Access Log provides the dated evidence trail that your certifying body inspector (Soil Association, OF&amp;G, or equivalent) will review at your annual organic inspection.</p>`,
  ],
  // 256 — Organic Dairy Feed & Nutrition Tab — Year Filter and Document Attachment on Rows
  [
    "The Feed & Nutrition tab in Organic Dairy now has a year filter and compact document attachment on every row for uploading delivery notes, organic approval certificates, and certifier correspondence.",
    `<h2>Organic Dairy Feed &amp; Nutrition Tab — Year Filter and Document Attachment</h2>
<p>The Feed &amp; Nutrition tab (Organic Dairy → Feed &amp; Nutrition) surfaces organic feed delivery records from Feed Management for the organic dairy herd, with derogation tracking and certifier approval reference recording.</p>
<h3>Year filter</h3>
<p>A year dropdown at the top of the Feed &amp; Nutrition tab defaults to the current year. Select a previous year to review the complete organic feed record for any past certification period — for example when preparing for your annual organic inspection or responding to a certifier audit query.</p>
<h3>Document attachment on rows</h3>
<p>Every Feed &amp; Nutrition record row has a compact attach/view button. Use it to upload and permanently link:</p>
<ul>
<li>Feed delivery notes from the supplier</li>
<li>Organic product certification documents (supplier organic certificates)</li>
<li>Certifier approval letters for non-organic ingredients used under derogation</li>
<li>Availability search evidence (OFIS / UKOAS searches) supporting a derogation application</li>
</ul>
<h3>Relationship to Organic Livestock Feed Derogations</h3>
<p>Where a feed delivery is not fully organic-approved, the Feed &amp; Nutrition tab shows a <strong>Link to Approved Derogation Case</strong> picker. Selecting an approved derogation case from the Organic Livestock module auto-fills the certifier approval reference — the document attached to the derogation case and the document attached to the feed record together form a complete, inspector-ready evidence chain without any re-keying.</p>`,
  ],
  // 257 — Season Production Report — Gross Margin and Financial Summary
  // Dairy Mobility Scoring — Per-Animal Records, Prevalence and Mobile Recording (inserted before Season Production Report to maintain index order)

  // Season Production Report — Gross Margin and Financial Summary
  [
    "How to use the Season Production Report in BDE Farm Trac to view total crop input costs, revenue, and gross margin per crop season.",
    `<h2>Season Production Report — Gross Margin and Financial Summary</h2>
<p>The Season Production Report brings every record for a crop season together in one place — drilling, fertiliser, spray applications, and harvest — and adds a Financial Summary section that calculates total input costs, revenue, and gross margin automatically from the figures you have already entered across those records.</p>
<h3>Opening the report</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Season Reports</strong> and select a crop season from the dropdown. The report loads all linked records for that season and field combination.</p>
<h3>Financial Summary section</h3>
<p>At the top of the report, a KPI summary strip shows key financial metrics for the season at a glance. Below it, the Financial Summary section breaks down costs and revenue into five lines:</p>
<ul>
<li><strong>Total Seed Cost (£):</strong> the sum of seed cost per kg multiplied by seed rate and area across all seed drilling records for the season. Requires the Seed Cost (£/kg) field to be completed on each drilling record.</li>
<li><strong>Total Fertiliser Cost (£):</strong> the sum of Total Cost (£) recorded against all NVZ fertiliser application records linked to this season's fields. Requires the Total Cost (£) field to be completed on each application record.</li>
<li><strong>Total Spray Cost (£):</strong> the sum of product cost per unit multiplied by dose rate and area across all spray application records for the season. Requires the Product Cost (£/unit) field to be completed on each spray record.</li>
<li><strong>Total Input Costs (£):</strong> the combined total of seed, fertiliser, and spray costs.</li>
<li><strong>Revenue (£):</strong> total yield (tonnes) multiplied by the Sale Price (£/t) recorded on the harvest record. Requires the Sale Price (£/t) field to be completed on the harvest record.</li>
<li><strong>Gross Margin (£ and £/ha):</strong> Revenue minus Total Input Costs. Also expressed per hectare using the total area harvested. The Gross Margin tile turns red when the margin is negative.</li>
</ul>
<h3>Where cost data comes from</h3>
<p>The Financial Summary draws entirely from data you have already entered elsewhere in BDE Farm Trac — no additional re-entry is required. The four cost fields that feed the report are:</p>
<ul>
<li><strong>Sale Price (£/t)</strong> — on each Harvest Record (Field &amp; Crop Management → Harvest Records)</li>
<li><strong>Seed Cost (£/kg)</strong> — on each Seed Drilling Record (Field &amp; Crop Management → Seed Drilling)</li>
<li><strong>Total Cost (£)</strong> — on each NVZ Fertiliser Application (Nutrient Management → NVZ Applications)</li>
<li><strong>Product Cost (£/unit)</strong> — on each Spray Application (Sprays &amp; Inputs → Applications)</li>
</ul>
<p>If any cost field is left blank for a record, that record contributes £0 to the relevant cost line. The report clearly shows which records have costs recorded and which do not, so you can identify and fill any gaps.</p>
<h3>Cost columns in the detail tables</h3>
<p>Each of the four data tables within the report — Seed Drilling, Fertiliser Applications, Spray Applications, and Harvest — includes a cost column showing the cost figure recorded against each individual record. This lets you review and cross-check costs line by line before relying on the Financial Summary totals.</p>
<h3>Partial data and incomplete seasons</h3>
<p>The report can be opened at any point during the season — it will show costs and revenue for whichever records have been completed so far. If harvest has not yet been recorded, Revenue and Gross Margin will show as £0 or be omitted from the summary. This lets you use the report part-way through the season to track input costs as they accumulate.</p>`,
  ],
  // 258 — Dairy Mobility Scoring — Per-Animal Records, Prevalence and Mobile Recording
  // Dairy Mobility Scoring — Per-Animal Records, Prevalence and Mobile Recording
  [
    "How to record individual per-animal dairy mobility scoring sessions in BDE Farm Trac, including AHDB 0–3 scoring, prevalence calculation, and mobile recording.",
    `<h2>Dairy Mobility Scoring — Per-Animal Records, Prevalence and Mobile Recording</h2>
<p>BDE Farm Trac's Dairy Mobility Scoring module records individual animal lameness assessments using the AHDB 0–3 scale. Each session stores one scored record per named animal, enabling a per-cow lameness history, herd prevalence trending across sessions, and the individual-level audit evidence required by Red Tractor Dairy standards.</p>
<h3>Recording a mobility scoring session</h3>
<p>Navigate to <strong>Livestock → Dairy → Mobility Scoring</strong> and click <strong>New Scoring Session</strong>. Enter the session date, assessor name, and any pen or group notes. In the Animals section, score each animal individually:</p>
<ul>
<li><strong>Ear tag:</strong> enter or scan the animal's BCMS ear tag number to identify the individual.</li>
<li><strong>Score (0–3):</strong> select from the AHDB locomotion scale — 0 (sound), 1 (imperfect locomotion — minor gait change), 2 (lame — clear gait abnormality), 3 (severely lame — obvious lameness with weight-bearing difficulty).</li>
<li><strong>Notes:</strong> optional free-text observation for that animal (e.g. "left hind — suspected white line disease; foot bathed").</li>
</ul>
<p>Add as many animals as were assessed in the session. Each animal's entry is saved as a separate child record linked to the session header. This builds a complete per-animal scoring timeline across all future sessions without requiring a new session record for each individual animal.</p>
<h3>Prevalence calculation</h3>
<p>The session calculates lameness prevalence automatically — the percentage of assessed animals scoring 2 or 3 out of the total assessed. This is the AHDB industry-standard metric and the figure Red Tractor Dairy assessors reference during inspections. A colour-coded badge flags sessions where prevalence exceeds the Red Tractor Dairy threshold, prompting investigation and corrective action.</p>
<h3>Viewing a session</h3>
<p>Clicking a session row (or the eye icon) opens a read-only view dialog showing the session date, assessor, pen context, the full per-animal table (ear tag, score, notes), and the calculated prevalence. An Edit button in the dialog footer opens the edit form if any corrections are needed — this view-before-edit approach prevents accidental changes to previously submitted assessments.</p>
<h3>Mobile recording</h3>
<p>Mobility scoring sessions can be captured on the BDE Farm Trac mobile app while walking the herd. Tap <strong>Record → Dairy → Mobility Scoring</strong>, enter the session header, and score animals one at a time as you walk the row. Records save offline if there is no connectivity and sync to the dashboard automatically when restored. The prevalence figure is recalculated server-side after each sync so it always reflects the complete per-animal list.</p>
<h3>Printable report</h3>
<p>Every session has a <strong>Print Report</strong> button generating a formatted A4 document that shows the session date, assessor, pen, all individual animal scores and notes, and the calculated prevalence percentage. This is designed for presentation at herd health reviews and Red Tractor Dairy assessor visits.</p>`,
  ],
  // 259 — Seed Drilling Records — Crop Variety, Seed Rate, Treated Seed and Season Cost Tracking
  // Seed Drilling Records — Crop Variety, Seed Rate, Treated Seed and Season Cost Tracking
  [
    "How to record seed drilling events in BDE Farm Trac, covering variety, seed lot number, treated seed, seed rate, and seed cost for Season Production Report gross margin.",
    `<h2>Seed Drilling Records — Crop Variety, Seed Rate, Treated Seed and Season Cost Tracking</h2>
<p>Seed Drilling Records in BDE Farm Trac capture every aspect of a drilling operation — from crop variety and seed lot number through to treated seed details and seed cost per kilogram — providing both an agronomic audit trail and the input cost data that feeds the Season Production Report gross margin calculation.</p>
<h3>Adding a seed drilling record</h3>
<p>Navigate to <strong>Field &amp; Crop Management → Seed Drilling</strong> and click <strong>Add Seed Drilling Record</strong>. The form captures:</p>
<ul>
<li><strong>Drilling date:</strong> the date the seed was drilled into the ground.</li>
<li><strong>Field:</strong> selected from your registered field list. The field's crop assignment for the current season is updated automatically.</li>
<li><strong>Crop and variety:</strong> the crop type and, where relevant, the variety name for variety-level traceability (e.g. winter wheat — KWS Extase).</li>
<li><strong>Seed lot number:</strong> the lot or batch reference from the seed bag or invoice — enables traceability to the specific commercial seed batch if a recall or quality concern arises.</li>
<li><strong>Seed rate (kg/ha):</strong> the sowing rate used.</li>
<li><strong>Area seeded (ha):</strong> total hectares drilled in this operation.</li>
<li><strong>Treated seed:</strong> toggle on if the seed was dressed with a pesticide or biological treatment. When toggled, a <strong>Treatment Product</strong> field appears — record the dressing product name (e.g. Vibrance Duo, Redigo Deter). This is required under BBSRC seed stewardship guidelines and may be requested by your agronomist or assurance scheme assessor.</li>
<li><strong>Operator:</strong> selected from your staff register — the person who carried out or oversaw the drilling operation.</li>
<li><strong>Seed cost (£/kg):</strong> the price per kilogram from the seed invoice. Combined with seed rate and area drilled, this is used by the Season Production Report to calculate total seed input cost and gross margin contribution for the season.</li>
<li><strong>Soil conditions:</strong> a qualitative assessment of seedbed conditions — Very Good, Good, Moderate, Poor, or Very Poor — for agronomic review and establishment risk assessment.</li>
<li><strong>Weather notes:</strong> free-text observations on conditions at the time of drilling (e.g. "light frost overnight, dry surface conditions").</li>
<li><strong>Notes:</strong> any additional agronomic context or observations.</li>
</ul>
<h3>Viewing and editing records</h3>
<p>Each seed drilling record can be opened in a read-only view dialog by clicking the row or the eye icon in the table. The view dialog displays all fields — including treated seed indicator and product, soil conditions, and weather notes — alongside an <strong>Edit</strong> button in the footer for any post-submission corrections. This view-before-edit approach prevents accidental changes to submitted drilling records.</p>
<h3>Season Production Report integration</h3>
<p>The seed cost (£/kg) recorded here is picked up automatically by the <strong>Season Production Report</strong> (Field &amp; Crop Management → Season Reports). The report multiplies cost by seed rate and area drilled across all records for the season to produce a <strong>Total Seed Cost</strong> line in the Financial Summary. No re-entry is required — completing the Seed Cost (£/kg) field on each drilling record is sufficient.</p>`,
  ],
  // 260 — Invoice Branding — Farm Logo, Company Details, VAT Number and Bank Information on Invoices
  // Invoice Branding — Farm Logo, Company Details, VAT Number and Bank Information on Invoices
  [
    "How to configure invoice branding in BDE Farm Trac — uploading your farm logo, company details, VAT number, and bank information to appear on all invoices.",
    `<h2>Invoice Branding — Farm Logo, Company Details, VAT Number and Bank Information on Invoices</h2>
<p>BDE Farm Trac prints your farm's logo, registered company details, VAT number, and bank payment information on every invoice generated through the platform — whether raised from the Farm Services &amp; Contracting module, the Workshop module, or livestock trading records. These details are configured once in Farm Settings and apply automatically to all future invoices.</p>
<h3>Where to configure invoice branding</h3>
<p>Navigate to <strong>Settings → Farm Settings</strong>. The Invoice &amp; Branding section contains the following fields:</p>
<ul>
<li><strong>Farm logo:</strong> upload a PNG or JPEG logo file. The logo appears in the top-left corner of every printed invoice. Recommended size is at least 200 × 80 px. If no logo is uploaded, the farm name is displayed as a text heading instead.</li>
<li><strong>Company name:</strong> your registered trading or company name as it should appear on invoices. This may differ from your farm name if you trade through a separate legal entity.</li>
<li><strong>VAT registration number:</strong> your HMRC-issued VAT number (e.g. GB 123 4567 89). Appears on every invoice beneath the company name. Required if you are VAT-registered and issuing VAT invoices.</li>
<li><strong>Company registration number:</strong> your Companies House registration number if applicable (for limited companies or LLPs).</li>
<li><strong>Invoicing address:</strong> the address printed at the top of invoices — typically your registered office or main farm address.</li>
<li><strong>Bank name, sort code, and account number:</strong> payment details printed in the footer of every invoice so recipients can make BACS payments without needing to contact you separately.</li>
<li><strong>Payment terms:</strong> your standard payment terms text (e.g. "Payment due within 30 days of invoice date") printed below the invoice totals.</li>
</ul>
<h3>When changes take effect</h3>
<p>Changes saved to Farm Settings apply immediately to all invoices generated after the save. Previously issued invoices retain the branding that was current at the time of generation and are not retroactively updated.</p>
<h3>Multi-farm accounts</h3>
<p>Each farm holding in a multi-farm account has its own independent invoice branding settings. Switch between farms using the farm selector in the sidebar, then navigate to Settings → Farm Settings to configure the branding for that specific holding. This allows group farming businesses to trade under different legal entities from a single BDE Farm Trac account.</p>`,
  ],
  // 261 — LIS One-Click Submission — Connecting Your Livestock Information Service Account
  // LIS One-Click Submission — Connecting Your Livestock Information Service Account
  [
    "How to connect your Livestock Information Service (LIS) account to BDE Farm Trac and submit sheep, goat, and deer movement records to the England CLA API with a single click.",
    `<h2>LIS One-Click Submission — Connecting Your Livestock Information Service Account</h2>
<p>BDE Farm Trac integrates with the England Livestock Information Service (LIS) to submit sheep, goat, and deer movement records directly to the government CLA (Cattle &amp; Livestock API) with a single click — without leaving the dashboard. This removes the need to log into the APHIS Online portal separately for each movement notification.</p>
<h3>Connecting your LIS account</h3>
<p>Navigate to <strong>Settings → Farm Settings → Livestock Integration</strong>. In the LIS section:</p>
<ol>
<li>Enter your <strong>LIS Client ID</strong> and <strong>Client Secret</strong> — issued by the Livestock Information Service when you register as a CLA API user. Contact LIS support at livestock.information@defra.gov.uk to request API credentials if you do not have them.</li>
<li>Select the <strong>Environment</strong> — Beta Sandbox for testing without affecting live government records, or Production for live submissions.</li>
<li>Click <strong>Save &amp; Test Connection</strong>. BDE Farm Trac sends an authentication request to the LIS API and shows a green Connected badge on success, or an error message with the response from LIS if the credentials are invalid.</li>
</ol>
<h3>Submitting a movement</h3>
<p>Once connected, each sheep, goat, or deer movement record in <strong>Livestock → Movements</strong> shows a <strong>Submit to LIS</strong> button in the row actions. Clicking it:</p>
<ol>
<li>Sends the movement data to the LIS CLA API — CPH numbers, ear tag list, movement date, haulier details, and AML licence number.</li>
<li>On success, stores the LIS reference number returned by the API against the movement record and shows a green <strong>LIS Submitted</strong> badge on the row.</li>
<li>On failure, displays the error response from LIS (e.g. unknown ear tag, CPH mismatch) so you can correct the record and resubmit.</li>
</ol>
<h3>Submission history</h3>
<p>Expanding any submitted movement row reveals the full submission log — timestamp, status, LIS reference number, and the JSON payload that was sent. This provides a complete audit trail of what was submitted, when, and what response was received from LIS, which may be requested during a cross-compliance inspection.</p>
<h3>Sandbox mode</h3>
<p>While connected to the LIS Beta Sandbox, submissions are test-only and do not appear on the live government system. All test submissions are clearly labelled in the submission history. Switch to the Production environment in Farm Settings once you are satisfied with the integration and ready to submit live records.</p>
<h3>Scotland, Wales and Northern Ireland</h3>
<p>The LIS one-click integration covers England movements only (England CLA API). For Scotland, movements are reported to ScotEID via ScotMoves+. BDE Farm Trac captures all fields required for a ScotMoves+ manual submission — CPH numbers, ear tag lists, movement dates, haulier details, and AML reference numbers — which can be exported to assist with portal data entry.</p>`,
  ],
  // 262 — LIS LIP One-Click Cattle Submission — Connecting via LIS Account Sign-In
  // LIS LIP One-Click Cattle Submission — Connecting via LIS Account Sign-In
  [
    "How to connect each farm's LIS account to BDE Farm Trac and submit cattle movements, births, and deaths directly to the Livestock Information Platform (LIP) API.",
    `<h2>LIS LIP One-Click Cattle Submission — Connecting via LIS Account Sign-In</h2>
<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:0.875rem 1rem;margin-bottom:1rem">
<strong>⚠ Service temporarily paused — effective 21 July 2026</strong><br>
The Livestock Information Service has confirmed that LIP Cattle API submissions are temporarily paused while cattle traceability services transition to a new Defra-operated service. New LIP cattle submissions cannot be made at this time. Please continue reporting cattle movements by submitting on <strong>BCMS Online</strong> (www.bcms.gov.uk) and using the <strong>Record BCMS Ref</strong> button on each cattle movement row in the dashboard to log your confirmation reference. LIS will provide further guidance and a revised migration approach in September/October 2026 ahead of the BEID mandate in 2027. This article is retained for reference — the LIP integration will resume once the new Defra service is available.
</div>
<p>BDE Farm Trac integrates with the Livestock Information Platform (LIP), the government cattle movement and recording system operated by the Livestock Information Service (LIS). Once connected, cattle movements, births, and deaths can be submitted directly to the LIP API with a single click from the Livestock Movements page — without leaving the dashboard.</p>
<p>LIP uses a delegated <strong>per-farm OAuth sign-in</strong>. Each farm holding connects its own LIS account independently, meaning the farmer signs in with their existing LIS credentials rather than entering API keys. This mirrors how a farmer would log in to the LIS online portal, but the authorisation is held securely by BDE Farm Trac so submissions can be made on their behalf.</p>
<h3>Connecting a farm's LIS account</h3>
<p>Navigate to <strong>Settings → Farm Settings</strong> and scroll to the <strong>Livestock Information Platform (LIP)</strong> section.</p>
<ol>
<li>Click <strong>Connect LIS Account</strong>. A new browser tab opens showing the LIS sign-in page (hosted by the government Azure B2C identity service).</li>
<li>Sign in with the farm's LIS username and password — the same credentials used to log in to the LIS online portal.</li>
<li>After successful sign-in, the tab closes and Farm Settings shows a green <strong>Connected</strong> badge with the account name.</li>
<li>The connection is stored securely against this farm holding. It does not need to be repeated unless the LIS account password changes or the connection is manually disconnected.</li>
</ol>
<p>In a multi-farm account, each farm holding connects its own LIS account independently. Switch between farms using the farm selector in the sidebar and repeat the connection step for each holding.</p>
<h3>Submitting a cattle movement</h3>
<p>Once connected, open <strong>Livestock → Movements</strong>. Each cattle movement row shows a <strong>Submit to LIP</strong> button in the actions column. Clicking it:</p>
<ol>
<li>Sends the movement data to the LIS LIP API — holding CPH, ear tag numbers, movement date, movement type (on/off), and destination or origin CPH.</li>
<li>On success, stores the LIP reference number against the movement record and shows a <strong>LIP Submitted</strong> badge.</li>
<li>On failure, shows the error returned by the LIP API (for example, an unrecognised ear tag or CPH mismatch) so you can correct the record and resubmit.</li>
</ol>
<h3>Submitting cattle births and deaths</h3>
<p>LIP submission is also available for cattle births and deaths:</p>
<ul>
<li><strong>Births</strong> — from the Livestock Mortality Log, cattle calving records with a live outcome can be submitted to LIP to register the new calf. The dam's ear tag, birth date, and calf sex are included in the payload.</li>
<li><strong>Deaths</strong> — cattle mortality records can be submitted to LIP to notify the death. The animal ear tag, date of death, and cause category are included.</li>
</ul>
<h3>LIP Submissions tab</h3>
<p>The <strong>LIP Submissions</strong> tab in Livestock → Movements shows a full history of all LIP submissions for this farm — movement, birth, and death notifications — with the submission date, type, status, LIP reference number, and a link back to the originating record. Expanding any row reveals the full JSON payload that was sent and the API response received, providing a complete audit trail for cross-compliance purposes.</p>
<h3>Sandbox mode</h3>
<p>During initial setup and testing, LIP connections operate in <strong>sandbox mode</strong>. Submissions in sandbox mode are sent to the LIS test environment and do not affect live government records. All sandbox submissions are clearly labelled in the LIP Submissions tab. Sandbox mode is automatically used while the LIS LIP Alpha and sandbox APIs are the active environment; production mode will be available once LIS publish their production API endpoint.</p>
<h3>Relationship to BCMS</h3>
<p>LIP and BCMS are two separate cattle reporting routes. LIP is the newer LIS-operated platform; BCMS is the existing British Cattle Movement Service operated by APHA. BDE Farm Trac supports both — LIP submissions will resume once the Defra service transition is complete; in the meantime use BCMS Online with the Record BCMS Ref button on each movement row.</p>`,
  ],
  // 263 — Black-grass Five-in-Five Tracker — Cultural Control Scoring and Herbicide Resistance Risk
  // Black-grass Five-in-Five Tracker — Cultural Control Scoring and Herbicide Resistance Risk
  [
    "How the Black-grass Five-in-Five tracker scores a field's cultural control diversity over its last five seasons and flags herbicide resistance risk.",
    `<h2>Black-grass Five-in-Five Tracker — Cultural Control Scoring and Herbicide Resistance Risk</h2>
<p>The Black-grass Five-in-Five tracker measures how consistently a field has used cultural (non-chemical) black-grass control methods over its last five cropping seasons, following the well-established "Five-in-Five" principle: using at least five different cultural control pillars across five years significantly reduces black-grass seed return and slows herbicide resistance.</p>
<h3>Flagging a field for tracking</h3>
<p>Open <strong>Field &amp; Crop Management → Fields</strong>, edit a field, and tick <strong>Black-grass risk field</strong>. Only flagged fields are scored and appear in the tracker — use this for fields with a known or suspected black-grass problem.</p>
<h3>The five pillars</h3>
<p>Each season, the tracker checks your existing records for evidence of each pillar being used on that field:</p>
<ul>
<li><strong>Rotational ploughing</strong> — a ploughing operation logged for that field in that season.</li>
<li><strong>Delayed drilling</strong> — the drilling date recorded in Seed Drilling Records falls after the season's delayed-drilling threshold.</li>
<li><strong>Spring cropping</strong> — the crop grown that season is a spring-sown crop rather than a winter crop.</li>
<li><strong>Higher seed rate</strong> — the recorded seed rate exceeds the standard benchmark rate for that crop.</li>
<li><strong>Fallow or cover crop</strong> — the field's land use that season is recorded as fallow, cover crop, or an equivalent stewardship option.</li>
</ul>
<h3>Reading the score</h3>
<p>In <strong>Fields → Crop History</strong>, each flagged field shows a five-year × five-pillar grid with a tick for every pillar used in every season, and a distinct-pillar count. Scoring at least five distinct pillars across the five seasons meets the Five-in-Five target; fields falling short are highlighted so you can plan a pillar you haven't used recently into next season's rotation.</p>
<h3>Herbicide MOA repetition risk</h3>
<p>Record each herbicide product's <strong>MOA/HRAC group</strong> on the product record in Sprays &amp; Inputs (shown when the product category is Herbicide). The tracker checks grass-weed herbicide applications on the field and flags a resistance-risk warning if the same MOA group has been used in three or more consecutive seasons — a strong driver of herbicide resistance development.</p>
<h3>Farm-wide rollup</h3>
<p><strong>Season Reports → Black-grass Five-in-Five</strong> shows a farm-wide summary card: the percentage of flagged fields meeting the five-pillar target this rotation, and a list of at-risk fields — those missing pillars or showing MOA group repetition — so problem fields can be prioritised in next season's cropping plan.</p>`,
  ],
  // 264 — Horticulture Module — Overview
  // 264 — Horticulture Module — Overview
  [
    "What the Fresh Produce module covers and how it maps to Red Tractor Fresh Produce compliance.",
    `<h2>Horticulture Module — Overview</h2>
<p>The <strong>Fresh Produce</strong> module (found under Specialist Modules → Fresh Produce) is a full lifecycle management system for growers, covering everything from growing blocks through to harvest, intake, packing and despatch. It is designed to satisfy the <strong>Red Tractor Fresh Produce (CP &amp; CB)</strong> assurance standard.</p>
<h3>The seven tabs</h3>
<ul>
<li><strong>Blocks</strong> — growing blocks and field sections, including linking blocks to parent fields on mixed farms and drawing block boundaries on the map.</li>
<li><strong>Crops</strong> — a crop register for specific plantings: variety, seed supplier, lot number, sowing/transplanting dates and growing method (open field, protected cropping, hydroponics).</li>
<li><strong>Water Tests</strong> — irrigation water quality results, including microbial counts (E.coli, Salmonella) and chemical analysis (pH, nitrates), with next-test-due tracking.</li>
<li><strong>Harvest</strong> — daily harvest records: batch reference, grading (Grade A/B/C/Waste) and Pre-Harvest Interval (PHI) compliance.</li>
<li><strong>Intake</strong> — produce arriving into pre-cooling or storage, including condition-on-arrival checks and temperature monitoring.</li>
<li><strong>Packhouse</strong> — packing and despatch records, linking harvest batches to customers and traceability codes.</li>
<li><strong>Allergens</strong> — documented reviews of allergen risk, cross-contamination controls and label verification.</li>
</ul>
<h3>Traceability</h3>
<p>Every record links: growing block → crop → harvest batch → intake → packhouse despatch, giving full farm-to-customer traceability in one place, ready to show an auditor.</p>`,
  ],
  // 265 — Getting Started with Horticulture Records
  // 265 — Getting Started with Horticulture Records
  [
    "A first-time setup guide for the Fresh Produce module — blocks, crops, and your first harvest record.",
    `<h2>Getting Started with Horticulture Records</h2>
<p>Follow these steps the first time you set up the Fresh Produce module.</p>
<h3>1. Enable the module</h3>
<p>Ask your farm administrator to enable <strong>Fresh Produce</strong> under Specialist Modules if you don't see it in the navigation.</p>
<h3>2. Set up your Blocks</h3>
<p>Go to <strong>Fresh Produce → Blocks</strong> and add each growing block. If a block sits within a mixed farm, link it to its parent field so organic and NVZ status carry across automatically. Optionally draw the block boundary on the map.</p>
<h3>3. Register your Crops</h3>
<p>In the <strong>Crops</strong> tab, record each planting: variety, seed supplier and lot number, seed treatment status, sowing/transplanting date, and growing method (open field, protected cropping, or hydroponics).</p>
<h3>4. Log Water Tests</h3>
<p>If you irrigate, add a water test result for each source under <strong>Water Tests</strong> — microbial and chemical results — and set a next-test-due date so you get a reminder.</p>
<h3>5. Record your first Harvest</h3>
<p>When you start harvesting, add a record under <strong>Harvest</strong> with the batch reference, grade split and the Pre-Harvest Interval for any sprays applied to that crop.</p>
<h3>6. Track Intake and Packhouse</h3>
<p>As produce moves into storage or packing, log it under <strong>Intake</strong> (condition on arrival, temperature) and <strong>Packhouse</strong> (customer, traceability code) to complete the chain.</p>
<h3>7. Review Allergens periodically</h3>
<p>Use the <strong>Allergens</strong> tab to record a periodic management review of allergen risks and cross-contamination controls — most assurance schemes expect this at least annually.</p>`,
  ],
  // 266 — Horticulture Module — Crop Records, Sprays, and Assurance
  // 266 — Horticulture Module — Crop Records, Sprays, and Assurance
  [
    "How crop records, spray records and PHI tracking work together in the Fresh Produce module for Red Tractor CB compliance.",
    `<h2>Horticulture Module — Crop Records, Sprays, and Assurance</h2>
<p>The Fresh Produce module integrates crop, spray and quality records to build the evidence trail Red Tractor Fresh Produce (CP &amp; CB) auditors expect.</p>
<h3>Crop records</h3>
<p>Each entry in <strong>Crops</strong> captures the variety, seed supplier and lot number, whether the seed was treated, sowing/transplanting date and growing method. This is your planting register — every batch of produce should trace back to a crop record here.</p>
<h3>Spray records and PHI</h3>
<p>Spray and input applications are recorded in <strong>Sprays &amp; Inputs</strong> (Field &amp; Crop Management → Sprays), the same place as arable spray records. When a block is linked to Fresh Produce, its spray history feeds into the <strong>Harvest</strong> tab's Pre-Harvest Interval check, warning you if a harvest date falls inside a product's PHI window.</p>
<h3>Assurance evidence by section</h3>
<ul>
<li><strong>Site management (CP)</strong> — Blocks define and map your growing sites and cold store locations.</li>
<li><strong>Water management (CB)</strong> — Water Tests provide microbial and chemical evidence for irrigation sources.</li>
<li><strong>Harvesting &amp; storage (CB)</strong> — Harvest PHI checks and Intake pre-cooling/temperature logs.</li>
<li><strong>Product safety (CB)</strong> — Intake foreign-body and pest-damage checks, plus Allergen management reviews.</li>
<li><strong>Traceability (CB)</strong> — the Harvest Batch Ref and Traceability Code link every step from block to customer despatch in Packhouse.</li>
</ul>
<p>Keeping all four tabs (Crops, Water Tests, Harvest, Intake/Packhouse, Allergens) up to date gives you a single, exportable record set for your Red Tractor Fresh Produce audit.</p>`,
  ],
  // 267 — NMR Recording Visits — Herd Constituents, SCC and Fat:Protein Ratio Trends
  // 41 — NMR Recording Visits
  [
    "How to log monthly NMR recording visits in BDE Farm Trac, track herd constituent averages, and interpret Fat:Protein Ratio trends for dairy compliance.",
    `<h2>NMR Recording Visits</h2>
<p>The NMR Recording Visits tab in the Dairy module lets you log the results of each monthly visit from your National Milk Records (NMR) recorder. While not a statutory legal requirement, milk recording is effectively mandatory for Red Tractor Dairy assurance — scheme standards require documented evidence of milk quality monitoring, SCC trend management, and herd health surveillance. Most processor contracts also tie milk price to recorded SCC and constituent data.</p>
<h3>Recording a visit</h3>
<p>Navigate to <strong>Dairy → Recording Visits</strong> and click <strong>Log Visit</strong>. The form captures:</p>
<ul>
<li><strong>Visit date</strong> — the date the NMR recorder attended.</li>
<li><strong>Recorder name and NMR employee number</strong> — the recorder's identity for audit purposes.</li>
<li><strong>Cows in milk / Cows recorded</strong> — the number of cows in the milking herd and the number included in the recording round.</li>
<li><strong>Herd averages</strong> — yield per cow per day (litres), fat %, protein %, lactose %, and somatic cell count (SCC, in cells × 1,000/mL).</li>
<li><strong>High-SCC animals</strong> — count of cows above 200,000 cells/mL and a free-text field for their ear tags (comma-separated) to flag animals requiring mastitis investigation.</li>
<li><strong>Quality alert</strong> — any action note or advisory from the NMR report (e.g. "Bulk tank SCC elevated — investigate quarters on cow UK123").</li>
<li><strong>Next visit date</strong> — the scheduled date for the following recording round.</li>
</ul>
<h3>Fat:Protein Ratio (F:P Ratio)</h3>
<p>The Fat:Protein Ratio is calculated automatically as you enter fat % and protein % — no manual calculation needed. The ratio is displayed as a colour-coded badge on both the log form and the recording register:</p>
<ul>
<li><strong>Red — below 1.0:</strong> high risk of subclinical ruminal acidosis; review buffer feeding and ration composition with your nutritionist.</li>
<li><strong>Amber — 1.0 to 1.19:</strong> below target; diet may be short of effective fibre or high in rapidly fermentable carbohydrate.</li>
<li><strong>Green — 1.2 to 1.5:</strong> target range; indicates good rumen function and balanced energy and protein status.</li>
<li><strong>Amber — above 1.5:</strong> may indicate an energy deficit or early ketosis; cows may be mobilising body fat. Review body condition scores and transition cow management.</li>
</ul>
<h3>Trend charts</h3>
<p>Once you have two or more recording visits logged, click <strong>Trend Chart</strong> to open the rolling 24-visit visual analysis. Two charts are shown side by side:</p>
<ul>
<li><strong>Herd Average SCC</strong> — a bar chart with a reference line at 200,000 cells/mL (the EU/UK penalty threshold). Bars above the reference line are immediately visible for management action.</li>
<li><strong>Fat%, Protein% and F:P Ratio</strong> — a dual-axis line chart showing constituent trends (left axis, %) and the Fat:Protein Ratio trend (right axis) together. The 1.2 F:P target is shown as a dashed reference line.</li>
</ul>
<p>Trend charts are the primary tool for spotting seasonal patterns, nutrition transitions, and early warning of herd health issues before they affect milk income or Red Tractor compliance status.</p>
<h3>Mobile recording</h3>
<p>NMR recording visit results can also be logged from the mobile app — useful if you want to capture key figures from the NMR report immediately after the recorder leaves, before you return to the office. Navigate to <strong>Record → NMR Recording Visit</strong> in the mobile app. Results sync to the dashboard automatically when connectivity is restored.</p>`,
  ],
  // 268 — Seed Store — Batch Tracking, Stock Levels and Bag Labels
  [
    "How to log seed batches in BDE Farm Trac's Seed Store, track remaining stock as seed is drilled, and print Avery-format bag labels.",
    `<h2>Seed Store — Batch Tracking, Stock Levels and Bag Labels</h2>
<p>The Seed Store (Field &amp; Crop Management → Seed Store) is a running inventory of the seed batches you've received from suppliers. It underpins traceability for Red Tractor Combinable Crops (batch/lot recording of seed) and removes the need to re-key TGW (thousand grain weight) every time you assign a crop to a field.</p>
<h3>Logging a seed batch</h3>
<p>Click <strong>Log Seed Batch</strong> and record the crop, variety, supplier, batch/lot number, TGW (g), bag weight (kg, defaults to 25kg), quantity received (kg), date received, and any treatment notes (e.g. "Redigo Deter treated"). Quantity received is fixed once logged — stock reduces automatically as the batch is drawn down.</p>
<h3>Stock tracking and low-stock warnings</h3>
<p>Each batch card shows TGW, remaining stock out of the quantity received, and the number of bags remaining at the recorded bag weight. A progress bar colours amber once a batch drops to 15% or less remaining, and batches at zero are marked <strong>Used up</strong>. Use <strong>Show Used-Up Batches</strong> to bring depleted batches back into view for historical reference.</p>
<h3>Linking batches to crop assignments</h3>
<p>When assigning a crop to a field in <strong>Fields</strong>, selecting a seed batch auto-fills the TGW for the seed rate calculator and deducts the drilled quantity from that batch's remaining stock. If a field-crop assignment referencing a batch is later deleted, the allocated stock is automatically restored to the batch.</p>
<h3>Printing bag labels</h3>
<p>From a crop assignment, use <strong>Print Bag Labels</strong> to generate an A4 sheet of Avery-compatible 63.5mm × 38.1mm labels (21 per sheet, 3 columns × 7 rows — the standard "L7160"-style layout). Each label shows the crop, variety, batch number, supplier, TGW, germination % (if recorded), destination field, and planting date, with your farm name and CPH number printed at the bottom for full batch-to-field traceability on the bag or seed box.</p>
<h3>Purchase Orders</h3>
<p>The <strong>Orders</strong> tab provides a purchase-order log for seed procurement. Click <strong>Raise Order</strong> to create an order for a specific crop and variety, recording the supplier, quantity ordered (kg), unit price, and expected delivery date. Each order passes through three stages:</p>
<ul>
<li><strong>Ordered</strong> — the order has been placed with the supplier but no stock has arrived</li>
<li><strong>Part-delivered</strong> — one or more deliveries have been recorded against the order but the full quantity has not yet been received</li>
<li><strong>Delivered</strong> — the full ordered quantity has been received; the order is marked complete</li>
</ul>
<p>When a delivery arrives, record it against the open order with the actual quantity delivered and the batch/lot number from the seed bag. The system checks whether the delivered quantity closes the order or leaves it partially open, and updates the order status accordingly. Recorded deliveries can automatically create the corresponding seed batch record so you don't need to enter the variety, supplier, and batch number twice.</p>
<p>The Orders tab supports filtering by supplier, crop, and status so you can quickly see all outstanding orders waiting for delivery. This is particularly useful when managing large volumes of seed across multiple varieties ahead of drilling.</p>
<h3>Segregation Checks (Red Tractor CR.ST.19)</h3>
<p>The <strong>Segregation Checks</strong> tab provides a dated log of inspections carried out to confirm that treated seed is physically separated from stored grain and other feed, as required by the Red Tractor Combinable Crops standard at criterion <strong>CR.ST.19</strong>. Treated seed (seed dressed with fungicide, insecticide, or nematicide treatments) must never be stored loose in a grain store, and must be separated from stored grain by one of the following methods:</p>
<ul>
<li><strong>Rigid barrier</strong> — a solid physical divider (bay board, wall, or separate bay) between the treated seed and any grain</li>
<li><strong>3 m distance</strong> — a minimum separation of three metres between the treated seed and stored grain in the same space</li>
<li><strong>Separate store</strong> — the treated seed is held in an entirely separate building or room away from grain stores</li>
</ul>
<p>Click <strong>Log Check</strong> to record an inspection: select the storage location, the date of the check, the segregation method in use, and the name of the person who carried out the check. There is a specific field for confirming whether any treated seed is stored loose — if this is answered Yes, the check is marked non-compliant. Use the Notes field to record any remedial action taken or planned.</p>
<p>Non-compliant checks are highlighted in red on the register. The <strong>Print Register</strong> button generates a formatted PDF-ready register of all checks, showing the compliance status of each, suitable for use as evidence during a Red Tractor inspection. The summary at the top of the printout shows the total number of checks and the compliant/non-compliant count at a glance.</p>`,
  ],
  // 269 — Seed Rate Calculator — Establishment-Adjusted Sowing Rates
  [
    "How BDE Farm Trac's seed rate calculator turns a target plant population into a recommended sowing rate, adjusted for soil type and drilling date.",
    `<h2>Seed Rate Calculator — Establishment-Adjusted Sowing Rates</h2>
<p>When assigning a crop to a field, the seed rate calculator (shown alongside the crop assignment form) converts a target plant population into a recommended seed rate in kg/ha, using the same approach an agronomist or seed merchant would apply: seeds/m² = target plants/m² ÷ (establishment % ÷ 100), then seed rate (kg/ha) = seeds/m² × TGW (g) ÷ 100.</p>
<h3>Establishment percentage</h3>
<p>"Establishment %" folds germination and field losses (frost, slugs, seedbed quality, drilling depth) into a single assumption, mirroring standard merchant guidance. BDE Farm Trac starts from a base percentage keyed to the field's recorded soil type (e.g. medium loam ~78%, clay ~65%, sand ~70%) and adjusts it further based on the planned drilling date — early autumn and main spring windows get a positive adjustment, while late-October, November, December, and early-spring drilling reduce the estimate to reflect a harder establishment window. If no soil type is recorded, a general UK arable default (72%) is used.</p>
<h3>Target population and black-grass fields</h3>
<p>The default target population is 250 plants/m² for a standard crop. For fields flagged in the Black-grass Five-in-Five cultural control tracker, the calculator suggests a higher target of 350 plants/m² — reflecting AHDB guidance that a denser crop increases competition against black-grass and supports the "higher seed rate" cultural control pillar.</p>
<h3>Using the result</h3>
<p>The calculator is a starting point, not a replacement for agronomist advice — always sense-check the recommended rate against your variety's specific vigour and your drill's calibration. The calculated seed rate can be carried straight into the crop assignment's seed rate field, and combines with the seed batch's TGW and bag weight to estimate how many bags a field will need.</p>`,
  ],
  // 270 — Silage & Haylage Recording — Additives, Quality Tests and Clamp Safety Checks
  [
    "How to record silage and haylage additive use, quality/dry matter tests, and clamp safety inspections in BDE Farm Trac's Environmental module.",
    `<h2>Silage &amp; Haylage Recording — Additives, Quality Tests and Clamp Safety Checks</h2>
<p>The <strong>Silage &amp; Haylage</strong> tab (Environmental module) sits alongside Slurry &amp; Manure and gives forage-making its own dedicated records, distinct from slurry store management, while sharing the same store register so a clamp's fill level, inspections, and safety status are all tracked from one place.</p>
<h3>Silage clamps vs. slurry stores</h3>
<p>Stores are typed when registered — a store type of <strong>Silage Clamp</strong> is treated distinctly from slurry/manure stores throughout the Environmental module: clamps get additive and quality-test records, and clamp inspections include additional SSAFO structural checks that don't apply to slurry stores. This keeps the weekly planning view and store register from mixing silage-making with slurry management.</p>
<h3>Silage / Haylage additive records</h3>
<p>Log each clamp filling event under <strong>Additive Records</strong>: select the clamp, forage type (Grass Silage, Maize Silage, Wholecrop, Haylage), additive/inoculant product (bacterial inoculant, acid-based additive, or none), application rate, and fill date. This provides the traceability trail for any subsequent quality issues.</p>
<h3>Silage quality &amp; dry matter tests</h3>
<p>Log <strong>Quality / DM% Tests</strong> against a clamp with the test date, dry matter percentage, and any lab-reported metrics (pH, ME, crude protein). If dry matter comes back below 25%, BDE Farm Trac automatically raises a high-priority task flagging the elevated effluent risk and the need to check clamp drainage and effluent containment under the SSAFO regulations.</p>
<h3>Clamp safety inspections</h3>
<p>Silage clamp inspections (logged from the store register) include the standard slurry-store checks plus clamp-specific SSAFO structural checks: effluent containment, cover sheet integrity, and wall soundness. A failed effluent-containment check raises an urgent task warning of a pollution risk and recommends checking drainage/collection and pausing filling until resolved. Any failed check is clearly labelled on the inspection record and rolled into the farm's weekly planning view alongside slurry store tasks.</p>`,
  ],
  // 271 — Crop Rotation Reason Tags and the Field Map Year Selector
  [
    "How to tag the reasoning behind a crop rotation choice and use the field map's year selector to review historical plantings.",
    `<h2>Crop Rotation Reason Tags and the Field Map Year Selector</h2>
<p>Two additions to <strong>Fields</strong> make it easier to plan and review rotations across seasons: reason tags on each crop assignment, and a year selector on the field map for viewing historical plantings.</p>
<h3>Crop rotation reason tags</h3>
<p>When assigning or reviewing a crop for a field, you can attach one or more reason tags explaining why that crop or land use was chosen for the season — for example, "Black-grass suppression", "Break crop", "OSR interval compliance", "Soil structure recovery", or "Scheme requirement". Tags are shown alongside the assignment's notes in the Crop History view, giving a quick-glance rationale for each season's choice without having to open the full record. This is particularly useful when reviewing several years of rotation at once, or when explaining rotation decisions to an agronomist or assessor.</p>
<h3>Crop season — auto-determined from planting date</h3>
<p>The season (Autumn, Winter, Spring, Summer) for a crop assignment is now derived automatically from the planting date as soon as it's entered, using a dropdown that can still be overridden manually if you need to record a season that doesn't match the calendar date (for example, a delayed drilling that's still agronomically an autumn crop). Once you've manually changed the season for an assignment, it stops auto-updating from the date so your manual choice is preserved.</p>
<h3>Field map year selector</h3>
<p>The Field Map now has a year selector so you can step back through previous seasons and see exactly what was planted in each field historically — useful for checking OSR break intervals, reviewing rotation diversity for Black-grass Five-in-Five scoring, or confirming what was cropped in a field before a new tenancy or contract-farming arrangement began. Selecting a past year redraws the map with that season's crop assignments and land use records; switching back to the current year returns to live planning.</p>`,
  ],
  // 272 — IPM Plan — Integrated Pest Management Recording and SFI CIPM Evidence
  [
    "How to create an IPM plan in BDE Farm Trac, record pest-monitoring observations against action thresholds, and generate evidence for Red Tractor and SFI CIPM actions.",
    `<h2>IPM Plan — Integrated Pest Management Recording and SFI CIPM Evidence</h2>
<p>Integrated Pest Management (IPM) is a systematic approach to controlling crop pests, diseases and weeds that prioritises non-chemical controls and targets chemical applications only when pest populations exceed an established economic threshold. Recording IPM activity in BDE Farm Trac satisfies the evidence requirements for Red Tractor Combinable Crops (CR.CP — Crop Protection section), supports SFI action <strong>IPM1</strong> (having an IPM plan) and <strong>IPM2</strong> (pest monitoring), and provides an auditable record for any farm assurance body that requires written evidence of an IPM approach.</p>
<h3>Creating an IPM Plan</h3>
<p>Navigate to <strong>Sprays &amp; Inputs → IPM</strong> and click <strong>New Plan</strong>. Each plan covers a named crop or rotation phase and includes:</p>
<ul>
<li><strong>Plan name</strong> — e.g. "Winter Wheat 2025/26" or "Oilseed Rape 2025/26"</li>
<li><strong>Plan year</strong> — the crop year the plan applies to; this links the plan to the Season Report for that year</li>
<li><strong>Agronomist</strong> — name of the BASIS-qualified agronomist who developed or approved the plan</li>
<li><strong>Status</strong> — Active, Review Due, or Expired; updating status to Review Due prompts a review task in the farm's planning view</li>
<li><strong>Valid from / Valid to</strong> — the date range the plan covers</li>
<li><strong>Review date</strong> — when the plan is next due for formal agronomist review</li>
<li><strong>Strategy summary</strong> — free-text description of the overall IPM strategy for this crop, including cultural controls (varietal resistance, rotation, cultivation timing) before any chemical controls are considered</li>
</ul>
<h3>Threshold Entries</h3>
<p>Once a plan is created, add <strong>Threshold Entries</strong> — the economic action thresholds that trigger a spray decision for each key pest, disease or weed. For each threshold entry, record:</p>
<ul>
<li><strong>Pest / disease / weed</strong> — the target organism (e.g. "Aphids — BYDV vector", "Septoria tritici", "Black-grass")</li>
<li><strong>Threshold type</strong> — Economic threshold (population count), Incidence threshold (% of plants affected), or Disease risk threshold (numeric risk score)</li>
<li><strong>Threshold value</strong> — the numeric level at which a spray response is triggered (e.g. "10 aphids per plant", "75% plants with Septoria on leaf 3")</li>
<li><strong>Monitoring method</strong> — how the population is assessed (e.g. visual assessment, suction trap, sticky trap, AHDB Disease Risk Calculator)</li>
<li><strong>Reference</strong> — the source of the threshold value (AHDB, BASF, agronomist recommendation, etc.)</li>
<li><strong>Notes</strong> — any additional context, such as growth-stage dependency of the threshold</li>
</ul>
<p>Threshold entries are the foundation of IPM compliance evidence — they demonstrate that spray decisions are made on the basis of monitoring data and established thresholds rather than calendar-based prophylactic applications.</p>
<h3>Monitoring Log</h3>
<p>The <strong>Monitoring Log</strong> records the actual field observations made during the season. Each monitoring entry links to a threshold and records:</p>
<ul>
<li><strong>Observation date</strong> — when the field was scouted</li>
<li><strong>Field(s) assessed</strong> — which fields the observation relates to</li>
<li><strong>Observed level</strong> — the count, incidence, or score recorded (e.g. "5 aphids per plant", "20% plants affected")</li>
<li><strong>Threshold breached?</strong> — whether the observed level exceeded the plan's action threshold; this field is critical for audit evidence</li>
<li><strong>Action taken</strong> — if the threshold was breached, what was done: spray product, timing, or justification for delaying treatment (e.g. awaiting natural enemy populations to build, adverse weather)</li>
<li><strong>Observer</strong> — the person who carried out the scout; for BASIS-qualified advisers, this is the agronomist</li>
</ul>
<p>When the threshold is breached and a spray is applied, linking the monitoring log entry to the corresponding spray record in the Spray &amp; Applications tab creates a direct audit trail from pest observation to spray decision — a key requirement for Sustainable Farming Incentive (SFI) action <strong>IPM2</strong>.</p>
<h3>SFI CIPM Actions</h3>
<p>The Sustainable Farming Incentive offers payment under the Countryside IPM (CIPM) actions for farms that can demonstrate an active IPM approach. BDE Farm Trac's IPM module generates the evidence base required for these actions:</p>
<ul>
<li><strong>IPM1 — Annual IPM Plan:</strong> The plan record (with agronomist name, strategy summary, review date, and threshold entries) constitutes the written IPM plan required for IPM1. Export or print the plan directly from the module.</li>
<li><strong>IPM2 — Crop Monitoring:</strong> The monitoring log provides the dated, field-specific observation records that demonstrate regular scouting and threshold-based decisions for IPM2. The "Threshold breached?" and "Action taken" fields directly satisfy the evidence requirement for recorded spray decisions.</li>
<li><strong>IPM3 — Soil Assessment:</strong> Not covered by this module; see Field Records → Soil Tests.</li>
<li><strong>IPM4 — Nutrient Management Plan:</strong> Not covered by this module; see Nutrient Management.</li>
</ul>
<h3>Season Reports — IPM Summary</h3>
<p>The <strong>Season Reports</strong> page includes an <strong>IPM Plans</strong> tab that lists all plans for the selected crop year, showing their status, agronomist, and validity dates. This gives a season-level overview of IPM coverage without navigating back to the Sprays &amp; Inputs section, and provides a convenient single-screen summary for inspections or annual reviews.</p>
<h3>Red Tractor Evidence</h3>
<p>Red Tractor Combinable Crops requires evidence of a written crop protection strategy and that spray decisions are made on the basis of monitoring and threshold assessments. The printed plan and monitoring log together constitute this evidence. Click <strong>Print Plan</strong> from the plan detail view, or export the monitoring log as a CSV file, to produce documentation suitable for a physical audit folder or digital submission.</p>`,
  ],
  // 274 — Resource Planner — Building Your Resource Registry
  [
    "How to build and manage your farm resource registry — import from Equipment Register and Staff, or add custom resources — in the Resource Planner module.",
    `<h2>Resource Planner — Building Your Resource Registry</h2>
<p>The Resource Planner module gives every farm a centralised registry of all resources that can be scheduled against tasks — tractors, implements, sprayers, trailers, vehicles, and named staff. Once resources are in the registry, they can be assigned to tasks in the Week Ahead Gantt view and tracked for availability, preventing double-booking and highlighting pressure points in your farm's workload.</p>
<h3>Accessing the Resource Planner</h3>
<p>Navigate to <strong>Resource Planner</strong> in the main sidebar. The page shows all registered resources grouped by type. If the module has not yet been activated on your subscription, a prompt will guide you to Settings to enable it.</p>
<h3>Importing from your existing farm records</h3>
<p>BDE Farm Trac automatically detects any machinery and staff you have already registered elsewhere in the platform. When you open the Resource Planner, an <strong>Import from your farm records</strong> panel appears at the top of the page showing:</p>
<ul>
<li><strong>Equipment &amp; Machinery</strong> — all active records from your Equipment Register (tractors, implements, sprayers, trailers, vehicles), with make, model, and registration pre-filled as the description</li>
<li><strong>Staff Members</strong> — all active records from your Staff &amp; Training list, with job title pre-filled as the description</li>
</ul>
<p>Tick the items you want to add to the resource registry and click <strong>Import selected</strong>. Each item is created instantly — the resource type is mapped automatically from the equipment category, and a default colour is applied (green for tractors, amber for implements, blue for vehicles, indigo for sprayers, orange for trailers, purple for staff). You can edit the colour and description afterwards using the pencil icon on any resource card.</p>
<p>Items that have already been imported do not appear in the panel again. Once all equipment and staff have been imported, the panel disappears. Use <strong>Select all</strong> to tick everything in one click if you want to bring the entire fleet and team into the planner at once.</p>
<h3>Adding a custom resource</h3>
<p>For resources not held in your Equipment Register or Staff list — for example, a hired contractor, a rented machine, or any specialist item — click <strong>Add custom</strong> and complete the short form:</p>
<ul>
<li><strong>Name</strong> — a clear identifier such as "Hired Telehandler" or "John (contractor)"</li>
<li><strong>Type</strong> — Tractor, Implement, Sprayer, Trailer, Vehicle, Staff / Contractor, or Other</li>
<li><strong>Description</strong> (optional) — registration plate, hire period, specialisation, or any useful note</li>
<li><strong>Colour</strong> — choose from nine preset colours used consistently across all planning views</li>
</ul>
<h3>Resource types</h3>
<p>BDE Farm Trac supports seven resource categories:</p>
<ul>
<li><strong>Tractor</strong> — any self-propelled power unit</li>
<li><strong>Implement</strong> — mounted or trailed implements (plough, drill, cultivator, etc.)</li>
<li><strong>Sprayer</strong> — self-propelled or trailed sprayer units</li>
<li><strong>Trailer</strong> — grain trailers, livestock trailers, flat-beds</li>
<li><strong>Vehicle</strong> — pick-ups, ATV/UTVs, lorries, vans</li>
<li><strong>Staff / Contractor</strong> — named farm workers, operators, or contractors</li>
<li><strong>Other</strong> — any resource that does not fit the above categories</li>
</ul>
<h3>Editing a resource</h3>
<p>Click the pencil icon on any resource card to update its name, description, or colour. The type cannot be changed after creation — if the wrong type was selected, archive the resource and create a new one with the correct type.</p>
<h3>Archiving and restoring resources</h3>
<p>Resources that are no longer in active use (for example, a machine that has been sold or a staff member who has left) can be archived rather than deleted. Archived resources retain all their historical allocation records but are hidden from the assignment picker in the Week Ahead view. Click the archive icon to archive, or the restore icon to bring an archived resource back into active use. All historical records are preserved throughout.</p>
<h3>Resource colour coding</h3>
<p>Each resource is shown in a consistent colour across all planning views — the resource registry cards, the Gantt sidebar, task expanded panels, and conflict detection markers all use the same colour for a given resource. Imported resources get sensible defaults; you can override any colour at any time using the pencil icon. Choose colours that match your own conventions to make the Gantt view instantly readable for your whole team.</p>`,
  ],
  // 275 — Assigning Resources to Tasks — Gantt View, Drag-and-Drop and Conflict Detection
  [
    "How to assign resources to tasks using the Week Ahead Gantt view, including drag-and-drop from the resource sidebar and conflict detection for double-booked resources.",
    `<h2>Assigning Resources to Tasks — Gantt View, Drag-and-Drop and Conflict Detection</h2>
<p>Once resources are registered in the Resource Planner, they can be assigned to tasks in the <strong>Week Ahead</strong> planner's Gantt view. Resource assignments are visible at a glance, and the system automatically flags any resource that is double-booked on the same day.</p>
<h3>Opening the Gantt view with the resource sidebar</h3>
<p>Navigate to <strong>Week Ahead</strong> and switch to Gantt view using the toggle at the top of the page. If you have registered resources, a <strong>Show Resources</strong> button appears above the Gantt chart. Click it to open the resource sidebar on the left-hand side of the chart. The sidebar lists all active resources grouped by type, each shown as a draggable card with its colour dot and name.</p>
<h3>Drag-and-drop assignment</h3>
<p>To assign a resource to a task:</p>
<ol>
<li>Find the resource in the sidebar.</li>
<li>Drag the resource card across to the task bar in the Gantt chart and drop it onto the bar.</li>
<li>The assignment is created immediately — a coloured chip for that resource appears in the task bar and in the task's expanded detail panel.</li>
</ol>
<p>You can assign multiple resources to a single task, and the same resource can be assigned to multiple tasks on different days. All assignments are stored against the task's specific date.</p>
<h3>Assigning resources from the task panel</h3>
<p>You can also manage resource assignments without using drag-and-drop. Click on any task bar in the Gantt view to open the expanded task panel. Scroll to the <strong>Resources</strong> section and use the picker to select a resource from your registry. A chip for the resource appears immediately. To remove an assignment, click the × on its chip.</p>
<h3>Conflict detection</h3>
<p>The Resource Planner automatically checks whether any resource has been assigned to more than one task on the same date. If a conflict is detected:</p>
<ul>
<li>An amber <strong>⚠</strong> icon appears next to the task name in the Gantt chart label column for every task involved in the conflict.</li>
<li>The resource's chip on the task bar is highlighted to draw attention to the clash.</li>
</ul>
<p>Conflicts are recalculated in real time as you add or remove assignments — there is no need to refresh the page. A conflict does not prevent you from saving the assignment; it is an advisory indicator to help you resolve scheduling clashes before they become operational problems.</p>
<h3>Resolving conflicts</h3>
<p>To resolve a conflict, either remove one of the duplicate assignments by clicking the × on its chip in the expanded task panel, or reschedule one of the conflicting tasks to a different date using the Task Board. Once the conflict is resolved, the amber warning icon disappears automatically.</p>
<h3>Resource overview on task bars</h3>
<p>When the resource sidebar is visible, each task bar in the Gantt chart shows up to three small colour-coded dots representing the resources currently assigned to that task. This gives a farm-manager overview of the full week's resource utilisation at a glance — without needing to open each task individually — making it straightforward to spot gaps or overloaded days across the operation.</p>`,
  ],
  // 276 — Enterprise Cost-of-Production Reports — Dairy, Beef, Sheep, Pig, Poultry, Labour and Fleet
  // (articles 277 and 278 appended below)
  [
    "How to use BDE Farm Trac's seven enterprise cost-of-production reports to see cost per litre, per head or per bird across dairy, beef, sheep, pig, poultry, labour and fleet.",
    `<h2>Enterprise Cost-of-Production Reports</h2>
<p>Alongside the crop-focused gross margin and P&amp;L reports, the Finance &amp; Business module's <strong>Business Reports</strong> page includes seven dedicated enterprise cost-of-production reports: <strong>Dairy</strong>, <strong>Beef</strong>, <strong>Sheep</strong>, <strong>Pig</strong>, <strong>Poultry</strong>, <strong>Labour</strong>, and <strong>Fleet/Machinery</strong>. Each report pulls together the operational records you're already keeping — feed, medicine, vet costs, labour, and fixed costs — into a single per-enterprise cost view, without any separate data entry.</p>
<h3>What each report shows</h3>
<p>The livestock reports (Dairy, Beef, Sheep, Pig, Poultry) calculate cost per litre, per head, or per bird by combining feed cost, medicine and vet cost, bedding/housing, labour allocation, and a share of fixed overheads for that enterprise. The Labour report breaks down staff cost by department and enterprise using recorded timesheets, and the Fleet/Machinery report allocates fuel, servicing, depreciation, and repair costs across the equipment used on each enterprise.</p>
<h3>Vet costs</h3>
<p>All five livestock enterprise reports include a dedicated vet cost line, sourced from your Vet Ledger and medicine records, so veterinary spend is properly reflected in the cost per head/litre/bird figure rather than being buried in a general overhead.</p>
<h3>Where to find them</h3>
<p>Navigate to <strong>Finance &amp; Business → Business Reports</strong> and select the enterprise report you want from the report picker. Each report can be filtered by date range/crop year and exported for use with your accountant or when benchmarking against AHDB figures. These sit alongside the farm-wide Season Reports profitability rollup, which prorates rent and overheads across all enterprises for a whole-farm view.</p>`,
  ],
  // 277 — Dairy Supplies — PPE & Chemical Drawdown Recording
  [
    "How to log PPE usage and chemical usage against your stock registers from any dairy section in BDE Farm Trac, keeping stock levels accurate and providing an audit trail.",
    `<h2>Dairy Supplies — PPE &amp; Chemical Drawdown Recording</h2>
<p>The <strong>Supplies</strong> tab on every dairy page (standard Dairy, Sheep Dairy, Goat Dairy, Organic Dairy, Organic Sheep Dairy, and Organic Goat Dairy) gives you a single place to record consumable usage per session and keep your PPE and chemical stock registers accurate without double-entry.</p>
<h3>Where to find it</h3>
<p>Navigate to <strong>Livestock → Dairy</strong> (or the relevant species dairy page) and select the <strong>Supplies</strong> tab. The tab opens with an <strong>Available Stock</strong> panel showing your current PPE quantities and chemical stock levels side-by-side. Items below their low-stock threshold are highlighted amber; items at zero stock show a red badge.</p>
<h3>Logging a PPE drawdown</h3>
<p>Click <strong>Log PPE Usage</strong> to open the drawdown form. Select the PPE item from the dropdown (populated from your PPE Stock Register in Staff &amp; Training), enter the quantity used, confirm the session date (defaults to today), and add any notes. On save, the quantity is deducted from the PPE Stock Register in real time — the same register used by the Staff &amp; Training module — so stock levels remain consistent across the platform.</p>
<p>PPE items available for drawdown include gloves, overshoes, aprons, goggles, face shields, coveralls, and boot covers. Only items currently active in the PPE Stock Register are shown.</p>
<h3>Logging a chemical drawdown</h3>
<p>Click <strong>Log Chemical Usage</strong> to record usage of a cleaning or teat hygiene product. Select the chemical from the dropdown (populated from your spray and chemical stock items), enter the quantity used and the unit, confirm the date, and add notes. On save:</p>
<ul>
<li>The current stock level for that product is reduced by the quantity used.</li>
<li>A stock movement record is created with a <em>dairy-session</em> reference type, linking the deduction directly back to this dairy usage event for full traceability from stock purchase through to point-of-use.</li>
</ul>
<p>Chemicals available include teat dip, udder wash, teat spray, CIP acid detergent, CIP alkaline detergent, disinfectant, and sanitiser — any active stock item in your chemical/spray store.</p>
<h3>Usage History</h3>
<p>All past drawdown records are listed in the <strong>Usage History</strong> section below the stock overview. Use the year filter and the type filter (PPE / Chemical / All) to narrow the list. The <strong>Print Report</strong> button generates a dated usage log suitable for inclusion in an audit pack or for review at a Red Tractor Dairy inspection.</p>
<h3>Dairy type filtering</h3>
<p>Each dairy page (cattle, sheep, goat, organic variants) maintains its own drawdown log, filtered by dairy type. This means a goat dairy's PPE records do not appear in the cattle dairy register and vice versa — keeping each enterprise's supply trail separate and clean.</p>`,
  ],
  // 278 — Dairy Supplies — Restock Request Workflow
  [
    "How to raise a restock request for PPE or dairy chemicals from the Supplies tab and how the admin approval, order, and receipt workflow progresses.",
    `<h2>Dairy Supplies — Restock Request Workflow</h2>
<p>When PPE or chemical stock runs low, the <strong>Supplies</strong> tab lets you raise a formal restock request directly from the dairy page. Requests are routed to the BDE Farm Trac admin team and follow a structured status workflow from approval through to goods received.</p>
<h3>Raising a request</h3>
<p>In the <strong>Supplies</strong> tab, click <strong>Request Restock</strong>. The form asks for:</p>
<ul>
<li><strong>Item type</strong> — PPE or Chemical</li>
<li><strong>Item name / description</strong> — free text describing the product needed</li>
<li><strong>Quantity requested</strong> — how many units or what volume you need</li>
<li><strong>Urgency</strong> — Routine (standard ordering cycle), Urgent (needed within a few days), or Critical (immediate need — stock at zero)</li>
<li><strong>Notes</strong> — any additional information for the admin team (preferred supplier, product code, specification)</li>
</ul>
<p>Click <strong>Submit Request</strong> to send. The request is immediately visible to the admin team in the BDE Admin Portal under <strong>Dairy Restock</strong>.</p>
<h3>Status workflow</h3>
<p>Requests progress through the following statuses:</p>
<ul>
<li><strong>Pending</strong> — submitted by the farm, awaiting admin review</li>
<li><strong>Approved</strong> — admin has reviewed and approved the request; ordering is in progress</li>
<li><strong>Ordered</strong> — the item has been placed with a supplier; awaiting delivery</li>
<li><strong>Received</strong> — goods have arrived; the request is closed</li>
<li><strong>Rejected</strong> — request declined by admin (a rejection reason is recorded and visible on the farm side)</li>
</ul>
<p>You can see the current status of all your requests in the <strong>Restock Requests</strong> section of the Supplies tab, alongside the urgency badge, submission date, and any notes from the admin team.</p>
<h3>Admin Portal view</h3>
<p>The BDE admin team manages all incoming requests through the <strong>Dairy Restock</strong> page in the Admin Portal. Requests can be filtered by status and urgency, and the admin team updates the status (Approve, Mark Ordered, Mark Received, or Reject with reason) from there. Critical-urgency requests are highlighted to ensure prompt action.</p>
<h3>When to use Urgent or Critical</h3>
<p>Use <strong>Urgent</strong> when you have a few days' stock remaining but cannot wait for the next routine order cycle. Use <strong>Critical</strong> when you have zero stock and operations are at risk — for example, no teat dip ahead of milking or no gloves available for DCT. Critical requests are flagged prominently in the admin portal.</p>`,
  ],
  // 279 — Silage & Haylage Stock Tracking — Cut Records, Yield and Clamp Balance
  [
    "How to record silage and haylage cut events with yield data, track the running stock balance per clamp, and log usage drawdowns in BDE Farm Trac.",
    `<h2>Silage &amp; Haylage Stock Tracking — Cut Records, Yield and Clamp Balance</h2>
<p>BDE Farm Trac's <strong>Environmental module → Silage &amp; Haylage</strong> section includes a dedicated <strong>Stock</strong> tab that sits alongside Additive Records, Quality Tests, and Clamp Inspections. It gives you a live forage inventory — showing how many tonnes went into each clamp and how much has been drawn out — without any separate spreadsheet.</p>
<h3>Recording a cut</h3>
<p>Navigate to <strong>Environmental → Silage &amp; Haylage → Cut Records</strong> and click <strong>New Cut Record</strong>. Each entry captures:</p>
<ul>
<li><strong>Forage type</strong> — Grass Silage, Maize Silage, Wholecrop, or Haylage</li>
<li><strong>Cut number</strong> — e.g. 1st, 2nd, 3rd cut of the season</li>
<li><strong>Cutting date</strong> — defaults to today</li>
<li><strong>Field</strong> — selected from your registered field list</li>
<li><strong>Cutting method</strong> — mower, mower-conditioner, forage harvester, or other</li>
<li><strong>Area cut (ha)</strong></li>
<li><strong>Yield (t/ha)</strong> — used to calculate Total Yield automatically</li>
<li><strong>Total yield (t)</strong> — can also be entered directly if you have a weighbridge figure</li>
<li><strong>Additive used</strong> — links to an existing Additive Record or records none</li>
<li><strong>Dry matter %</strong> — at time of cutting if known; can be updated from a Quality Test later</li>
<li><strong>Destination clamp</strong> — the registered Silage Clamp store the cut goes into</li>
<li><strong>Notes</strong></li>
</ul>
<p>Saving the cut record adds the total yield in tonnes to the selected clamp's stock balance automatically.</p>
<h3>Stock balance per clamp</h3>
<p>The <strong>Stock</strong> tab shows a summary card per registered silage clamp. Each card displays:</p>
<ul>
<li><strong>Total in</strong> — sum of all cut record yields directed to that clamp</li>
<li><strong>Total used</strong> — sum of all usage events recorded against that clamp</li>
<li><strong>Current balance</strong> — In minus Used, updated in real time as records are saved</li>
</ul>
<p>A colour-coded balance badge turns amber when the clamp is below 20% of its registered capacity, and red when it reaches zero — giving you an early warning to arrange feed purchases or plan the next cut.</p>
<h3>Recording usage (drawdown)</h3>
<p>Each time you remove silage or haylage from a clamp, log a <strong>Usage Record</strong> on the Stock tab. The form captures the clamp, date, recipient (livestock group, enterprise, or free text), quantity removed in tonnes, and any notes. The running balance updates immediately. Usage records give you a complete clamp-to-animal feeding trail — useful for feed budget reviews and for demonstrating feed provenance in organic certification audits.</p>
<h3>Connecting to Season Reports</h3>
<p>The <strong>Season Reports → Forage tab</strong> aggregates all cut records for the selected harvest year, grouped by forage type and cut number, alongside straw bale totals. This gives you a full forage production balance sheet at the end of each season without any re-entry.</p>`,
  ],
  // 280 — Straw Bale Inventory — Bale Batches, Moisture Checks and Biomass Contracts
  [
    "How to record straw bale batches, log moisture checks, and track biomass contract fields in the BDE Farm Trac Straw Bale Inventory.",
    `<h2>Straw Bale Inventory — Bale Batches, Moisture Checks and Biomass Contracts</h2>
<p>The <strong>Straw Bale Inventory</strong> (accessible from the Straw Management section in the dashboard) records every bale batch produced on the farm, tracks moisture and condition, and captures the biomass contract details required by energy schemes such as Drax and farm-scale AD plants.</p>
<h3>Recording a bale batch</h3>
<p>Click <strong>New Bale Batch</strong>. The form captures:</p>
<ul>
<li><strong>Crop</strong> — the harvested crop the straw came from (wheat, barley, oilseed rape straw, etc.)</li>
<li><strong>Bale type</strong> — Round or Square</li>
<li><strong>Quantity</strong> — number of bales in the batch</li>
<li><strong>Weight per bale (kg)</strong> — used to calculate total batch weight automatically</li>
<li><strong>Storage location</strong> — field, yard, or building where the bales are stacked</li>
<li><strong>Date baled</strong></li>
<li><strong>Estimated moisture %</strong> — at time of baling; can be updated when a moisture check is carried out</li>
<li><strong>Notes</strong></li>
</ul>
<h3>Moisture checks</h3>
<p>Moisture is critical for storage life and combustion quality. Log a moisture check against an existing batch by opening the batch record and clicking <strong>Add Moisture Check</strong>. Record the check date, moisture % reading, measurement method (probe, NIR, lab analysis), and who carried it out. Multiple checks can be recorded against a single batch across the storage period — the most recent reading is displayed on the batch card.</p>
<h3>Biomass contract fields</h3>
<p>If bales are sold or supplied under a biomass energy scheme, the batch record includes three additional fields:</p>
<ul>
<li><strong>Biomass contract</strong> — toggle to flag the batch as contracted for biomass use</li>
<li><strong>Scheme name</strong> — the name of the energy scheme or buyer (e.g. Drax, local AD plant, RTFO-accredited scheme)</li>
<li><strong>Unique bale reference</strong> — the scheme-specific reference number assigned to this batch; required by some schemes for traceability reporting</li>
</ul>
<p>These fields are available on both the dashboard and the mobile app, so contractors and operators can enter scheme references in the field at time of loading or delivery.</p>
<h3>Mobile capture</h3>
<p>The Straw Bales screen in the mobile app (More → Straw Management → Straw Bales) mirrors the full batch form including all biomass contract fields. Records save offline and sync to the dashboard automatically when connectivity is restored. This allows lorry drivers or yard staff to log bale movements and update moisture readings without returning to an office.</p>
<h3>Usage and balance</h3>
<p>As bales are used or sold, log a usage event against the batch. The remaining balance (bales and tonnes) updates automatically. Season totals appear in the <strong>Season Reports → Forage &amp; Straw tab</strong> alongside silage production figures.</p>`,
  ],
  // 281 — Season Reports — Forage & Straw Tab
  [
    "How the Season Reports Forage & Straw tab aggregates silage, haylage, and straw bale production for the selected harvest year.",
    `<h2>Season Reports — Forage &amp; Straw Tab</h2>
<p>The <strong>Forage &amp; Straw</strong> tab on the Season Reports page (Field &amp; Crop Management → Season Reports) provides a complete forage and straw production balance sheet for the selected harvest year. It draws automatically from Silage &amp; Haylage Cut Records and the Straw Bale Inventory — no separate data entry is needed once those records are kept up to date.</p>
<h3>What the tab shows</h3>
<p>The tab is split into two sections:</p>
<h4>Silage &amp; Haylage production</h4>
<ul>
<li>All cut records for the selected season, grouped by forage type (Grass Silage, Maize Silage, Wholecrop, Haylage) and cut number</li>
<li>Area cut (ha), yield (t/ha), and total yield (t) per cut event</li>
<li>Season totals per forage type and an overall total for the year</li>
<li>Average dry matter % per forage type (where DM readings have been recorded on cut or quality-test records)</li>
</ul>
<h4>Straw bale summary</h4>
<ul>
<li>All bale batches baled in the selected harvest year, grouped by crop</li>
<li>Bale count and estimated total weight (tonnes) per batch</li>
<li>Biomass contract batches are highlighted with a scheme badge so contracted stock is immediately distinguishable from on-farm or open-market straw</li>
<li>Season totals: total bales and total tonnes across all crops</li>
</ul>
<h3>Selecting the season</h3>
<p>Use the season year selector at the top of the Season Reports page to switch between harvest years. The Forage &amp; Straw tab updates automatically — all other Season Reports tabs (Crop Gross Margin, IPM Summary, Compliance) update in the same switch, so your full season review is always in one place.</p>
<h3>Exporting</h3>
<p>Click <strong>Export CSV</strong> on the Forage &amp; Straw tab to download a spreadsheet of all silage cut records and straw bale batches for the selected year. The export includes all fields — area, yield, DM%, forage type, cut number, field, and biomass contract details — formatted for use in feed budget spreadsheets or scheme reporting.</p>`,
  ],
  // Pig Vaccination Programme
  [
    "Record pig herd vaccinations by disease category with licensed UK vaccine presets, booster alert panel, and mobile capture — supporting Red Tractor Pigs Veterinary Health Plan requirements.",
    `<h2>Pig Vaccination Programme — Recording and Booster Management</h2>
<p>Navigate to <strong>Pig Production → Vaccination</strong> and click <strong>Add Vaccination Record</strong> to open the form.</p>

<h3>Disease Categories</h3>
<p>Select the target disease category first. Available categories are:</p>
<ul>
  <li>PRRS (Porcine Reproductive &amp; Respiratory Syndrome)</li>
  <li>PCV2 / Circovirus</li>
  <li>Enzootic Pneumonia (Mycoplasma hyopneumoniae / MH)</li>
  <li>Erysipelas / PPV</li>
  <li>E. coli / Clostridial</li>
  <li>APP (Actinobacillus pleuropneumoniae)</li>
  <li>Swine Influenza</li>
  <li>PED (Porcine Epidemic Diarrhoea)</li>
  <li>Other — free-text entry</li>
</ul>

<h3>Licensed UK Vaccine Presets</h3>
<p>Once a category is selected, a pre-loaded list of licensed UK vaccines for that category appears. Examples include Ingelvac PRRS MLV, Porcilis PRRS and Fostera PRRS (PRRS); Ingelvac CircoFLEX, Circovac and Porcilis PCV AD (PCV2); Ingelvac M.hyo. IDAL and Hyoresp (Enzootic Pneumonia/MH); Eryseng Parvo and Porcilis Ery+Parvo (Erysipelas/PPV). Select <em>Other — enter manually</em> for any unlisted product.</p>

<h3>Record Fields</h3>
<ul>
  <li>Batch number and expiry date</li>
  <li>Age group treated (Sows/Gilts, Boars, Piglets/Suckling, Weaners, Growers, Finishers, All pigs)</li>
  <li>Number treated, dose volume (ml), administration route (Intramuscular, Subcutaneous, Intradermal, Intranasal, Oral, In-water)</li>
  <li>Withdrawal period in days</li>
  <li>Next due date</li>
  <li>Administered by</li>
  <li>Vet-prescribed flag (for POM-V products)</li>
  <li>Document attachment — attach a vet prescription or product datasheet directly to the record row</li>
</ul>

<h3>Booster Alert Panel</h3>
<p>An amber alert panel at the top of the Vaccination tab highlights any record with an upcoming or overdue next due date, helping you stay on schedule with booster programmes. The panel updates automatically as dates approach.</p>

<h3>Mobile Capture</h3>
<p>Pig vaccination records can also be entered from the <strong>Pig Vaccination Record</strong> screen in the mobile app's Record tab. The screen includes a herd picker, the same disease category and vaccine preset selectors, all record fields including a withdrawal period warning banner, and offline sync — records saved without connectivity will sync to the dashboard Vaccination tab automatically on reconnection.</p>

<h3>Red Tractor Pigs Compliance</h3>
<p>Red Tractor Pigs standards require a written vaccination programme signed off by your vet. This tab provides the detailed record-keeping layer underneath that signed document. Retaining batch numbers, expiry dates, vet-prescribed flags, and next due dates creates a complete, auditable vaccination history that satisfies Red Tractor Pigs assessor requirements.</p>`,
  ],
  // Poultry Vaccination Programme
  [
    "Record flock vaccinations by disease category with licensed UK vaccine presets, booster alert panel, and mobile capture — supporting Red Tractor Poultry Veterinary Health Plan requirements.",
    `<h2>Poultry Vaccination Programme — Recording and Booster Management</h2>
<p>Navigate to <strong>Poultry Production → Vaccination</strong> and click <strong>Add Vaccination Record</strong> to open the form.</p>

<h3>Disease Categories</h3>
<p>Select the target disease category first. Available categories are:</p>
<ul>
  <li>Newcastle Disease (ND)</li>
  <li>Infectious Bronchitis (IB)</li>
  <li>Marek's Disease</li>
  <li>Gumboro / IBD (Infectious Bursal Disease)</li>
  <li>Avian Metapneumovirus (aMPV / TRT)</li>
  <li>ILT (Infectious Laryngotracheitis)</li>
  <li>EDS (Egg Drop Syndrome)</li>
  <li>AE / Fowl Typhoid</li>
  <li>Salmonella</li>
  <li>Mycoplasma (MG — Mycoplasma gallisepticum)</li>
  <li>Fowl Pox</li>
  <li>Other — free-text entry</li>
</ul>

<h3>Licensed UK Vaccine Presets</h3>
<p>A pre-loaded list of licensed UK vaccines appears on category selection. Examples: Nobilis ND Clone 30 and Avinew (ND); Nobilis IB Ma5, Nobilis IB 4-91 and Nobilis IB H120 (IB); Nobilis Rismavac and HVT (Marek's); Nobilis Gumboro D78 and Nobilis Gumboro 228E (Gumboro); Nobilis TRT and Hipraviar TRT-C (aMPV); Nobilis SalENT, AviPro Salmonella Vac E, AviPro Salmonella Vac T and Salenvac (Salmonella). Select <em>Other — enter manually</em> for unlisted products.</p>

<h3>Record Fields</h3>
<ul>
  <li>Batch number and expiry date</li>
  <li>Age group treated (Broilers, Layers, Breeders, Pullets, Day-old chicks, Turkeys, All birds)</li>
  <li>Number treated, dose volume (ml)</li>
  <li>Administration route (Drinking water, Eye drop, Spray, Subcutaneous/IM injection, Wing web/stab, In ovo)</li>
  <li>Withdrawal period in days</li>
  <li>Next due date</li>
  <li>Administered by</li>
  <li>Vet-prescribed flag (for POM-V products)</li>
  <li>Document attachment — attach a vet prescription or product datasheet directly to the record row</li>
</ul>

<h3>Booster Alert Panel</h3>
<p>The amber alert panel at the top of the Vaccination tab highlights any record with an upcoming or overdue next due date, keeping your flock vaccination schedule on track. Records turn overdue on the next due date and remain flagged until a new vaccination record is added.</p>

<h3>Mobile Capture</h3>
<p>Poultry vaccination records can be entered from the <strong>Poultry Vaccination Record</strong> screen in the mobile app's Record tab. Select your flock using the flock picker, choose the disease category and a vaccine preset, complete all fields including the withdrawal period warning banner, and the record saves offline — syncing to the dashboard Vaccination tab when connectivity is restored.</p>

<h3>Red Tractor Poultry Compliance</h3>
<p>Red Tractor Poultry requires the vaccination programme to be included in the Veterinary Health Plan signed by your vet. This tab records each individual administration event against that plan, providing batch-level traceability, vet-prescribed documentation, and booster scheduling in a single auditable register.</p>`,
  ],
  // Pig Disease Monitoring Register
  [
    "Record PRRS, Enzootic Pneumonia/MH, Aujeszky's Disease, APP and Swine Influenza surveillance events; supports AHDB PRRS and MH Accreditation scheme documentation with herd status badges.",
    `<h2>Pig Disease Monitoring Register — PRRS, MH, and AHDB Accreditation</h2>
<p>Navigate to <strong>Pig Production → Disease Monitoring</strong> and click <strong>Add Monitoring Record</strong> to log a surveillance or accreditation event.</p>

<h3>Monitoring Types</h3>
<ul>
  <li>PRRS Monitoring</li>
  <li>Enzootic Pneumonia / MH Monitoring</li>
  <li>Aujeszky's Disease (AD-Free Scheme)</li>
  <li>APP Serotyping</li>
  <li>Swine Influenza Surveillance</li>
  <li>PRDC (Porcine Respiratory Disease Complex)</li>
  <li>General Serology</li>
</ul>

<h3>Accreditation Scheme Support</h3>
<p>If the monitoring is part of a formal accreditation scheme, select it from the <strong>Accreditation Scheme</strong> dropdown:</p>
<ul>
  <li>AHDB PRRS Accreditation — classifies herds as Negative, Positive-Stable, or Positive-Unstable</li>
  <li>AHDB MH Accreditation — classifies herds as MH-Negative or MH-Positive</li>
  <li>APHA Aujeszky's Disease-Free Scheme</li>
</ul>
<p>Record the scheme reference (certificate or accreditation number) and testing body or laboratory alongside results.</p>

<h3>Record Fields</h3>
<ul>
  <li>Number of samples, positive results, negative results</li>
  <li>Herd status — Negative, Positive-Stable, Positive-Unstable, Positive (general), AD-Free Accredited, Inconclusive, or Pending</li>
  <li>Next test due date</li>
  <li>Actions taken</li>
  <li>Document attachment — attach laboratory reports or accreditation certificates directly to the record row</li>
</ul>

<h3>Herd Status Badges</h3>
<p>Each record displays a colour-coded herd status badge: green for Negative or AD-Free Accredited, amber for Positive-Stable, and red for Positive-Unstable. These badges provide an at-a-glance disease status view across the monitoring history.</p>

<h3>Link to Isolation Register</h3>
<p>Use the <strong>PRRS Source Herd Status</strong> and <strong>MH Source Herd Status</strong> fields on the Livestock → Isolation Register when recording incoming pig purchases to document the biosecurity risk of the source herd. The AHDB PRRS Accreditation Scheme recommends purchasing only from herds with the same or lower PRRS risk status; this field creates the audit trail for that requirement.</p>`,
  ],
  // Poultry Disease Monitoring Register
  [
    "Record AI surveillance, Marek's Disease monitoring, ND serology, MG surveillance, IB typing, ART surveillance, and Salmonella serology with AI risk level classification and flock status badges.",
    `<h2>Poultry Disease Monitoring Register — AI Surveillance, Marek's, and NCP Serology</h2>
<p>Navigate to <strong>Poultry Production → Disease Monitoring</strong> and click <strong>Add Monitoring Record</strong> to log a surveillance or serology event.</p>

<h3>Monitoring Types</h3>
<ul>
  <li>Avian Influenza (AI) Surveillance</li>
  <li>Marek's Disease Monitoring</li>
  <li>Newcastle Disease Serology</li>
  <li>Mycoplasma gallisepticum (MG) Surveillance</li>
  <li>Infectious Bronchitis Typing</li>
  <li>Avian Rhinotracheitis (ART) Surveillance</li>
  <li>Salmonella Serology (non-NCP)</li>
  <li>General Serology / Antibody Profiling</li>
</ul>

<h3>Record Fields</h3>
<ul>
  <li>Testing body or laboratory</li>
  <li>Number of samples, positive results, negative results</li>
  <li>Flock status — Negative/Clear, Low Positive, Positive, Inconclusive, or Pending (awaiting results)</li>
  <li>AI Risk Level (Low, Medium, or High) — appears only for Avian Influenza Surveillance records</li>
  <li>Next test due date</li>
  <li>Actions taken</li>
  <li>Document attachment — attach the laboratory report directly to the record row</li>
</ul>

<h3>Flock Status Badges</h3>
<p>Each record displays a colour-coded flock status badge: green for Negative/Clear, amber for Low Positive or Inconclusive, and red for Positive. These badges provide an immediate disease status overview across the monitoring history.</p>

<h3>Campylobacter NCP Records</h3>
<p>Note that Campylobacter National Control Programme (NCP) monitoring records — the mandatory FSA / Red Tractor programme — are recorded separately in the <strong>Campylobacter</strong> tab, not in Disease Monitoring. The Disease Monitoring Register covers non-NCP surveillance and serology work.</p>

<h3>Compliance Use Cases</h3>
<p>AI surveillance records support APHA avian influenza monitoring obligations. MG surveillance records support Red Tractor Poultry health plan documentation requirements. Marek's and IB typing records provide baseline immunological data for your vet's Veterinary Health Plan review.</p>`,
  ],
  // Marek's Disease & Salmonella NCP Isolation Register Fields
  [
    "When recording incoming poultry on the Isolation Register, document source flock Marek's vaccination status and Salmonella NCP category — with colour-coded biosecurity badges for Red Tractor and BEIC audits.",
    `<h2>Marek's Disease &amp; Salmonella NCP Isolation Register Fields — Poultry Biosecurity</h2>
<p>When recording incoming poultry stock on the <strong>Livestock → Isolation Register</strong>, two poultry-specific biosecurity sections appear below the pig biosecurity fields.</p>

<h3>Marek's Disease Biosecurity — Poultry</h3>
<p>Record whether the source flock or hatchery vaccinated birds for Marek's Disease:</p>
<ul>
  <li><strong>Vaccinated — confirmed</strong> — hatchery or source flock confirmed vaccination (e.g. HVT, Rispens/CVI988, or combination product at day-old)</li>
  <li><strong>Not vaccinated — biosecurity risk</strong> — source did not vaccinate; heightened biosecurity precautions required during isolation</li>
  <li><strong>Unknown</strong> — vaccination status not confirmed by the source</li>
</ul>
<p>Marek's Disease is caused by a highly contagious herpesvirus that can spread to unvaccinated birds. Documenting the source flock's vaccination status supports your biosecurity risk assessment during the isolation period.</p>

<h3>Salmonella NCP Biosecurity — Poultry</h3>
<p>Record the source flock's most recent Salmonella National Control Programme (NCP) category:</p>
<ul>
  <li><strong>Category 1</strong> — low prevalence (≤5% positive samples in the annual NCP round)</li>
  <li><strong>Category 2</strong> — moderate prevalence (5–19%)</li>
  <li><strong>Category 3</strong> — high prevalence (≥20%); enhanced biosecurity and NCP monitoring required</li>
  <li><strong>Not tested</strong> — source flock has not participated in NCP testing</li>
  <li><strong>Unknown</strong> — NCP status not confirmed by the source</li>
</ul>
<p>Both sections include a free-text notes field for supplementary detail such as laboratory references or hatchery certificates.</p>

<h3>Colour-Coded Badges</h3>
<p>The isolation record displays colour-coded badges for both fields: green for Marek's vaccinated or Salmonella Category 1, amber for Category 2, and red for Marek's not vaccinated or Salmonella Category 3. These badges provide a quick biosecurity risk summary for any isolation batch.</p>

<h3>Compliance Use Cases</h3>
<p>These fields support Red Tractor Poultry and BEIC (British Egg Industry Council) biosecurity documentation requirements when purchasing replacement or day-old poultry stock. Retaining source flock NCP category records also demonstrates due diligence for Salmonella NCP co-ordinator inspections.</p>`,
  ],
  // Individual Animal Profile — Vaccinations History Tab
  [
    "The Individual Animal Profile dialog includes a Vaccinations tab aggregating all vaccination events across species modules and medicine records for that animal — complete single-animal audit trail in one view.",
    `<h2>Individual Animal Profile — Vaccinations History Tab</h2>
<p>Open <strong>Livestock → Individual Animal Register</strong> and click any animal's ear tag to open its profile dialog. The dialog includes a <strong>Vaccinations</strong> tab alongside the animal's other profile data.</p>

<h3>What the Tab Shows</h3>
<p>The Vaccinations tab aggregates every vaccination event associated with that animal across all species modules:</p>
<ul>
  <li>Sheep vaccination programme records (Clostridial, Louping Ill, Orf, Johne's/Gudair, and other sheep categories)</li>
  <li>Goat vaccination programme records (Johne's/Gudair, CAE, Clostridial, Pasteurella, and other goat categories)</li>
  <li>Pig vaccination programme records (PRRS, PCV2, Enzootic Pneumonia/MH, Erysipelas/PPV, E. coli/Clostridial, APP, Swine Influenza, PED)</li>
  <li>Poultry vaccination programme records (ND, IB, Marek's, Gumboro/IBD, aMPV/TRT, ILT, EDS, AE, Salmonella, MG, Fowl Pox)</li>
  <li>Medicine records linked to that animal where the medicine type indicates a vaccine</li>
</ul>

<h3>Columns Displayed</h3>
<p>Each row in the Vaccinations tab shows:</p>
<ul>
  <li>Vaccination date</li>
  <li>Disease category</li>
  <li>Vaccine product name</li>
  <li>Batch number</li>
  <li>Dose and administration route</li>
  <li>Withdrawal period end date (calculated from the vaccination date and withdrawal days)</li>
  <li>Vet-prescribed flag</li>
</ul>

<h3>When to Use This Tab</h3>
<p>The Vaccinations tab is particularly useful when:</p>
<ul>
  <li>A vet visit requires a full vaccination history for a specific animal</li>
  <li>Completing or reviewing a Veterinary Health Plan for an individual animal</li>
  <li>Preparing records for a Red Tractor audit where traceability to individual animal level is required</li>
  <li>Confirming withdrawal period clearance before an animal enters the food chain</li>
</ul>
<p>The tab provides a consolidated view without needing to navigate between separate production modules — all species vaccination history is visible in one place.</p>`,
  ],
  // Using the BDE Farm Trac Sandbox Test Environment
  [
    "A full mirror of your live account for safe training and testing — all external integrations and alerts suppressed, persistent amber banner, one-click reset and return to live.",
    `<h2>Using the BDE Farm Trac Sandbox Test Environment</h2>
<p>Every BDE Farm Trac account includes a built-in <strong>Sandbox Test Environment</strong> at no extra cost. The sandbox is a complete copy of your live setup — the same farms, modules, and screens — where you can enter records, explore every workflow, and train new staff with no risk whatsoever of affecting your live data or triggering any real-world action.</p>

<h3>How to Access the Sandbox</h3>
<p>Open the farm/tenant selector at the top of the left sidebar. Your sandbox account appears in the list with a <strong>flask icon</strong> and an amber <strong>Sandbox</strong> badge. Click it to switch. Once in the sandbox, a persistent amber <strong>SANDBOX — Test Environment</strong> banner is displayed at the top of every page so there is never any doubt you are not working in your live account.</p>

<h3>What Is and Isn't Suppressed</h3>
<p>The following external integrations and background jobs are <strong>fully suppressed</strong> while you are operating in the sandbox:</p>
<ul>
  <li><strong>SMS text alerts</strong> — no messages are sent, regardless of your alert configuration</li>
  <li><strong>Livestock government submissions</strong> — LIS (England sheep/goat/deer), EIDCymru (Wales), ScotEID (Scotland), and BCMS CTS API calls are all blocked; submission buttons are visible but submissions do not leave the platform</li>
  <li><strong>GPS provider polling</strong> — Teltonika, Webfleet, John Deere Operations Center, and AGCO Connect will not be polled; the Resource Map will not show live positions</li>
  <li><strong>Scheduled alerting jobs</strong> — medicine withdrawal deadline alerts, certificate expiry alerts, and task-overdue notifications do not fire</li>
</ul>
<p>All other platform features work exactly as in your live account — you can enter spray records, livestock events, medicine treatments, harvest records, staff timesheets, and any other record type, and it will behave identically to live including validation, calculations, and PDF exports.</p>

<h3>Resetting Sandbox Data</h3>
<p>Super-admins can wipe all sandbox records with a single click directly from the amber banner. Click <strong>Reset Sandbox</strong> in the banner, confirm the dialog, and all records entered in the sandbox are cleared. Your farm structure, settings, modules, and credentials are preserved — the sandbox is ready to use again immediately without any re-setup.</p>

<h3>Returning to Your Live Account</h3>
<p>Click <strong>Return to Live Dashboard</strong> in the amber banner at any time. This switches you back to your live tenant, clears the sandbox farm context, and takes you to the context selector. No data entered in the sandbox is carried across to your live account.</p>

<h3>Common Use Cases</h3>
<ul>
  <li><strong>Training new staff</strong> — let team members learn the system freely without the pressure of working in a live compliance environment</li>
  <li><strong>Testing integrations</strong> — configure and test GPS, livestock submission, or SMS settings without sending live data</li>
  <li><strong>Exploring new modules</strong> — if you have just activated a new module, use the sandbox to work through the setup and recording flow before switching to live records</li>
  <li><strong>Preparing for audit</strong> — walk through the audit pack generation and Red Tractor report workflows to confirm everything is set up correctly before your assessor visit</li>
</ul>`,
  ],
  // Medicine Withdrawal Period SMS Alerts
  // Medicine Withdrawal Period SMS Alerts
  [
    "Automatic SMS reminders when a treated animal's medicine withdrawal period is ending — configurable per farm member, Critical and Standard alert tiers.",
    `<h2>Medicine Withdrawal Period SMS Alerts</h2>
<p>BDE Farm Trac can send automatic SMS text reminders when a medicine withdrawal period for a treated animal is approaching its end date. This ensures animals are not presented for slaughter, milk is not sent to the dairy, or eggs are not collected before the withdrawal period has cleared — a requirement under Red Tractor and UK veterinary medicine regulations.</p>

<h3>Enabling Withdrawal Period Alerts</h3>
<p>To receive medicine withdrawal reminders, each farm member must opt in from their own <strong>Account &amp; Notifications</strong> settings. Open Account &amp; Notifications and ensure SMS notifications are enabled, then switch on the <strong>Livestock &amp; Animals</strong> category. The alert fires automatically when any medicine record is saved with a withdrawal end date — a reminder SMS is sent to opted-in farm members as the date approaches.</p>

<h3>Withdrawal End Date Calculation</h3>
<p>Withdrawal end dates are calculated automatically when you save a medicine treatment record. The system adds the withdrawal period in days (taken from the medicine record's withdrawal days field) to the treatment date and stores the result as the withdrawal end date. If a medicine has separate meat and milk withdrawal periods — as is common with dairy treatments — both are calculated and displayed independently. A red withdrawal alert banner appears on the animal's profile and any linked movement record while the withdrawal is active, preventing accidental off-farm movement before clearance.</p>

<h3>Who Receives the Alerts</h3>
<p>Each farm member controls their own SMS preferences from <strong>Account &amp; Notifications</strong>. To receive medicine withdrawal reminders, a team member must have SMS notifications enabled and the <strong>Livestock &amp; Animals</strong> category switched on. Stockpersons and herd keepers responsible for monitoring treated animals should ensure this category is active.</p>

<h3>Alert History</h3>
<p>The <strong>History</strong> tab in SMS Alerts shows a full timestamped log of every alert sent, including the recipient, alert type, and the record that triggered it. Use this to confirm that reminders were sent and received, or to investigate if an alert was not delivered.</p>

<h3>Withdrawal Period Visibility on Records</h3>
<p>Withdrawal status is visible in several places beyond the SMS alert:</p>
<ul>
  <li><strong>Medicine Records tab</strong> — each treatment record shows the withdrawal end date in a colour-coded badge: green (cleared), amber (within 7 days), red (active withdrawal)</li>
  <li><strong>Individual Animal profile</strong> — the profile dialog for any animal shows an active withdrawal warning if any treatment is still within its withdrawal period</li>
  <li><strong>Livestock Movements</strong> — an off-farm movement for an animal with an active withdrawal will display a red warning, requiring manual confirmation before saving</li>
  <li><strong>Mobile app</strong> — withdrawal status badges appear on medicine records captured from the field, giving stockpersons immediate visibility during rounds</li>
</ul>`,
  ],
  // Poultry Inter-Site Transfers — Recording Movements Between Holdings
  // Poultry Inter-Site Transfers — Recording Movements Between Holdings
  [
    "How to record poultry movements between holdings you own or manage using the Inter-Site Transfers tab — distinct from FCI slaughter movements.",
    `<h2>Poultry Inter-Site Transfers — Recording Movements Between Holdings</h2>
<p>The <strong>Inter-Site Transfers</strong> tab in Poultry Production records movements of birds between different holdings you own or manage. These are distinct from a Food Chain Information (FCI) movement to slaughter — they cover situations such as relocating a laying flock from a rearing site to a production site, splitting a flock across two units, or consolidating birds from a smaller holding onto a main unit.</p>

<h3>Adding a Transfer Record</h3>
<p>Navigate to <strong>Poultry Production → Inter-Site Transfers</strong> and click <strong>Add Transfer</strong>. Complete the following fields:</p>
<ul>
  <li><strong>Destination farm / holding name:</strong> the name of the receiving holding.</li>
  <li><strong>Destination CPH:</strong> the County Parish Holding number of the destination site — required for traceability under APHA biosecurity guidance.</li>
  <li><strong>Transfer date:</strong> the date birds departed the holding.</li>
  <li><strong>Number of birds transferred:</strong> total head count moved.</li>
  <li><strong>Transfer reason:</strong> choose from Relocation, Contract rearing, Flock splitting, Site consolidation, or Other.</li>
  <li><strong>Flock (optional):</strong> link the transfer to a registered flock for full flock-level traceability.</li>
  <li><strong>Transport company, vehicle registration, driver name, and estimated journey duration:</strong> optional transport details for a complete movement audit trail.</li>
</ul>

<h3>Editing and Deleting Records</h3>
<p>All transfer records are displayed in a table with the transfer date, destination holding, destination CPH, number of birds, and reason. Click a row to open the full view dialog. Use the edit button to correct any details, or the delete button to remove a record — deletion requires confirmation.</p>

<h3>Mobile App Recording</h3>
<p>Tap <strong>Inter-Site Transfer</strong> from the Poultry section of the mobile app Record screen. The form captures the same fields as the dashboard. Records save locally if you have no connectivity and sync to Poultry Production → Inter-Site Transfers automatically when the device reconnects.</p>

<h3>Audit and Compliance</h3>
<p>Inter-site transfer records satisfy the Red Tractor Poultry and BEIC requirement to document all movements of birds between holdings. They complement the Isolation Register (used for incoming birds from third-party sources) and the Thinning Records tab (used for partial depletions to slaughter).</p>`,
  ],
  // Poultry Transport Welfare Documentation (WATD) — Journey Records and 65 km Threshold
  // Poultry Transport Welfare Documentation (WATD) — Journey Records and 65 km Threshold
  [
    "Recording poultry journey welfare records in compliance with UK Welfare of Animals During Transport (WATD) legislation, including the 65 km transporter authorisation threshold.",
    `<h2>Poultry Transport Welfare Documentation (WATD) — Journey Records and 65 km Threshold</h2>
<p>UK <strong>Welfare of Animals During Transport (WATD)</strong> legislation requires welfare documentation for all commercial poultry journeys. BDE Farm Trac provides a dedicated <strong>Transport Welfare</strong> tab in Poultry Production to log these records for every journey, whether to slaughter, between holdings, or to a hatchery.</p>

<h3>Adding a Transport Welfare Record</h3>
<p>Navigate to <strong>Poultry Production → Transport Welfare</strong> and click <strong>Add Record</strong>. The form captures:</p>
<ul>
  <li><strong>Journey date</strong></li>
  <li><strong>Journey purpose:</strong> To Slaughter, Inter-Site Transfer, Hatchery Collection, or Other.</li>
  <li><strong>Vehicle registration</strong> and <strong>driver name</strong></li>
  <li><strong>Transporter authorisation number:</strong> required for journeys over 65 km (e.g. UK/TA/12345). The form highlights the field with an amber prompt when the entered distance exceeds this threshold.</li>
  <li><strong>Journey start time</strong> and <strong>end time</strong></li>
  <li><strong>Journey distance (km)</strong></li>
  <li><strong>Stocking density (birds/m²)</strong></li>
  <li><strong>Welfare condition checks:</strong> three toggle flags — Temperature adequate, Water provision, Ventilation adequate.</li>
  <li><strong>Birds dead on arrival</strong></li>
  <li><strong>Overall welfare assessment:</strong> Satisfactory, Unsatisfactory, or Not Assessed — displayed as a colour-coded badge in the table (green / red / grey).</li>
</ul>

<h3>The 65 km Threshold</h3>
<p>Journeys over 65 km trigger additional WATD requirements. When the distance entered exceeds 65 km, a <strong>WATD</strong> badge appears on the record in the table and the Transporter Authorisation Number field becomes required. Transporter authorisation numbers are issued by APHA and are in the format UK/TA/NNNNN.</p>

<h3>Mobile App Recording</h3>
<p>Tap <strong>Transport Welfare Log</strong> from the Poultry section of the mobile app Record screen. An amber warning banner is displayed automatically when the distance entered exceeds 65 km, prompting the user to enter the transporter authorisation number before saving. Records save offline and sync to Poultry Production → Transport Welfare when connectivity is restored.</p>

<h3>Compliance Uses</h3>
<p>Transport welfare records are required for <strong>Red Tractor Poultry</strong>, <strong>RSPCA Assured</strong>, and organic certification audits. The table provides a complete journey log that can be reviewed by an assessor or presented to APHA on request.</p>`,
  ],
  // HPAI Zone Alerting — Platform Alerts, Farm Zone Status and Organic 16-Week Housing Clock
  // HPAI Zone Alerting — Platform Alerts, Farm Zone Status and Organic 16-Week Housing Clock
  [
    "How the HPAI Zone Alerting banner works — platform-level avian influenza declarations, farm-level zone status (PZ/SZ/TCZ), and the organic 16-week housing clock.",
    `<h2>HPAI Zone Alerting — Platform Alerts, Farm Zone Status and Organic 16-Week Housing Clock</h2>
<p>BDE Farm Trac provides two layers of Highly Pathogenic Avian Influenza (HPAI) alerting at the top of Poultry Production. The banner only renders when there is something to show and disappears automatically once all alerts are cleared and no housing clock is running.</p>

<h3>Platform-Level Alerts</h3>
<p>Platform-level alerts are set by BDE administrators when DEFRA declares a national or regional HPAI situation. They appear as a colour-coded banner for all subscribers:</p>
<ul>
  <li><strong>Red banner</strong> — National HPAI alert: a National Prevention Zone or Housing Order is in force across England (or the relevant devolved nation).</li>
  <li><strong>Orange banner</strong> — Regional alert: a Protection Zone or Surveillance Zone has been declared in a specific area.</li>
  <li><strong>Amber banner</strong> — Advisory: APHA has issued a heightened biosecurity advisory without a formal zone declaration.</li>
</ul>
<p>The banner displays the alert level, the advisory message, and the date it was issued. No action is required from you to see platform alerts — they are pushed automatically to all Poultry Production subscribers.</p>

<h3>Farm-Level Zone Status</h3>
<p>You can record the specific zone status for your own holding independently of platform alerts. Click <strong>Set HPAI zone status</strong> beneath the tab bar in Poultry Production and select one of the following:</p>
<ul>
  <li><strong>No zone restrictions</strong> — your holding is not within a declared zone.</li>
  <li><strong>Protection Zone (PZ)</strong> — your holding falls within a 3 km Protection Zone around a confirmed HPAI case.</li>
  <li><strong>Surveillance Zone (SZ)</strong> — your holding falls within the 10 km Surveillance Zone.</li>
  <li><strong>Temporary Control Zone (TCZ)</strong> — your holding is within a broader TCZ.</li>
</ul>
<p>Once a zone is set, an orange banner shows the zone type and the date it was applied, with an <strong>Update Zone</strong> button. Update the status when restrictions change or are lifted by APHA.</p>

<h3>Organic 16-Week Housing Clock</h3>
<p>When recording your farm's zone status, you can also enter a <strong>Housing Required Since</strong> date — the date a mandatory housing order came into effect for your holding. This activates the organic 16-week housing clock, which counts the days since that date and displays a colour-coded progress indicator:</p>
<ul>
  <li><strong>Blue</strong> — fewer than 98 days housed.</li>
  <li><strong>Amber</strong> — 98–111 days housed: approaching the limit, contact your certifying body.</li>
  <li><strong>Red</strong> — 112 days (16 weeks) or more: the UK Organic Regulations 2020 limit has been reached. Contact your certifying body (Soil Association, OF&amp;G, or Organic Farmers &amp; Growers) immediately — continued housing beyond 16 weeks without certifier approval puts organic status at risk.</li>
</ul>
<p>The clock only appears when a Housing Required Since date is entered. Clear the date (by updating zone status to None with no housing date) to stop the clock.</p>`,
  ],
  // Poultry Placement Delivery Fields — Organic Certification Status and Derogation Period at Arrival
  // Poultry Placement Delivery Fields — Organic Certification Status and Derogation Period at Arrival
  [
    "Extended placement record fields for organic poultry farms — supplier certificate number, delivery vehicle registration, organic certification status, and derogation period dates.",
    `<h2>Poultry Placement Delivery Fields — Organic Certification Status and Derogation Period at Arrival</h2>
<p>For organic poultry enterprises, the placement record captures additional delivery and certification details at the point of arrival. These fields provide the audit trail required by certifying bodies (Soil Association, OF&amp;G, Organic Farmers &amp; Growers) from day one of each flock's placement.</p>

<h3>Available Delivery Fields</h3>
<p>When adding or editing a placement record in <strong>Poultry Production → Placements</strong>, the following additional fields are available:</p>
<ul>
  <li><strong>Supplier certificate number:</strong> the supplier's or hatchery's organic certification number, as shown on their certificate from the certifying body.</li>
  <li><strong>Delivery vehicle registration:</strong> the vehicle registration number used for the delivery — supports transport welfare and biosecurity audit trails.</li>
  <li><strong>Organic certification status:</strong> select one of:
    <ul>
      <li><strong>Certified Organic</strong> — the chicks or poults arrive from a certified organic source with no derogation required.</li>
      <li><strong>Approved Non-Organic</strong> — non-organic day-olds placed under an approved exception; record the certifier reference.</li>
      <li><strong>Conventional Derogation</strong> — non-organic placement under a formal derogation case; link to the relevant derogation record in Organic Poultry → Derogations.</li>
    </ul>
  </li>
  <li><strong>Derogation period start date</strong> and <strong>derogation period end date:</strong> the dates during which a formal derogation approval applies to this placement — required when Conventional Derogation is selected and used to verify the placement falls within the approved window.</li>
  <li><strong>Certifying body:</strong> the organisation that issued the organic approval or derogation (Soil Association, OF&amp;G, Organic Farmers &amp; Growers, or other).</li>
</ul>

<h3>Why These Fields Matter</h3>
<p>UK Organic Regulations 2020 require that organic poultry must in principle originate from organically reared stock. Where non-organic day-olds are placed under an approved derogation, the certifier must have granted prior written approval and the derogation must be logged with the placement. Recording the organic certification status at the placement record means your certifying body can trace every flock from day of placement to final depletion without gaps in the evidence chain.</p>

<h3>Viewing Placement Records</h3>
<p>All delivery and organic certification fields are displayed in the placement view dialog alongside the standard flock and hatchery details. Document attachments (hatchery certificates, delivery notes, certifier correspondence) can be added to the placement record using the RecordAttachments panel in the view dialog.</p>`,
  ],
  // GI Compliance Tab — PDO & PGI Designations, Block Compliance, Certifications and Harvest Declarations
  [
    "How to use the GI Compliance tab in BDE Farm Trac to manage PDO and PGI geographical indication obligations for UK vineyards.",
    `<h2>GI Compliance Tab — PDO & PGI Designations, Block Compliance, Certifications and Harvest Declarations</h2>
<p>The GI Compliance tab (Viticulture → GI Compliance) provides a dedicated workspace for managing your vineyard's obligations under UK wine geographical indication (GI) regulations. UK wine GIs — Protected Designation of Origin (PDO) and Protected Geographical Indication (PGI) — are administered by the Animal and Plant Health Agency (APHA) Wine Standards branch. Compliance requires maintaining approved variety lists, maximum yield thresholds, per-vintage APHA assessments, and annual harvest declarations.</p>
<p>The tab contains four sub-tabs: Designations, Block Compliance, Certifications, and Harvest Declarations.</p>

<h2>Designations</h2>
<p>The Designations sub-tab is the foundation of GI compliance. Each record represents one PDO or PGI designation your vineyard holds or is registered under.</p>
<h3>Adding a designation</h3>
<p>Click <strong>New Designation</strong> and complete the form:</p>
<ul>
<li><strong>Designation Name</strong> (required) — the exact name of the GI, e.g. <em>English Wine PDO</em> or <em>English Wine PGI</em>. This name must match the GI Classification value on your vine register rows for the Block Compliance view to link them correctly.</li>
<li><strong>Type</strong> — PDO or PGI.</li>
<li><strong>APHA Reference Number</strong> — the reference issued by APHA Wine Standards for this designation.</li>
<li><strong>Competent Authority</strong> — defaults to <em>APHA Wine Standards</em>; edit if your designation is administered by a different body.</li>
<li><strong>Region</strong> — the geographical area covered (e.g. <em>England</em>, <em>Wales</em>, <em>Kent</em>).</li>
<li><strong>Approved Varieties</strong> — enter the grape varieties permitted under this designation, separated by commas (e.g. <em>Chardonnay, Pinot Noir, Pinot Meunier</em>). These are checked against the registered variety on each vine register row in the Block Compliance view.</li>
<li><strong>Max Yield (kg/ha)</strong> — the maximum permitted harvest yield in kilograms per hectare for this designation. This is compared against actual harvest yield in the Block Compliance and Harvest Declarations views.</li>
<li><strong>Registration Date</strong> and <strong>Next Assessment Date</strong> — track when the designation was registered and when the next APHA assessment is due.</li>
<li><strong>Status</strong> — Active, Suspended, or Revoked.</li>
</ul>

<h2>Block Compliance</h2>
<p>The Block Compliance sub-tab is an automatically computed view. It does not require any manual data entry — it cross-references your existing vine register rows, harvest records, and the designations you have registered above to produce a per-block compliance summary.</p>
<h3>How blocks appear in the compliance view</h3>
<p>A vine register row appears in the Block Compliance view only if its <strong>GI Classification</strong> field is set and matches the name of a registered designation. To link a vine register row:</p>
<ol>
<li>Go to Viticulture → Vine Register.</li>
<li>Open the edit form for the row (pencil icon or Edit in the view dialog).</li>
<li>In the <strong>GI Classification</strong> field, select the appropriate option — English Wine PDO, English Wine PGI, Welsh Wine PDO, Welsh Wine PGI, UK Table Wine, or No GI.</li>
<li>Save. The block will now appear in Block Compliance, matched against any designation whose name contains that GI classification string.</li>
</ol>
<h3>Compliance checks performed</h3>
<ul>
<li><strong>Variety approval</strong> — the vine register row's <em>Variety</em> is checked against the designation's <em>Approved Varieties</em> list. A green tick indicates the variety is approved; a red cross indicates it is not on the list. Review your designation's approved variety list if a variety is incorrectly flagged.</li>
<li><strong>Yield vs threshold</strong> — the most recent harvest record for that block is retrieved and its yield (kg/ha) is compared against the designation's Max Yield (kg/ha). A green tick indicates the yield is within the permitted maximum; a red flag shows the actual exceedance figure (e.g. <em>452 kg/ha over limit</em>). If the block has no harvest record yet, the yield column shows <em>No harvest data</em>.</li>
</ul>
<p>A summary strip at the top of the sub-tab shows the total number of GI-linked blocks, the number that are fully compliant, and the number with issues.</p>

<h2>Certifications</h2>
<p>The Certifications sub-tab records the per-vintage APHA analytical and organoleptic assessments required for PDO and PGI wine certification.</p>
<h3>Fields captured</h3>
<ul>
<li><strong>Vintage Year</strong> and <strong>Designation</strong> (required).</li>
<li><strong>Submission Date</strong> — the date the wine sample was submitted to APHA.</li>
<li><strong>Assessment Type</strong> — Analytical only, Organoleptic only, or Both (the standard PDO/PGI route).</li>
<li><strong>Result</strong> — Passed (green), Failed (red), Pending (amber), or Withdrawn (grey).</li>
<li><strong>Certificate Number</strong>, <strong>Issue Date</strong>, and <strong>Expiry Date</strong> — details of the certificate issued by APHA on a Passed result.</li>
<li><strong>Assessor Name</strong> and <strong>Assessor Organisation</strong> — the APHA-approved panel assessor(s).</li>
<li><strong>Sample Reference</strong> and <strong>Wine Lot Reference</strong> — for traceability back to the specific wine lot assessed.</li>
<li><strong>Volume Assessed (litres)</strong> — the volume of wine assessed in the assessment round.</li>
<li><strong>Failure Reason</strong> — recorded for Failed results to document the basis for refusal and any corrective action required before resubmission.</li>
</ul>
<h3>Expiry alerts</h3>
<p>Certificates expiring within 90 days show an amber <em>Expiring Soon</em> badge. Expired certificates show a red <em>Expired</em> badge. An amber summary banner at the top of the sub-tab lists any certificates with upcoming expiry.</p>

<h2>Harvest Declarations</h2>
<p>The Harvest Declarations sub-tab records the annual yield declarations submitted to APHA as part of PDO and PGI scheme obligations. Each declaration covers one vintage for one designation.</p>
<h3>Fields captured</h3>
<ul>
<li><strong>Vintage Year</strong> and <strong>Designation</strong> (required).</li>
<li><strong>Declaration Date</strong> — the date the declaration was submitted or prepared.</li>
<li><strong>Total Yield (kg)</strong> and <strong>Area (ha)</strong> — the total harvest yield and area covered by this designation and vintage.</li>
<li><strong>Yield (kg/ha)</strong> — calculated automatically; a green <em>Within Limit</em> badge or red <em>Exceeds Limit</em> badge appears based on the designation's Max Yield threshold.</li>
<li><strong>Total Volume Produced (litres)</strong> — the volume of wine produced from this harvest.</li>
<li><strong>Status</strong> — Draft, Submitted, Acknowledged, or Queried.</li>
<li><strong>APHA Reference</strong> — the reference number assigned by APHA on submission.</li>
<li><strong>Submission Method</strong> — how the declaration was submitted (e.g. Online portal, Email, Post).</li>
<li><strong>Notes</strong> — any additional detail relevant to the declaration.</li>
</ul>
<h3>Populate from Harvest Data</h3>
<p>Click the <strong>Populate from Harvest Data</strong> button in the declaration form to automatically pull figures from your harvest records. The system filters harvest records by the selected vintage year and by vine register rows linked to the chosen designation, sums the total yield (kg) and area (ha) across all matching blocks, and calculates yield per hectare. It then checks the calculated yield against the designation's Max Yield threshold and pre-fills the compliance flag. Review the auto-filled figures before saving — you can manually adjust any field if your final declaration figures differ from the raw harvest records.</p>`,
  ],
  [
    "How to use the inspection correspondence log to record all communications related to a Red Tractor or scheme inspection record.",
    `<h2>Inspection Correspondence Log</h2>
<p>The Inspections module in BDE Farm Trac includes a correspondence log on every inspection record. This lets you capture a complete, date-ordered paper trail of all communications associated with a formal inspection — assessor appointment letters, pre-visit questionnaires, your response to raised non-conformances, corrective action confirmation letters, and any follow-up correspondence.</p>
<h3>Opening the correspondence log</h3>
<p>Navigate to <strong>Inspections &amp; Audits</strong> in the dashboard sidebar. In the Inspections table, click the Eye icon on any inspection row to open the inspection detail dialog. The dialog has two tabs: <strong>Details</strong> and <strong>Communications</strong>.</p>
<h3>Logging a communication</h3>
<p>Switch to the <strong>Communications</strong> tab and click <strong>Log Communication</strong>. The form captures:</p>
<ul>
<li><strong>Date</strong> — defaults to today; change to the actual date of the communication.</li>
<li><strong>Direction</strong> — <em>Sent / Outgoing</em> (you sent it) or <em>Received / Incoming</em> (you received it).</li>
<li><strong>Type</strong> — Email, Letter, Phone call, Meeting, Site visit, Video call, or Other.</li>
<li><strong>Subject</strong> — a brief description of the communication (required).</li>
<li><strong>Notes / Summary</strong> — an optional summary of the content or outcome.</li>
</ul>
<p>Click <strong>Save</strong>. The entry appears immediately in the communications list, ordered with the most recent first.</p>
<h3>Reading the communications list</h3>
<p>Each entry shows a direction badge — green for <em>Sent</em>, blue for <em>Received</em> — alongside the communication type, date, subject, and summary. Delete any entry using the bin icon on the right.</p>
<h3>When to use this log</h3>
<p>Log communications at each of these key stages:</p>
<ul>
<li>Assessor appointment confirmation (date, time, assessor name).</li>
<li>Pre-inspection questionnaire sent or received.</li>
<li>Your written response to any non-conformances raised during the visit.</li>
<li>Corrective action completion notice sent to the certifying body.</li>
<li>Conditional pass or certificate confirmation letter received.</li>
</ul>
<p>When a follow-up assessor asks to see evidence that a previous non-conformance was addressed within the required timeframe, the correspondence log provides the date-stamped record of your response alongside the structured non-conformance record — without searching through email archives.</p>`,
  ],
  [
    "How to record correspondence with Natural England, the RPA, and other scheme administrators against an agri-environment scheme record.",
    `<h2>Agri-Environment Scheme Correspondence Log</h2>
<p>Each agri-environment scheme record in BDE Farm Trac — whether an SFI, Countryside Stewardship, Higher Level Stewardship, or ELM agreement — has a built-in correspondence log. This lets you record every communication with scheme administrators such as Natural England and the Rural Payments Agency (RPA) directly against the scheme, creating a complete, date-ordered audit trail alongside the structured agreement data.</p>
<h3>Opening the correspondence log</h3>
<p>Navigate to <strong>Environmental</strong> in the dashboard sidebar and open the <strong>Agri-Environment Schemes</strong> tab. Click the Eye icon on any scheme row to open the scheme detail dialog. The dialog has two tabs: <strong>Details</strong> (showing agreement number, status, start and end dates, annual payment, and obligations) and <strong>Communications</strong>.</p>
<h3>Logging a communication</h3>
<p>Switch to the <strong>Communications</strong> tab and click <strong>Log Communication</strong>. The form captures:</p>
<ul>
<li><strong>Date</strong> — defaults to today; change to the actual date of the communication.</li>
<li><strong>Direction</strong> — <em>Sent / Outgoing</em> (you sent it) or <em>Received / Incoming</em> (you received it).</li>
<li><strong>Type</strong> — Email, Letter, Phone call, Meeting, Site visit, Video call, or Other.</li>
<li><strong>Subject</strong> — a brief description of the communication (required).</li>
<li><strong>Notes / Summary</strong> — an optional summary of the content or outcome.</li>
</ul>
<p>Click <strong>Save</strong>. The entry appears in the communications list, ordered with the most recent first. Direction is colour-coded — green for sent, blue for received.</p>
<h3>Typical communications to log</h3>
<ul>
<li>Agreement offer and acceptance letters from Natural England or RPA.</li>
<li>Payment notification letters and any queries about payment calculations.</li>
<li>Monitoring visit appointment notices and outcomes.</li>
<li>Compliance or technical query correspondence (for example, asking whether a particular management action satisfies a scheme option).</li>
<li>Variation requests — changes to agreement start/end dates, option areas, or payment rates.</li>
<li>Any notice of potential recovery of scheme payments.</li>
</ul>
<p>Keeping a complete correspondence log means that if an RPA inspector or Natural England monitor questions whether a variation was requested and approved, or whether a monitoring visit outcome was acknowledged, the evidence is accessible instantly within the platform alongside the structured scheme record.</p>`,
  ],
  [
    "How to generate and manage API keys for the BDE Farm Trac Data API, and how to use the 10 read-only endpoints to connect your farm data to external tools.",
    `<h2>Data API — Generating and Managing API Keys</h2>
<p>The Data API module gives your external tools — spreadsheets, business intelligence platforms, farm management systems — direct read-only access to your BDE Farm Trac farm data via a secure REST API. No manual CSV exports, no copying and pasting: your third-party system queries the API and always receives current data.</p>

<h3>Enabling the Data API</h3>
<p>The Data API is an optional add-on module at £15 per month. Once active on your subscription, navigate to <strong>Integrations &amp; API → Data API</strong> in the dashboard sidebar. The page shows your list of API keys and the full endpoint documentation.</p>

<h3>Generating an API Key</h3>
<p>Click <strong>Generate New Key</strong>. Enter a descriptive name — for example &quot;Power BI connector&quot; or &quot;Third-party FMS&quot; — so you can identify which system each key belongs to. The full API key is shown <strong>once only</strong> immediately after generation. Copy and store it securely — it will not be shown again. Once closed, only the key prefix (the first eight characters) is visible in the key list, allowing you to identify a key without exposing it.</p>

<h3>Using Your API Key</h3>
<p>Include the key in every API request using the <code>x-api-key</code> HTTP header:</p>
<pre><code>GET https://bdefarmtrac.co.uk/api/data-export/fields
x-api-key: your_full_api_key_here</code></pre>
<p>All 10 endpoints follow the same pattern — replace <code>fields</code> with the datasource name. Available endpoints are shown in the Data API page in the dashboard.</p>

<h3>Available Datasources</h3>
<ul>
<li><strong>fields</strong> — field register with area, soil type, NVZ status, and crop history</li>
<li><strong>livestock</strong> — herd and flock register with species, count, and tags</li>
<li><strong>medicines</strong> — medicine records with product, batch, withdrawal periods, and animal IDs</li>
<li><strong>sprays</strong> — spray applications with product, MAPP number, area, operator, and weather conditions</li>
<li><strong>soil-tests</strong> — soil analysis results with field, pH, P, K, Mg, and status</li>
<li><strong>crop-assignments</strong> — current crop assignments per field with variety and sow date</li>
<li><strong>inspections</strong> — inspection records with scheme, outcome, and non-conformances</li>
<li><strong>training</strong> — staff training and certificate records with expiry dates</li>
<li><strong>equipment</strong> — equipment register with service history and MOT due dates</li>
<li><strong>financials</strong> — financial records including purchase orders and sales</li>
</ul>

<h3>Revoking a Key</h3>
<p>To revoke a key, click the <strong>Revoke</strong> button on the key row. The key is immediately disabled — any requests using it will receive a 401 Unauthorised response. Revoked keys remain visible in the list for audit purposes. You cannot un-revoke a key; generate a new one if needed.</p>

<h3>Security Best Practice</h3>
<ul>
<li>Treat API keys like passwords — do not embed them in publicly visible code or share them in emails.</li>
<li>Generate a separate key per system so you can revoke one without affecting others.</li>
<li>Rotate keys periodically or immediately if you suspect a key has been exposed.</li>
</ul>`,
  ],
  [
    "How to use the Report Builder wizard to create, filter, chart, export, and save custom reports from any of the 10 farm datasources.",
    `<h2>Report Builder — Creating, Running and Saving Custom Reports</h2>
<p>The Report Builder module lets you build tailored data reports from your BDE Farm Trac farm records — without writing SQL or exporting raw data. Design reports using a four-step wizard, optionally add a chart, export the results to CSV, and save report definitions to re-run any time with fresh live data.</p>

<h3>Enabling the Report Builder</h3>
<p>The Report Builder is an optional add-on module at £20 per month. Once active, navigate to <strong>Integrations &amp; API → Report Builder</strong> in the dashboard sidebar.</p>

<h3>Step 1 — Choose a Datasource</h3>
<p>Select one of the 10 available datasources: Fields, Livestock, Medicine Records, Spray Applications, Soil Tests, Crop Assignments, Inspections, Training Records, Equipment, or Financials.</p>

<h3>Step 2 — Pick Columns</h3>
<p>Tick the columns you want to appear in your report. Use <strong>Select All</strong> to include every column, or <strong>Clear</strong> to start fresh.</p>

<h3>Step 3 — Apply Filters</h3>
<p>Narrow your results using two types of filter:</p>
<ul>
<li><strong>Date range</strong> — set a From and To date to restrict results to a specific period.</li>
<li><strong>Field filters</strong> — add one or more field-level conditions using equals, contains, greater than, or less than operators.</li>
</ul>
<p>Filters are optional. Leaving them blank returns all records for the selected datasource.</p>

<h3>Step 4 — Preview, Chart, and Save</h3>
<p>The preview table shows your results immediately. You can:</p>
<ul>
<li><strong>Export to CSV</strong> — download the current result set as a spreadsheet.</li>
<li><strong>Add a chart</strong> — configure a bar, line, or pie chart; select the Label Field, the Value Field, and the Aggregation (Count, Sum, or Average).</li>
<li><strong>Save the report</strong> — give the report a name and save. The definition is stored permanently and re-runs against live data any time from the Saved Reports list.</li>
</ul>

<h3>Managing Saved Reports</h3>
<p>The Report Builder home page shows all your saved report definitions. Click <strong>Run</strong> to execute with fresh data. Click <strong>Delete</strong> to remove a definition — no underlying farm data is affected.</p>

<h3>Practical examples</h3>
<ul>
<li><strong>Spray season summary</strong> — Spray Applications, filter to season date range, export CSV for agronomist review.</li>
<li><strong>Overdue equipment service</strong> — Equipment, filter Next Service Due less than today, export or share with workshop.</li>
<li><strong>Medicine usage by product</strong> — Medicine Records, bar chart on Product Name with count aggregation.</li>
<li><strong>Training certificate expiry</strong> — Training Records, filter Expiry Date to the next 6 months for advance renewal planning.</li>
</ul>`,
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
