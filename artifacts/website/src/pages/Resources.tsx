import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import {
  BookOpen, ArrowRight, ChevronRight, Clock, Tag,
  Wheat, Beef, Sprout, Tractor, ClipboardList, Leaf, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Article {
  slug: string;
  tag: string;
  tagColor: string;
  icon: React.ElementType;
  title: string;
  summary: string;
  readTime: string;
  body: Section[];
}

interface Section {
  heading: string;
  content: string;
}

const ARTICLES: Article[] = [
  {
    slug: "nvz-records",
    tag: "Arable",
    tagColor: "bg-yellow-100 text-yellow-700",
    icon: Wheat,
    title: "How to keep NVZ records for Red Tractor — what the rules actually require",
    summary: "Nitrate Vulnerable Zone records are one of the most commonly cited gaps in Red Tractor arable audits. Here is exactly what you need to record, how long you need to keep it, and how a digital system removes the risk of getting it wrong.",
    readTime: "7 min read",
    body: [
      {
        heading: "What is an NVZ and who does it apply to?",
        content: "A Nitrate Vulnerable Zone (NVZ) is a designated area of land where water is, or could be, affected by nitrate pollution from agricultural sources. Approximately 55% of England is now designated as NVZ. If your farm — or any part of it — falls within an NVZ, you are legally required to comply with the Action Programme for Nitrate Vulnerable Zones regulations, which include specific record-keeping requirements.\n\nYou can check whether your land is within an NVZ using the Environment Agency's MAGIC mapping tool. Compliance is enforced through cross-compliance inspections and can result in deductions from Basic Payment Scheme (now SFI) payments for non-compliance.",
      },
      {
        heading: "What records are legally required?",
        content: "The Nitrate Pollution Prevention Regulations 2015 require you to keep the following records for at least five years:\n\n• A farm map showing field boundaries, field areas, and the total area of your holding\n• A soil map or soil type records for each field\n• Records of every organic manure application — the date, the field, the type of manure, the quantity applied, and the total nitrogen content\n• Records of every manufactured fertiliser application — the date, the field, the product name, the quantity applied, and the total nitrogen applied per hectare\n• Nitrogen Balance calculations for the farm as a whole or per field, depending on your farm type\n• Records of any closed-period applications (if you have a derogation allowing application during closed periods)\n\nFor mixed farms with livestock, you also need records of the organic nitrogen produced by your animals — the Nitrogen Loading calculation — to demonstrate you are not exceeding the 170 kg N/ha/year limit from organic sources.",
      },
      {
        heading: "What does a Red Tractor audit check for?",
        content: "Red Tractor's Combinable Crops and Sugar Beet Standard (CCSB) requires documented evidence of NVZ compliance as a mandatory baseline. Auditors specifically look for:\n\n• A current farm map with field identifiers matching the records\n• A current soil type map or report\n• Fertiliser applications that are traceable to a specific field and date\n• Evidence that the 170 kg N/ha organic nitrogen limit has not been exceeded\n• Evidence that closed periods have been observed (no manure applications between the relevant autumn and February dates)\n• A written Risk Map if you farm within 50 metres of a watercourse\n\nThe most common failures at audit are: records that exist for some fields but not all, records with missing dates or quantities, and nitrogen balance calculations that have never been completed.",
      },
      {
        heading: "How BDE Farm Trac handles NVZ records",
        content: "The Field & Crop Management module in BDE Farm Trac provides a structured application log for every field on your holding. Each fertiliser or organic manure application is recorded with field, date, product, quantity applied, and nitrogen content — and the system maintains a running nitrogen balance per field across the season.\n\nThe farm planner draws on your crop rotation records and any closed-period dates set at the field level, surfacing reminders before closed periods start and flagging fields where nitrogen limits are approaching threshold. All records are exportable as a structured spreadsheet for audit purposes.\n\nSpray records and fertiliser applications are kept separately (spray records in their own module) but share the same field identifier system, so a full field history — from soil sample through fertiliser applications through harvest — is available in a single audit trail.",
      },
      {
        heading: "Common mistakes to avoid",
        content: "• Recording applications at farm level rather than field level — auditors need to see field-specific figures\n• Not recording organic manure applications with the same rigour as manufactured fertiliser\n• Failing to update records within the required 12-month window from application date\n• Not keeping a copy of soil analysis results that informs the fertiliser plan\n• Treating NVZ records as a separate exercise from general farm record-keeping — integrating them into a single digital system removes the risk of the records being incomplete\n\nBDE Farm Trac's field & crop records are designed to make the compliant approach the default approach — the right fields, right dates, and right calculations are built into the record structure, so you cannot accidentally miss a required field.",
      },
    ],
  },
  {
    slug: "medicine-withdrawal",
    tag: "Livestock",
    tagColor: "bg-red-100 text-red-700",
    icon: Beef,
    title: "Medicine withdrawal period records: what you need for a farm inspection",
    summary: "A withdrawal period breach can result in milk rejection, a failed residue test, or an enforcement notice. Here is what records inspectors and Red Tractor auditors will look for — and how to ensure yours are always complete.",
    readTime: "6 min read",
    body: [
      {
        heading: "Why withdrawal period records matter",
        content: "A withdrawal period is the minimum time that must elapse between the last administration of a veterinary medicine and the slaughter of an animal for food, or the collection of milk or eggs for human consumption. Administering a medicine within its withdrawal period and then presenting the animal or its produce for food is a criminal offence under the Veterinary Medicines Regulations 2013.\n\nIn practice, withdrawal period breaches are most commonly discovered through residue testing at the abattoir or dairy, and the consequences — rejection of a load, a positive test result on the Animal and Plant Health Agency (APHA) National Residue Monitoring programme, or a producer's milk supply being suspended — are serious and immediately visible to buyers and assurance schemes.",
      },
      {
        heading: "What records are required by law?",
        content: "The Veterinary Medicines Regulations 2013 require every farmer to maintain a medicine record for a minimum of five years. The record must include:\n\n• The name of the veterinary medicinal product\n• The date of purchase\n• The quantity purchased\n• The name and address of the supplier\n• The date of administration\n• The identity of the animal or group of animals treated (ear tag numbers, batch, or group identifier)\n• The condition treated\n• The dose administered\n• The name of the person who administered the medicine\n• The withdrawal period for that product and that administration route\n• The date the withdrawal period ends\n\nFor cattle, sheep, pigs, and goats, these records must be kept even if the medicine is a licensed over-the-counter product purchased without a prescription.",
      },
      {
        heading: "What Red Tractor looks for at audit",
        content: "Red Tractor's Livestock standards require a complete, legible medicine record that covers all of the legal requirements above. Auditors additionally look for:\n\n• Evidence that withdrawal periods have been observed — either through a recorded check-off on the animal's movement or sale record, or through a system that flags when the withdrawal period ends\n• A current medicine storage record showing that medicines are stored correctly (relevant temperature range, out of reach of unauthorised persons)\n• A current medicine disposal record for any unused product or sharps\n• Evidence that prescription-only medicines were obtained under a valid veterinary prescription\n• For dairy herds specifically: evidence that treated cows have been withheld from the bulk tank for the milk withdrawal period",
      },
      {
        heading: "How BDE Farm Trac handles withdrawal period tracking",
        content: "Every medicine administration record in BDE Farm Trac's Vet Ledger module automatically calculates the withdrawal period end date from the administration date, the product's registered withdrawal period, and the administration route. The end date is written into the record and appears in the farm planner as a withdrawal period event for the treated animal or group.\n\nWhen a staff member is assigned a task involving a treated animal — sale preparation, movement, or milk inclusion — the system checks the withdrawal period and raises an alert if the date has not yet passed. This check happens automatically — the compliance burden does not rest on a staff member remembering to check a notebook.\n\nSMS alerts can be configured to notify the relevant person (herdsperson, farm manager, or vet) when a withdrawal period is approaching its end date, so animals can be returned to production at the earliest legal opportunity rather than staying off milk or out of the sale pen unnecessarily.",
      },
      {
        heading: "Medicines that are frequently missed",
        content: "• Fly products and pour-on treatments — often administered without being recorded because they are purchased over the counter and applied informally\n• Footbath chemicals — some formulations are veterinary medicines with withdrawal periods\n• Intramammary tubes applied at dry-off — withdrawal periods apply from the expected calving date, not the date of administration, and vary significantly between products\n• Off-licence use — any medicine administered outside its licensed indication has a default 28-day slaughter withdrawal period under the Cascade rule, regardless of the licensed withdrawal period\n\nBDE Farm Trac's medicine record includes a cascade flag for off-licence use, and the system applies the 28-day default automatically when this flag is set.",
      },
    ],
  },
  {
    slug: "tb-test-records",
    tag: "Cattle",
    tagColor: "bg-orange-100 text-orange-700",
    icon: Beef,
    title: "TB testing on farm: keeping compliant between official test dates",
    summary: "Official TB tests are carried out by your vet under APHA instruction — but the compliance obligations between tests fall on the farmer. Here is what you need to record, what the planner implications are, and how to stay ahead of the paperwork when reactors are found.",
    readTime: "5 min read",
    body: [
      {
        heading: "The testing cycle and your responsibilities",
        content: "Bovine tuberculosis (bTB) testing in England is governed by the Animal Health Act 1981 and the TB Eradication Programme. Your farm's testing frequency — annual, six-monthly, or in some areas every 60 days — is set by APHA and communicated through a TB1 test notice. Failure to present cattle for testing within the notified period can result in a herd restriction being placed on the holding without a reactor being found.\n\nYour responsibility as the farmer is to:\n\n• Ensure all eligible cattle are present and correctly restrained on the test day\n• Record the TB test date, the name of the testing vet, and the outcome in your farm records\n• Record any reactors or inconclusive reactors with their ear tag numbers and the date of removal\n• Record the date the official TB3 or TB7 form (now issued digitally via the TB Hub) was received\n• Record the test read date separately from the test injection date — the read takes place 72 hours after injection and both dates are part of the formal record",
      },
      {
        heading: "What happens when a reactor is found",
        content: "A reactor (a confirmed positive animal) triggers a herd restriction — your herd is placed under a movement standstill and you cannot move cattle off the holding except to a dedicated abattoir or slaughter facility. The restriction is lifted only after a clear disclosure test, which is typically carried out 60 days after the removal of the last reactor.\n\nDuring the restriction period you must record:\n\n• The ear tag number and description of every reactor and any inconclusive reactors\n• The date each animal was collected by the knacker or taken to the designated abattoir\n• The disposal reference number (TB9 form) for each animal removed\n• The date of any re-tests and their outcomes\n• Any communication from APHA relating to the restriction, including the restriction start and end dates\n\nThese records are required for the lifetime of the herd and are commonly requested during Red Tractor audits, lender due diligence, and farm sales.",
      },
      {
        heading: "How BDE Farm Trac handles TB records",
        content: "The Cattle Livestock module in BDE Farm Trac includes a dedicated TB testing section. Each test is recorded with injection date, read date, testing vet, and outcome. Reactors are flagged on the individual animal record with their disposal details and TB9 reference.\n\nThe farm planner automatically surfaces:\n\n• The next test due date (calculated from the last test date and the holding's testing frequency)\n• Re-test due dates following a restriction\n• Read-date reminders (72 hours after injection) so the vet visit can be scheduled without relying on memory\n\nFor herds under restriction, the planner marks the restriction period and the earliest date at which the disclosure test can take place — reducing the risk of a test being delayed because the date calculation was wrong.",
      },
      {
        heading: "Red Tractor and bTB",
        content: "Red Tractor's Cattle standards require a documented TB test history as part of the annual audit. The record must show that tests were carried out within the required frequency and that all reactors were removed within the required time period. A farm with an unexplained gap in its TB test record — a test that was overdue, or a reactor removal that was not documented — will face a non-conformance at audit.\n\nBDE Farm Trac's TB records are exportable as a structured report showing the full test history for the holding — test date, read date, vet name, reactor count, and disposal details — in a format that is ready to present to an auditor or inspector.",
      },
    ],
  },
  {
    slug: "puwer-compliance",
    tag: "Equipment",
    tagColor: "bg-slate-100 text-slate-700",
    icon: Tractor,
    title: "PUWER compliance on farm: what records does the law require?",
    summary: "The Provision and Use of Work Equipment Regulations 1998 (PUWER) apply to every piece of equipment used on a farm. Non-compliance is a personal liability for the farm occupier — here is what records you must keep and how to maintain them efficiently.",
    readTime: "6 min read",
    body: [
      {
        heading: "What is PUWER and who does it apply to?",
        content: "The Provision and Use of Work Equipment Regulations 1998 (PUWER) place a legal duty on employers and the self-employed to ensure that all work equipment — including all farm machinery, tractors, implements, vehicles, power tools, and hand tools — is:\n\n• Suitable for its intended use\n• Safe for use and maintained in a safe condition\n• Only used by people who have received adequate information, instruction, and training\n• Accompanied by appropriate safety measures (guards, controls, warning devices)\n\nOn a farm, PUWER applies to every piece of equipment from a combine harvester down to a chainsaw, angle grinder, or pressure washer. The regulations are enforced by the Health and Safety Executive (HSE). An improvement notice, prohibition notice, or prosecution following an injury can result from a PUWER inspection.",
      },
      {
        heading: "What records are required?",
        content: "PUWER itself does not prescribe a specific record format, but requires that inspection and maintenance be documented to demonstrate compliance. In practice, inspectors and auditors expect to see:\n\n• A register of all work equipment on the holding, with make, model, serial number, and type\n• A record of any pre-use inspection or risk assessment carried out before new equipment is put into service\n• A maintenance and service history for each item of equipment, showing the date, nature of the work carried out, and who carried it out\n• A record of any safety-critical inspections — particularly for equipment covered by LOLER (Lifting Operations and Lifting Equipment Regulations 1998), such as telehandlers, foreloaders, and hydraulic systems\n• A record of any defects identified and the action taken to rectify them\n• Training records showing that operators have received appropriate instruction for each class of equipment\n\nFor Red Tractor, the Cross-Compliance baseline requires a documented annual inspection of all tractors and self-propelled machinery, and a current sprayer test certificate (NSTS) for all crop sprayers.",
      },
      {
        heading: "The most commonly overlooked equipment",
        content: "• PTO-driven equipment — guards must be in place and checked regularly; a missing PTO guard is one of the most common enforcement actions\n• Telehandlers and foreloaders — subject to LOLER as well as PUWER, requiring a thorough examination by a competent person every 12 months (or 6 months if used to carry people)\n• Grain augers and conveyors — in-running nip points require guarding; often inspected informally but not documented\n• Workshop equipment — angle grinders, bench grinders, compressed air equipment, and pillar drills are frequently missed from equipment registers\n• Quad bikes and ATVs — must have PUWER records even though they are not MOT-tested; risk assessments for their use are increasingly expected by Red Tractor auditors",
      },
      {
        heading: "How BDE Farm Trac handles PUWER compliance",
        content: "The Equipment Register module maintains a full asset register for every item of work equipment on the holding. Each asset record holds make, model, serial number, type, purchase date, and current status.\n\nFrom the asset record you can log:\n\n• Pre-use inspection results (pass / advisory / fail) with photo attachments\n• Service events (annual service, interim service, repair, safety inspection) with date, description, and the contractor or technician who carried out the work\n• NSTS sprayer test certificates with test date and next-due date\n• MOT and insurance renewal dates — with traffic-light status badges on the equipment list so overdue items are immediately visible\n• Defects identified during pre-use checks, with a follow-up action and resolution record\n\nThe farm planner draws from all equipment records and surfaces service-due and inspection-due reminders before the deadline — so you are scheduling the inspection rather than realising after the fact that it has been missed.",
      },
    ],
  },
  {
    slug: "organic-certification",
    tag: "Organic",
    tagColor: "bg-green-100 text-green-700",
    icon: Leaf,
    title: "Organic certification record-keeping: what your certifier will check",
    summary: "Organic certification audits are thorough and the record-keeping requirements are specific. Here is what Soil Association and OF&G inspectors will look for — and the records that are most commonly incomplete.",
    readTime: "7 min read",
    body: [
      {
        heading: "Why record-keeping is central to organic certification",
        content: "Organic certification is fundamentally a system of assurance — assurance that your land, inputs, and production processes comply with the standards set out in UK Organic Regulations 2020 (retained from EU Reg 848/2018). Because inspectors cannot be present for every management decision, the records you keep are the evidence base for your certification. An incomplete or inconsistent record is treated as a potential breach — not simply an administrative shortcoming.\n\nBoth the Soil Association and OF&G carry out annual inspections and may carry out unannounced spot checks. The inspection covers your land, your animals (if you farm livestock), your inputs, and your record-keeping. A non-conformance in any area can trigger additional conditions on your certificate, a suspension, or in serious cases a withdrawal of certification.",
      },
      {
        heading: "Land and field records",
        content: "Your certifier will check:\n\n• A current field register showing every field on your holding with its area, soil type, and current organic status (in conversion / fully organic / conventional)\n• Conversion history — the date each field entered conversion, the pre-conversion land use and any prohibited inputs applied in the three years before conversion\n• Boundary records showing the risk of contamination from adjacent non-organic land (spray drift, run-off, shared equipment)\n• Crop rotation records demonstrating that rotations comply with the principle of building soil fertility through organic matter and legumes\n\nFor fields that are still in conversion, the three-year conversion period must be evidenced from the date of the organic management agreement, not simply from when you first applied to certify.",
      },
      {
        heading: "Input and substance records",
        content: "The use of off-farm inputs — fertilisers, pest control products, cleaning agents, and veterinary medicines — is tightly restricted under organic standards. Your certifier will check:\n\n• A purchase record for every input used on the holding during the certification year — product name, manufacturer, quantity purchased, and date\n• Evidence that each input is approved for use in organic systems — either through inclusion on the Soil Association or OF&G approved inputs list, or through a formal derogation\n• A derogation case file for any input used under derogation (temporary permission) — this must include the application, the certifier's response, and the conditions attached\n• Copper records for viticulture or other uses — running total applied per hectare against the 28 kg/ha per 7-year limit under the copper regulation (EU Reg 1981/2018, retained in UK law)\n\nThe most common finding at organic inspection is an input that was used without being checked against the approved list, or a derogation that was never formally applied for.",
      },
      {
        heading: "Livestock records for organic farms",
        content: "Organic livestock standards go beyond conventional livestock compliance. Your certifier will check:\n\n• Evidence of outdoor access and free-range conditions being maintained (for relevant species)\n• Feed records demonstrating that at least 60% of the ration (rising to 100% for ruminants from 2025 under the new UK Organic Regulations) is produced on the organic holding or sourced from other organic units\n• A medicine record showing that the Cascade (off-licence use) has not been used unless formally approved, and that any conventional medicine use has been followed by a doubled withdrawal period as required under organic standards\n• Records of any temporary housing or grazing restriction, with the reason and the certifier's awareness where required",
      },
      {
        heading: "How BDE Farm Trac supports organic record-keeping",
        content: "BDE Farm Trac's Organic Arable and Organic Viticulture modules are built specifically around the record types that certifiers check. The field register tracks conversion status per field with conversion start date and pre-conversion history. The organic input log records every input with approval status linked to certifier lists. The derogation case module manages the full New Case → Application → Decision → Conditions → Corrective Action workflow with status tracking and expiry alerts.\n\nFor viticulture, the copper register maintains a running 28 kg/ha per 7-year balance per block with a colour-coded progress bar, and each application is recorded with date, product, quantity, and the resulting cumulative total — giving you and your certifier complete visibility of your copper position at any point.\n\nAll organic records are exportable as a structured report in the format most certifiers expect — giving you something substantive to provide ahead of your inspection rather than spending the week before it pulling records together from multiple sources.",
      },
    ],
  },
  {
    slug: "lambing-mortality-records",
    tag: "Sheep",
    tagColor: "bg-amber-100 text-amber-700",
    icon: Sprout,
    title: "Lambing mortality records: why the data matters and how to capture it efficiently",
    summary: "Perinatal mortality — lambs that are stillborn or die within 24 hours of birth — is one of the highest-value metrics in sheep production. Most flocks capture the data during lambing but never analyse it. Here is how to turn that data into management decisions.",
    readTime: "5 min read",
    body: [
      {
        heading: "Why perinatal mortality matters",
        content: "UK sheep industry data consistently shows that perinatal mortality accounts for approximately 15–20% of all lambs born in any given season — a figure that represents a significant financial and welfare loss. The majority of these deaths are preventable or at least reducible with management changes — but only if you know where the losses are occurring, which ewes are losing lambs, and whether the losses are concentrated in specific flock groups, age classes, or time periods.\n\nWithout structured records, this data exists only in a shepherd's memory. Seasonal patterns, breed-specific differences, and the impact of management changes (nutrition, housing, synchronisation protocol) cannot be detected across years. The result is that the same problems recur, year after year, without the evidence base to justify changing the approach.",
      },
      {
        heading: "What to capture at lambing",
        content: "The minimum dataset for meaningful perinatal mortality analysis is:\n\n• Ewe ear tag number\n• Scanning result (barren / singles / twins / triplets)\n• Number of lambs born alive\n• Number of lambs stillborn (born dead)\n• Number of lambs died within 24 hours (neonatal death)\n• Date of birth\n• Birth weight where practical\n• Any clinical notes (malpresentation, prolapse, assisted delivery, colostrum failure)\n\nAt the flock level, you also need:\n\n• Total ewes scanned\n• Total ewes that have lambed\n• Scanning percentage (lambs expected per ewe scanned)\n• Lambing percentage (lambs born alive per ewe put to the ram)\n\nThese figures are required for meaningful comparison against breed society benchmarks and are increasingly expected as part of enterprise performance reporting for lenders, advisors, and assurance schemes.",
      },
      {
        heading: "Red Tractor and welfare records",
        content: "Red Tractor's Sheep Standards require a documented flock health plan, written in conjunction with your farm vet, which sets targets for key welfare indicators including lamb mortality. The plan must be reviewed annually and updated to reflect the previous season's performance.\n\nThis means you need not only the lambing records themselves, but a documented discussion with your vet about what the figures mean and what actions are planned in response. A flock health plan that says 'perinatal mortality target: less than 5%' without any reference to last season's actual figure is not a meaningful document — and auditors increasingly recognise this.",
      },
      {
        heading: "How BDE Farm Trac captures and analyses lambing data",
        content: "The Sheep Livestock module captures every lambing event — ewe tag, number born alive, number stillborn, number dead within 24 hours, birth date, and any clinical notes — at the point of recording, including via the mobile app in the lambing shed. Records can be entered quickly using a minimal input form designed for use with cold hands and poor lighting.\n\nOnce the season's data is in, the Analytics tab produces:\n\n• A KPI panel showing ewes lambed, total lambs born, stillborn percentage, and died-within-24h percentage — each with colour-coded thresholds (green below 2%, amber 2–5%, red above 5%) aligned with industry benchmarks\n• A season-on-season comparison table showing how this year's figures compare against previous seasons — with inline bar charts for visual trend identification\n• A scanning percentage calculation and lambing percentage figure\n\nThese figures can be exported and shared with your vet for the flock health plan review, or included in an enterprise performance report for your farm business consultant or bank.",
      },
      {
        heading: "Using the data to drive management change",
        content: "The analytical value of lambing records comes from asking specific questions of the data:\n\n• Are losses higher in one flock group than another — and if so, does that group have a different nutritional history, lambing date, or housing density?\n• Are stillbirths concentrated on a specific date range, suggesting a synchronisation or vaccination timing issue?\n• Are neonatal deaths (alive at birth, dead within 24h) higher than expected — suggesting colostrum failure, chilling, or mismothering rather than parturition problems?\n• Are triplet-bearing ewes accounting for a disproportionate share of lamb mortality — suggesting that triplets are being left on the ewe rather than fostered or bottle-reared?\n\nNone of these questions can be answered from a total lamb count. A structured record — even a minimal one — is what turns lambing data from a number into a management tool.",
      },
    ],
  },
  {
    slug: "report-builder-guide",
    tag: "Data & Reporting",
    tagColor: "bg-indigo-100 text-indigo-700",
    icon: BarChart3,
    title: "How to use the BDE Farm Trac Report Builder to analyse your farm data",
    summary: "The Report Builder lets you build custom reports from any of your farm records in four steps — no spreadsheet export needed. Here is how to use it to answer the questions that actually matter for your operation.",
    readTime: "5 min read",
    body: [
      {
        heading: "Why a custom report builder matters for farm businesses",
        content: "Standard compliance reports answer one question: have you recorded everything you need to? A custom report builder answers a different set of questions: which fields had the most spray applications this season? Which medicines were used most frequently last quarter? Which pieces of equipment are overdue for a service? Which staff training certificates expire in the next six months?\n\nThese are farm management questions, not just compliance questions. They are the kind of analysis that used to require exporting raw data to a spreadsheet, cleaning it, and building a pivot table — a process that either took a skilled administrator or did not happen at all. The BDE Farm Trac Report Builder makes this kind of analysis available to every farm manager, directly in the platform, in under two minutes.",
      },
      {
        heading: "Step 1 — Choose your datasource",
        content: "Open Integrations & API → Report Builder in the dashboard sidebar and click New Report. The first step asks you to select a datasource. Ten are available:\n\n• Fields — your full field register\n• Livestock — herd and flock data\n• Medicine Records — all veterinary medicine applications\n• Spray Applications — all spray records\n• Soil Tests — soil analysis results\n• Crop Assignments — field-to-crop assignments by season\n• Inspections — scheme inspection records\n• Training Records — staff training and certificates\n• Equipment — equipment register and service records\n• Financials — purchase orders and financial records\n\nChoose the one that contains the data you want to analyse. Each datasource exposes all the fields stored in that module.",
      },
      {
        heading: "Step 2 — Pick your columns",
        content: "The column picker shows every available field for your chosen datasource. Tick only the columns you need — a report with fewer columns is easier to read and analyse. Use Select All to include everything, or Clear to start fresh.\n\nFor example, a medicine cost report from Medicine Records might include: Animal Tag, Product Name, Withdrawal Period (days), Treatment Date, and Dose Administered. You do not need Unit Cost in the Report Builder — add that analysis in your spreadsheet after export if required.",
      },
      {
        heading: "Step 3 — Apply filters to narrow your results",
        content: "Without filters, the report returns every record for your farm from that datasource. Two types of filter let you focus on exactly the data you need:\n\nDate range — set a From and To date. For example, to see all spray applications from the 2024-25 season, set From to 1 August 2024 and To to 31 July 2025.\n\nField-level filters — add one or more conditions using an equals, contains, greater-than, or less-than operator. Examples:\n• Field Name equals 'Top Field' — restrict results to a single field\n• Area (ha) greater than 20 — only large fields\n• Status equals 'Expired' — only expired training certificates\n\nFilters stack: a date range filter combined with a field filter gives you records matching both conditions.",
      },
      {
        heading: "Step 4 — Preview, chart, and export",
        content: "The preview table shows your results immediately. From here you have three options:\n\nExport to CSV — download the data as a spreadsheet. The file opens directly in Excel or Google Sheets. This is the fastest route if you want to do further analysis, share with an agronomist, or attach to an inspection file.\n\nAdd a chart — configure a bar, line, or pie chart to visualise your results without leaving the platform. Select a Label Field (what appears on the axis or as segments), a Value Field (the number to measure), and an Aggregation:\n• Count — how many records per label (e.g. number of spray events per field)\n• Sum — total of the value field (e.g. total area treated per crop type)\n• Average — mean value per label (e.g. average dose per product)\n\nSave the report — give it a name and save the definition. The next time you need this report, click Run from the saved reports list on the Report Builder home page and it executes against your current live data. Saved reports are report definitions, not snapshots — they always show current data when run.",
      },
      {
        heading: "Practical report ideas for different farm types",
        content: "Arable farms:\n• Spray application summary by field and product — filter to current season, group by field name with count to see application frequency per field; export for agronomist review\n• Soil test status report — filter Status equals 'Pending' to see which fields are awaiting results\n• Crop assignment history — run unfiltered with field name, crop, and sow date to see rotation at a glance\n\nLivestock farms:\n• Medicine usage review — filter to last 90 days, bar chart on Product Name with count aggregation; identify the most-used products for vet ledger review\n• Withdrawal period exposure — filter Treatment Date to last 30 days; export for withdrawal period cross-check\n• Training certificate expiry — Training Records datasource, filter Expiry Date less than a date 6 months ahead to plan renewal conversations\n\nAll farm types:\n• Equipment service overdue — Equipment datasource, filter Next Service Date less than today; export and share with the workshop\n• Inspection non-conformance review — Inspections datasource, filter Outcome equals 'Non-Conformance'; see recurring patterns across years",
      },
    ],
  },
];

const ALL_TAGS = ["All", ...Array.from(new Set(ARTICLES.map((a) => a.tag)))];

export default function Resources() {
  const [activeTag, setActiveTag] = useState("All");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const filtered = activeTag === "All" ? ARTICLES : ARTICLES.filter((a) => a.tag === activeTag);
  const activeArticle = ARTICLES.find((a) => a.slug === activeSlug);

  if (activeArticle) {
    const AIcon = activeArticle.icon;
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <button
            onClick={() => setActiveSlug(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-forest mb-8 transition-colors"
          >
            ← Back to all articles
          </button>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4 ${activeArticle.tagColor}`}>
            <AIcon className="w-3.5 h-3.5" />
            {activeArticle.tag}
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3 leading-tight">{activeArticle.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Clock className="w-4 h-4" />
            {activeArticle.readTime}
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed mb-10 border-l-4 border-brand-forest/30 pl-4">
            {activeArticle.summary}
          </p>
          <div className="space-y-10">
            {activeArticle.body.map((section, i) => (
              <div key={i}>
                <h2 className="text-xl font-semibold text-foreground mb-3">{section.heading}</h2>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  {section.content.split("\n\n").map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-brand-forest to-brand-sage p-8 text-white">
            <p className="font-semibold text-lg mb-2">Manage your {activeArticle.tag.toLowerCase()} records in BDE Farm Trac</p>
            <p className="text-emerald-100 text-sm mb-5">
              Everything described in this article is built into BDE Farm Trac — structured records, compliance alerts, and reports that are ready for an inspector before they arrive.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button className="bg-white text-brand-forest hover:bg-emerald-50" asChild>
                <Link href="/register-interest">
                  Register interest <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 bg-transparent" asChild>
                <Link href="/features">See the features</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-forest via-brand-sage to-emerald-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-emerald-100 mb-6">
              <BookOpen className="w-4 h-4" />
              Compliance Guides
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              Plain-English guides to farm compliance
            </h1>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              Practical, accurate information on what records the law and your assurance scheme actually require — written for farmers, not solicitors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tag Filter */}
      <section className="sticky top-[88px] z-30 bg-white border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTag === tag
                    ? "bg-brand-forest text-white shadow-sm"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article, i) => {
              const AIcon = article.icon;
              return (
                <motion.button
                  key={article.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setActiveSlug(article.slug)}
                  className="text-left flex flex-col gap-4 p-5 rounded-xl border border-border bg-white hover:shadow-md hover:border-brand-forest/30 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${article.tagColor}`}>
                      <AIcon className="w-3.5 h-3.5" />
                      {article.tag}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 group-hover:text-brand-forest transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">{article.summary}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-brand-forest mt-auto">
                    Read article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary/40 py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <ClipboardList className="w-10 h-10 text-brand-forest mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to make compliance easier?</h2>
          <p className="text-muted-foreground mb-7">
            BDE Farm Trac handles every record type described in these guides — structured, digital, and audit-ready from day one.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button className="bg-brand-forest hover:bg-brand-sage text-white rounded-full px-8 h-12" asChild>
              <Link href="/register-interest">
                Get started <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full px-8 h-12" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
