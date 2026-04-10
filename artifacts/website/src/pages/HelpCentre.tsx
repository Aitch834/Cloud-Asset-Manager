import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, ChevronDown, ChevronUp, BookOpen, Sprout, ShieldCheck, FlaskConical,
  Tractor, PawPrint, ClipboardCheck, LifeBuoy, Phone, Mail,
  LeafyGreen, Leaf, AlertTriangle, LineChart, CloudRain, Landmark, Store, Fuel, Package,
} from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}
interface FaqCategory {
  title: string;
  icon: React.ElementType;
  color: string;
  items: FaqItem[];
}

const FAQ: FaqCategory[] = [
  {
    title: "Getting Started",
    icon: BookOpen,
    color: "bg-brand/10 text-brand border-brand/20",
    items: [
      { q: "How do I set up my farm on BDE Farm Trac?", a: "After registering, you will be taken through a short setup wizard. Enter your farm name, holding number, county, and farm type. You can add multiple farm holdings to a single account — each with its own fields, staff, and records. Once created, you select your active farm from the top of the sidebar." },
      { q: "Can I use BDE Farm Trac for more than one farm or holding?", a: "Yes. BDE Farm Trac supports multi-farm accounts. Each farm holding is managed independently — with its own fields, livestock, staff, and compliance records — but you can switch between them instantly from one login. Pricing is per holding per month." },
      { q: "Is my data backed up automatically?", a: "Yes. All data is stored on Barnett Davies Enterprises' cloud infrastructure with automatic daily backups. You do not need to export or manage backups yourself. Records are retained in line with Red Tractor's five-year document retention guidance." },
      { q: "Does BDE Farm Trac work on mobile?", a: "Yes. The BDE Farm Trac mobile app is available for iOS and Android and is designed for field use — spray records, livestock events, fuel drawdowns, visitor sign-in with digital signature, QR scanning, and GPS location capture all work fully offline and sync automatically when connectivity is restored." },
      { q: "Which modules do I need for Red Tractor compliance?", a: "For combinable crops, you will typically need Crop Management (spray records, field journal, variety and seed logs), Soil Management (NMP, NVZ, soil sampling), and Finance & Business (purchase and sales records). Biosecurity and Staff & Training are required for livestock standards. The Pricing page has an interactive module selector to help you choose." },
    ],
  },
  {
    title: "Organic Compliance",
    icon: Sprout,
    color: "bg-green-50 text-green-700 border-green-100",
    items: [
      { q: "Does BDE Farm Trac replace my Soil Association or OF&G portal?", a: "No — and it is not designed to. The Organic Compliance module is a complementary record system. Your official organic certification is managed directly with your certifier (Soil Association, OF&G, Biodynamic Association, etc.). BDE Farm Trac holds a reference copy of your certification details, field status, inspection visits, and restricted input records alongside your other operational records, so everything is in one place for audit purposes." },
      { q: "What is the two-year conversion progress tracker?", a: "For fields recorded as 'In Conversion', BDE Farm Trac automatically calculates how far through the statutory two-year conversion period the land is, displayed as a visual progress bar. It also shows the expected certification date based on your recorded conversion start date." },
      { q: "What counts as a restricted input?", a: "A restricted input is any product not normally permitted under organic standards (such as a synthetic fertiliser or conventional pesticide) used under exceptional circumstances — for example, where no permitted alternative is available and the certifier has been consulted. You must log the product, your written justification, any certifier approval reference, and whether the certifier has been notified. Always consult your certifier before use." },
      { q: "Can I print an organic inspection register for my assessor?", a: "Yes. The Inspections tab in the Organic Compliance module includes a Print Register button that generates a formatted A4 landscape document containing all inspection records, outcomes, non-conformances, and actions. This is suitable for presenting to your certifier or an independent auditor." },
      { q: "What is parallel production and do I need to record it?", a: "Parallel production applies when a holding runs both certified organic and non-organic (conventional) land at the same time. This is permitted in some circumstances but must be disclosed to your certifier. The field status form has a parallel production checkbox — tick this for any field where this applies." },
    ],
  },
  {
    title: "Biosecurity",
    icon: ShieldCheck,
    color: "bg-red-50 text-red-600 border-red-100",
    items: [
      { q: "Can I capture a digital signature for visitor sign-in?", a: "Yes. The mobile visitor log includes a full digital signature pad. Visitors can sign directly on screen using their finger or a stylus. The signature is stored with the visit record and syncs to the dashboard. The visitor declaration (confirming no contact with livestock in the past 72 hours and agreement to farm biosecurity rules) is displayed before signature capture." },
      { q: "How do I record pest control treatments?", a: "Navigate to Biosecurity > Pest Control. You can log each treatment event with the target pest, bait type, active ingredient, location, date, and the contracted pest controller's details. Records are filterable by crop year." },
      { q: "Can I print a COSHH register?", a: "Yes. The COSHH Assessments tab includes a Print Register button that generates a formatted A4 document with all your substance assessments, suitable for presenting to a Red Tractor inspector or health and safety auditor." },
      { q: "What is the Cleaning & Disinfection log used for?", a: "This log records all cleaning and disinfection events across your farm buildings and areas — including the product used, dilution rate, contact time, who carried out the work, and the area cleaned. It satisfies the Red Tractor requirement for documented biosecurity procedures." },
      { q: "What is the Feed Contingency Plan and why do I need one?", a: "Red Tractor requires livestock farms to have a documented plan for maintaining feed supply during a disruption — for example, a supplier withdrawal, transport failure, or a disease restriction that prevents deliveries. The Feed Contingency Plan section lets you record your minimum stock targets (days' cover and total kg alert threshold), your primary feed supplier, alternative suppliers with lead times, and written procedures covering trigger conditions, rationing, communication, and recovery. The plan carries a review date badge so you know when it is due for update. A Red Tractor inspector may ask to see this document." },
      { q: "How do I log a notifiable disease suspicion and report to APHA?", a: "Navigate to Compliance & Plans and open the Disease & Incident Log tab. Click Log Incident and set the Incident Type to Notifiable Disease. A red alert will appear reminding you to contact APHA immediately on 03000 200 301 — do not wait for laboratory confirmation. A dropdown lets you specify the disease type (FMD, Bluetongue, Avian Influenza, African Swine Fever, Brucellosis, bTB, Anthrax, and others). Record the vet response, any isolation and movement restriction applied, and the APHA reference number once you have reported. The incident remains open until an outcome and lesson learned are recorded and you set the status to Resolved." },
      { q: "How do I raise a feed recall or withdrawal incident?", a: "Go to Compliance & Plans and open the Feed Recall & Withdrawal Incidents tab. Click Raise Incident and select the concern type — contamination, mislabelling, supplier-issued recall, disease link, or regulatory advice from APHA or Trading Standards. Enter the product name (autocompletes from your delivery records), supplier (selected from your Supplier Register), and batch or lot number. Record whether the feed has been physically withdrawn, which herds or groups were affected, and the estimated number of animals. Use the Notifications section to log when you notified the supplier, a regulatory authority, and your vet — with reference numbers and dates for each. Once the situation is resolved, record the outcome and close the incident." },
    ],
  },
  {
    title: "Sprays & Inputs",
    icon: FlaskConical,
    color: "bg-amber-50 text-amber-700 border-amber-100",
    items: [
      { q: "Does the spray record module meet Red Tractor requirements?", a: "Yes. The spray record form captures all fields required by Red Tractor Combinable Crops and Horticulture standards: crop, field, product name, MAPP number, application date, rate per hectare, total area, operator, and equipment. Records can be printed as a formatted spray register directly from the dashboard." },
      { q: "How do I log pesticides bought for the season?", a: "The Sprays & Inputs module includes a Pesticide Purchases log. Record the product, supplier, quantity, batch number, invoice reference, and date. These records link to your spray records for traceability and satisfy the purchase-to-application audit trail required by assurance schemes." },
      { q: "Can I record buffer zones and weather conditions on spray records?", a: "Yes. Each spray record includes fields for wind speed, wind direction, temperature, and buffer zone distances. These fields satisfy the requirements for operator protection and environmental protection under the Code of Practice for Using Plant Protection Products." },
    ],
  },
  {
    title: "Livestock & Medicine",
    icon: PawPrint,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    items: [
      { q: "What movement records does BDE Farm Trac capture?", a: "The Livestock module records all movements on and off the holding, including species, ear tag, date, origin and destination holding number, and transport details. Records cover cattle, sheep, goats, pigs, deer, and equines. The Movements register includes the AML reference field, BCMS status badge, and one-click submission buttons for both cattle (BCMS via CTS Web Services) and sheep, goats and deer (LIS via the England CLA API)." },
      { q: "How does BCMS one-click submission work for cattle?", a: "In Farm Settings, enter your CTS Web Services username and password under the BCMS / CTS One-Click Submission section and click Test Connection. Once connected, each cattle movement row in the Movements register shows a Submit to BCMS button. Clicking it sends the movement directly to the British Cattle Movement Service and stores the BCMS reference back against the record. A BCMS Submissions tab in the Movements register shows the full history of submissions, statuses, and any error messages. Sandbox mode is active until your DEFRA vendor credentials are configured — in sandbox mode the full API payload is logged and simulated without sending data to BCMS." },
      { q: "How does LIS one-click submission work for sheep, goats and deer?", a: "In Farm Settings, enter your Livestock Information Service username and password under the LIS / Livestock Information Service section and click Test Connection. Once connected, a blue Submit to LIS button appears on each sheep, goat and deer movement row. Clicking it opens a confirmation dialog showing the movement details before submitting directly to the England government CLA API (Livestock Information Service). A LIS Submissions tab in the Movements register shows the full history with LIS reference numbers, submission status, and the JSON payload sent. Sandbox mode is active until BDE's platform subscription key is registered — sandbox submissions are fully simulated with no data sent to LIS." },
      { q: "What is the difference between BCMS and LIS?", a: "BCMS (British Cattle Movement Service) is the England and Wales government database for cattle movements, managed through CTS (Cattle Tracing System). LIS (Livestock Information Service) is the newer England government platform for sheep, goat, and deer movement reporting — replacing the paper AML forms. BDE Farm Trac integrates with both: BCMS via CTS Web Services (CTWS), and LIS via the CLA API with Azure B2C authentication. Cattle movements use BCMS; sheep, goat and deer movements use LIS." },
      { q: "How are medicine withdrawal periods tracked?", a: "Each medicine record includes the product name, batch number, dose, route of administration, withdrawal period in days, and the treated animal's identifier. BDE Farm Trac automatically calculates the withdrawal end date and surfaces a warning if any animal with an active withdrawal period is recorded as sold or slaughtered." },
      { q: "Can I record AI and reproductive events?", a: "Yes. The Reproduction module covers AI records (sire, breed, method, straw batch traceability), pregnancy confirmations, and expected calving/lambing dates. Expected birth dates feed automatically into the Farm Planner calendar." },
      { q: "Is the feed traceability log Red Tractor-compliant?", a: "Yes. Each feed delivery record captures supplier, UFAS/FEMAS number, delivery note and invoice reference, feed type, batch/lot number, quantity, and unit price. Medicated feeds are flagged with withdrawal period end dates. This satisfies the feed materials traceability requirements of Red Tractor Beef & Lamb, Dairy, and Pigs standards." },
      { q: "How do I navigate quickly from a Week Ahead alert to a specific feed bin?", a: "Feed stock alerts on the Week Ahead page — including low stock, out of stock, and awaiting delivery notifications — are linked directly to the specific feed bin that triggered them. Clicking the alert takes you straight to the Feed Management page, which automatically opens the Feed Bins tab, scrolls to the relevant bin card, and highlights it with a coloured ring for a few seconds so it is immediately obvious which bin needs attention." },
      { q: "How does the Raise Reorder button work on a feed bin?", a: "On any feed bin card showing a Low Stock or Out of Stock status, a Raise Reorder button appears at the bottom of the card (only when no order is already in progress). Clicking it opens a dialog showing the bin name, supplier, and current stock level. You can optionally enter an expected delivery date and any notes for the bin record. You can also assign the reorder task to a named staff member — select them from the dropdown, add a task due date and a note to them (for example, the supplier phone number or the quantity to order). If that staff member has a mobile number registered in BDE Farm Trac, an SMS is sent to them automatically with the task title, due date, and your note. Clicking Confirm Reorder Raised marks the bin as Awaiting Delivery — suppressing the low/out-of-stock alerts on Week Ahead — and creates a Task Board entry assigned to the chosen staff member with a direct link back to that bin for tracking." },
    ],
  },
  {
    title: "Soil & Environment",
    icon: LeafyGreen,
    color: "bg-teal-50 text-teal-700 border-teal-100",
    items: [
      { q: "Does the Soil Management module cover NVZ rules?", a: "Yes. The NVZ Compliance section records your NVZ designations, closed-period restrictions, and slurry / organic manure spreading events. It calculates your annual nitrogen loading and compares it against the 170 kg N/ha limit, with a warning flag if you exceed the threshold." },
      { q: "Can I log soil samples and RB209 applications?", a: "Yes. The Soil Sampling log records each sample with GPS location, depth, analysis laboratory, and results for pH, P, K, Mg (indices) plus organic matter. A separate Nutrient Management Plan section lets you record your planned applications in line with FACTS/RB209 guidance." },
      { q: "Does BDE Farm Trac integrate with soil moisture sensors?", a: "The Soil Management module supports manual soil moisture deficit (SMD) logging. For continuous sensor integration, contact us — sensor connectivity is on our development roadmap." },
    ],
  },
  {
    title: "Staff & Training",
    icon: ClipboardCheck,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    items: [
      { q: "What certificate types can I record?", a: "BDE Farm Trac supports 50+ certificate types across 10 groups: Pesticide Application (PA1–PA6AW), Livestock Welfare (WASK/WATOK, disbudding, AI), Animal Transport (Cat 1 & 2), Machinery (telehandler, FLT, ATV, combine), Chainsaw (CS30–CS38), Health & Safety (FAW, EFAW, COSHH, confined space), Agronomy (BASIS, FACTS, NRoSO), Veterinary & Medicines (AMTRA SQP), Food & Hygiene (Level 2 & 3), and Formal Qualifications." },
      { q: "How does the Right to Work register work?", a: "The staff record includes a Right to Work section where you can record the document type, reference number, check date, and examiner. For time-limited visas, BDE Farm Trac tracks the expiry date and surfaces an urgent alert within 28 days of expiry. The compliance gap panel on the staff list also flags any team member with no Right to Work check recorded." },
      { q: "Can staff see their own tasks on mobile?", a: "Yes. Staff with mobile app access see a Task Inbox in the app showing all tasks assigned to them. Each card shows the task, due date, module, and any manager's note. Staff can mark tasks as in progress or complete with an optional completion note. Managers see status updates in real time on the Task Board in the dashboard." },
    ],
  },
  {
    title: "Finance & Reports",
    icon: LineChart,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    items: [
      { q: "Does BDE Farm Trac connect to my accountancy software?", a: "BDE Farm Trac is not an accountancy package — it is a farm management and compliance record system. Financial records (purchase invoices, sales records, grant payments) are logged here for Red Tractor traceability and farm business planning. You can export records as CSV for import into Xero, QuickBooks, Sage, or similar." },
      { q: "Can I record Basic Payment / SFI payments?", a: "Yes. The Finance & Business module includes a subsidy and grant register where you can record SFI agreement payments, Countryside Stewardship, and other scheme income. Historic BPS payments can also be logged for year-on-year comparison." },
      { q: "How do I record purchase invoices?", a: "Navigate to Finance > Purchases. Log each purchase with supplier, invoice number, date, category, net amount, VAT, and any relevant field or livestock link. Recurring suppliers are remembered from your Supplier Register, saving data entry time." },
      { q: "How do I track grain forward contracts and pool scheme positions?", a: "Open the Finance & Business page on the dashboard and select the Grain Contracts tab. Forward contracts show the merchant, commodity, crop year, agreed price, and a progress bar displaying called-off tonnage against the total committed. Each card expands to list every grain sale linked to that contract, so you can see exactly which loads have been called off. Pool scheme positions are shown separately and track the merchant, commodity, estimated outturn tonnage, and settlement status. When you record a grain sale, you can optionally link it to an open forward contract — the called-off figure updates automatically." },
      { q: "What happens when I deactivate a supplier or contact?", a: "BDE Farm Trac never physically deletes any supplier, buyer, or trade contact record — instead, contacts can be marked as inactive (deactivated) when a relationship ends. All historical records, purchase history, delivery logs, and declarations linked to that contact are preserved in full and remain accessible. A deactivated contact is shown with an Inactive badge in the register and is excluded from active dropdowns so it does not appear as an option when logging new transactions. You can reactivate a contact at any time if the relationship resumes. This design ensures your audit trail is never broken." },
    ],
  },
  {
    title: "Parts Store & Stock Management",
    icon: Package,
    color: "bg-orange-50 text-orange-700 border-orange-100",
    items: [
      { q: "How does the Workshop Parts Store stocktake work?", a: "Open the Workshop page and navigate to the Parts Store tab, then click the Stocktake button in the navigation. The stocktake view lists every part in your parts store with its current system stock quantity. Enter your physical count for each item directly in the count column. Any variance — where your physical count differs from the system — is shown in a coloured badge (red for over-count, orange for under-count, green for zero variance). A summary bar at the top tracks how many items you have checked and whether all variances have been reviewed. When you click Complete Stocktake, a confirmation dialog is shown and all stock levels are updated in one step to match your physical counts." },
      { q: "How does the main stock stocktake work on Suppliers & Stock?", a: "Go to Suppliers & Stock and select the Stocktake tab. The system presents a count sheet of all stock items registered in your main stock register. Enter your physical count for each item. Items with a variance — where the physical count does not match the system quantity — display a colour-coded badge and require you to select a reason for the discrepancy before the stocktake can be completed. The available reason codes are: Calibration (measuring error), Spillage or wastage, Theft or loss, Data entry error, or Other. This is a Red Tractor requirement — every discrepancy must be explained and documented. Once all variances have been assigned a reason, clicking Complete Stocktake updates all stock levels and writes a permanent stock movement record for each adjusted item, creating a full audit trail suitable for a Red Tractor or internal stock audit." },
      { q: "Why does the main stock stocktake block completion until I select a reason for each variance?", a: "Red Tractor standards require that any unexplained difference between a recorded stock level and a physical count is documented with a reason. BDE Farm Trac enforces this at the point of completing a stocktake — you cannot finalise the count until every item showing a variance has a documented reason selected. The available reasons (calibration, spillage, theft, data entry, other) match the categories used in most farm assurance scheme audits. The selected reason is stored permanently against the stock movement record created when the stocktake is completed." },
      { q: "Can I run a stocktake without affecting stock levels for items I did not count?", a: "Yes. Items where you have not entered a physical count (the count field is left blank) are skipped when the stocktake is completed — their stock levels are not changed. This means you can run a partial stocktake, counting only selected items and leaving others unchanged. Only items where you have entered a physical count will have their stock levels updated." },
    ],
  },
  {
    title: "Farm Shop & Diversification",
    icon: Store,
    color: "bg-violet-50 text-violet-700 border-violet-100",
    items: [
      { q: "How does farm shop stock management work?", a: "Each farm shop product has a selling price, cost price, unit, and reorder level. When you record a sale, the product's stock quantity decrements automatically. When you log a purchase delivery from a supplier, stock increases. The live quantity on hand is always visible in the Products tab so you know exactly what is available to sell." },
      { q: "What is the margin column and how is it calculated?", a: "The margin column in the Products table shows the percentage gross margin for each item — calculated as (selling price minus cost price) divided by selling price. It is colour-coded: green for a healthy margin, amber when margin is tight (below around 20%), and red if the product is priced below cost. If no cost price has been entered, the margin column is blank. You can set or update the cost price at any time, or tick 'Update cost price' when recording a purchase to keep it current automatically." },
      { q: "How do I receive low-stock alerts for farm shop products?", a: "Set a reorder level on each product in the Products tab. When a sale brings the stock quantity to or below that level, an in-platform low-stock notification is created automatically. If you have the SMS Text Alerts add-on active, an out-of-stock event (stock reaching zero) will also send a text message to your registered number so you can reorder immediately." },
      { q: "Can I link purchases to specific farm shop suppliers?", a: "Yes. The Suppliers sub-tab within the Farm Shop module lets you maintain a directory of the businesses you buy stock from. When recording a purchase in the Purchases ledger, you select the supplier from this directory — the supplier name is stored with the purchase record for a complete audit trail. Suppliers who are no longer used can be deactivated rather than deleted, preserving all historic purchase records." },
      { q: "Can I update the cost price of a product when I receive stock at a new price?", a: "Yes. When logging a purchase in the Purchases ledger, tick the 'Update cost price' checkbox before saving. This automatically overwrites the product's stored cost price with the unit cost from that purchase. The margin column will recalculate immediately, keeping your profitability data current without any manual edits to the product record." },
    ],
  },
  {
    title: "Biofuel / RTFO",
    icon: Fuel,
    color: "bg-yellow-50 text-yellow-700 border-yellow-100",
    items: [
      { q: "What is the RTFO and who does it apply to?", a: "The Renewable Transport Fuel Obligation (RTFO) is the UK government scheme that requires transport fuel suppliers to blend a proportion of renewable (biofuel) content into the fuel they sell. If you grow OSR, wheat, or other qualifying crops and sell them to an obligated fuel supplier for processing into biofuel, your buyer needs RTFO-compliant sustainability data — including field eligibility records, GHG traceability information, and a signed sustainability declaration from you as the grower. BDE Farm Trac's Biofuel / RTFO module is designed to generate and maintain exactly that documentation." },
      { q: "What is an RTF Obligation Number and where do I find it?", a: "An RTF Obligation Number is the Department for Transport reference number issued to each obligated fuel supplier (your biofuel buyer). It uniquely identifies the buyer in the RTFO system and must appear on every sustainability declaration you issue to them. Your buyer should be able to provide this number. Enter it into their record in the RTFO Buyers register — it will then auto-populate on all sustainability declarations for that buyer." },
      { q: "How do I record a biofuel crop delivery?", a: "Go to the Biofuel / RTFO page and open the Deliveries tab. Click New Delivery and fill in the date, buyer (selected from your Registered Buyers list), field or fields supplying the crop, quantity, vehicle or haulier details, and the sustainability declaration reference your buyer issues you. This creates a permanent, audit-ready record of every consignment your buyer can reference in their RTFO return." },
      { q: "What GHG data does BDE Farm Trac supply for biofuel compliance?", a: "The Biofuel / RTFO overview page automatically counts the number of NVZ fertiliser applications and spray applications recorded in your other modules for RTFO-eligible fields. Your ISCC auditor or biofuel buyer uses these figures to calculate a field-level GHG footprint that must accompany the sustainability declaration. You do not need to enter data twice — it is drawn directly from your existing NVZ and Sprays records." },
      { q: "What happens to historic sustainability declarations if I stop working with a buyer?", a: "You can deactivate a buyer in the RTFO Buyers register rather than deleting them. The buyer is marked Inactive and no longer appears in the dropdown when logging new deliveries — but every historical delivery and sustainability declaration linked to them is preserved in full on your record. Reactivate them at any time if the relationship resumes." },
    ],
  },
  {
    title: "Account & Billing",
    icon: Landmark,
    color: "bg-violet-50 text-violet-700 border-violet-100",
    items: [
      { q: "How is BDE Farm Trac priced?", a: "BDE Farm Trac uses a per-farm, per-month subscription model. The core platform is included in all subscriptions. You add modules based on your farming operation. Visit the Pricing page for a full interactive cost calculator — add all your farms and select the modules for each." },
      { q: "Can I cancel or change my subscription at any time?", a: "Yes. Subscriptions can be modified — adding or removing modules — or cancelled with 30 days' notice. No long-term contracts are required. Contact the support team to make changes." },
      { q: "Is there a free trial?", a: "Yes. All new accounts receive a 30-day free trial of the full platform with all modules unlocked. No payment details are required to start the trial. Contact the team via the Register Interest page and we will get you set up." },
    ],
  },
];

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left text-sm font-medium text-foreground hover:text-brand transition-colors"
      >
        <span>{item.q}</span>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 shrink-0 mt-0.5" />}
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="pb-4 text-sm text-muted-foreground leading-relaxed"
        >
          {item.a}
        </motion.p>
      )}
    </div>
  );
}

export default function HelpCentre() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = FAQ.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => {
    if (activeCategory && cat.title !== activeCategory) return false;
    return cat.items.length > 0;
  });

  return (
    <Layout>
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-[#166534]/5 to-transparent border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full mb-4">
            <LifeBuoy className="w-3.5 h-3.5" />Help Centre
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">How can we help?</h1>
          <p className="text-lg text-muted-foreground mb-8">Find answers about Red Tractor compliance, organic records, livestock, sprays, and more.</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-border bg-white text-base focus:outline-none focus:border-brand"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-10">
          {/* Category nav */}
          <aside className="w-52 shrink-0 hidden md:block">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</p>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!activeCategory ? "bg-brand text-white font-medium" : "text-foreground/70 hover:bg-secondary"}`}
              >
                All categories
              </button>
              {FAQ.map(cat => (
                <button
                  key={cat.title}
                  onClick={() => setActiveCategory(cat.title === activeCategory ? null : cat.title)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${activeCategory === cat.title ? "bg-brand text-white font-medium" : "text-foreground/70 hover:bg-secondary"}`}
                >
                  <cat.icon className="w-4 h-4 shrink-0" />
                  {cat.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* FAQ content */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="font-semibold text-foreground">No results found</p>
                <p className="text-sm text-muted-foreground mt-1">Try different search terms or browse all categories.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {filtered.map(cat => (
                  <motion.div
                    key={cat.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cat.color}`}>
                        <cat.icon className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg font-bold text-foreground">{cat.title}</h2>
                    </div>
                    <div className="rounded-xl border border-border bg-white px-5 divide-y divide-border">
                      {cat.items.map((item, i) => <AccordionItem key={i} item={item} />)}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Still need help */}
            <div className="mt-16 rounded-2xl bg-[#166534]/5 border border-[#166534]/20 p-8 text-center">
              <LifeBuoy className="w-10 h-10 mx-auto mb-3 text-[#166534]" />
              <h3 className="text-xl font-bold text-foreground mb-2">Still need help?</h3>
              <p className="text-sm text-muted-foreground mb-6">Our team are farmers and farm business professionals — we understand the compliance pressures you face.</p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <a href="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-[#166534] hover:underline underline-offset-2">
                  <Mail className="w-4 h-4" />Send us a message
                </a>
                <a href="tel:+441234567890" className="inline-flex items-center gap-2 text-sm font-medium text-[#166534] hover:underline underline-offset-2">
                  <Phone className="w-4 h-4" />Call the team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
