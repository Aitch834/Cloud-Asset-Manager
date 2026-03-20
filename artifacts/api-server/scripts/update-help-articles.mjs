import { readFileSync, writeFileSync } from "fs";

const FARMS_TS = "artifacts/api-server/src/routes/farms.ts";
let content = readFileSync(FARMS_TS, "utf-8");

function updateArticle(articleId, titleMatch, categoryMatch, newContent, label) {
  // Build a regex that matches the entire article object
  const escapedTitle = titleMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedCategory = categoryMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `(\\s+id: ${articleId},\\n\\s+title: "${escapedTitle}",\\n\\s+category: "${escapedCategory}",\\n\\s+content: \`)([\\s\\S]*?)(\`,)`,
    'g'
  );
  const newContent2 = newContent.replace(/`/g, "'"); // safety - no backticks in content
  const replaced = content.replace(pattern, `$1${newContent2}$3`);
  if (replaced === content) {
    console.error(`✗ ${label} - pattern not found`);
  } else {
    content = replaced;
    console.log(`✓ ${label}`);
  }
}

// ─── Article 5: Livestock Movement Records ────────────────────────────────────
updateArticle(
  5,
  "Livestock Movement Records",
  "Livestock",
  `<img src="/help-images/livestock-movements.png" alt="Livestock Movements" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />\n\n<p>Under the Cattle Identification Regulations and the Sheep and Goat (Records, Identification and Movement) Order, all livestock keepers must maintain accurate movement records. Which government portal you use depends on where your holding is located in the UK.</p>\n\n<h3>UK Reporting Portals by Country</h3>\n<ul>\n<li><strong>England:</strong> Cattle \u2192 BCMS (within 3 days). Sheep, goats &amp; pigs \u2192 eAML2 (eaml2.org.uk).</li>\n<li><strong>Scotland:</strong> All species \u2192 ScotEID (scoteid.com). Cattle also require BCMS notification.</li>\n<li><strong>Wales:</strong> Sheep &amp; goats \u2192 EIDCymru (eidcymru.org). Pigs \u2192 eAML2. Cattle \u2192 BCMS Online.</li>\n<li><strong>Northern Ireland:</strong> Cattle \u2192 NIFAIS. Sheep &amp; pigs \u2192 APHIS. Contact DAERA to register.</li>\n</ul>\n\n<h3>Recording a Movement</h3>\n<p>Set your farm\u2019s Country in <strong>Farm Settings</strong> so that the Movements page shows the correct portal links. Navigate to <strong>Livestock Movements</strong> and click <strong>Add Movement</strong>. Enter:</p>\n<ul>\n<li>Date of movement and direction (On or Off holding)</li>\n<li>Species and number of animals</li>\n<li>Source or destination CPH number</li>\n<li>Individual ear tag numbers (cattle) or flock mark and total count (sheep/pigs)</li>\n</ul>\n\n<h3>Cattle Passports</h3>\n<p>For cattle purchases, record the date the animal passport was received and cross-reference the passport number against the ear tag. Red Tractor inspectors check that passports are present for all cattle on the holding. When recording movements off the holding \u2014 to a market, abattoir, or another farm \u2014 retain a copy of the movement document (AML1 or AML2) and attach it to the movement record in Documents. Records must be kept for at least three years.</p>`,
  "Article 5"
);

// ─── Article 10: Financial Record Keeping ─────────────────────────────────────
updateArticle(
  10,
  "Financial Record Keeping",
  "Financial",
  `<img src="/help-images/financial-records.png" alt="Financial Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />\n\n<p>Red Tractor does not require detailed profit and loss accounting, but it does expect farm businesses to maintain records of inputs purchased, agri-environment scheme payments received, and any sales that fall under traceability requirements.</p>\n\n<h3>Recording Transactions</h3>\n<p>In BDE Farm Trac, the <strong>Financial Records</strong> module allows you to record income and expenditure transactions. Each record captures the date, description, category, supplier or customer name, net amount, VAT, and total. Categories include:</p>\n<ul>\n<li>Crop Sales and Livestock Sales</li>\n<li>Agrochemicals, Fertilisers, Seeds</li>\n<li>Veterinary and Medicine costs</li>\n<li>Fuel &amp; Lubricants, Contracting</li>\n<li>Subsidies &amp; Grants (BPS, SFI, agri-environment payments)</li>\n</ul>\n\n<h3>Financial Summary Dashboard</h3>\n<p>The top of the Financial Records page shows running totals for Total Income (YTD), Total Expenditure (YTD), Net Profit, and VAT to reclaim \u2014 giving you an instant financial overview without opening a spreadsheet.</p>\n\n<h3>Exporting Data</h3>\n<p>Use the <strong>Export</strong> function to generate a CSV covering any date range \u2014 suitable for importing into accounting software such as Xero or Sage. Red Tractor inspectors occasionally ask for evidence that inputs purchased reconcile with inputs recorded as applied, so keeping purchase records linked to field applications is good practice.</p>`,
  "Article 10"
);

// ─── Article 20: Livestock Medicine Records ───────────────────────────────────
updateArticle(
  20,
  "Livestock Medicine Records and Withdrawal Periods",
  "Livestock",
  `<img src="/help-images/medicine-records.png" alt="Medicine Records" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />\n\n<p>UK law requires all livestock keepers to maintain a medicines register for any veterinary medicinal product administered to animals. This record must be kept for at least five years and must be made available to your vet, APHA, and Red Tractor inspectors on request.</p>\n\n<h3>What to Record</h3>\n<p>For each medicine administered, you must record:</p>\n<ul>\n<li>Date of treatment</li>\n<li>Identity of animals treated (ear tag numbers for cattle, or pen/group identifier for sheep, pigs, or poultry)</li>\n<li>Product name and batch number</li>\n<li>Dose administered and route (injection, oral, topical, in-feed)</li>\n<li>Withdrawal period end date</li>\n<li>Name of person who administered the treatment</li>\n</ul>\n\n<h3>Withdrawal Period Tracking</h3>\n<p>The system tracks withdrawal period end dates for all treated animals. Animals with active withdrawal periods are flagged with a yellow warning banner on the Medicine Records page. This is a safety net \u2014 you remain legally responsible for ensuring no animal enters the food chain within its withdrawal period.</p>\n\n<h3>Adding a Medicine Record</h3>\n<p>Go to <strong>Livestock</strong> and open the <strong>Medicine Records</strong> section. Click <strong>Add Medicine Record</strong>. For cattle, select individual animals by ear tag from your current herd list. For sheep or pigs, select the group or pen. The system pre-fills the standard withdrawal period from the product database \u2014 always verify against the product label, as your vet may prescribe an extended withdrawal period under a cascade arrangement. Where a prescription-only medicine (POM-V) is used, attach the vet prescription using the document attachment function.</p>`,
  "Article 20"
);

// ─── Article 26: Understanding Business Reports ───────────────────────────────
updateArticle(
  26,
  "Understanding Business Reports",
  "Finance & Business",
  `<img src="/help-images/business-reports.png" alt="Business Reports" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />\n\n<p>The Business Reports module is a standalone analytical layer that draws on data recorded across your entire BDE Farm Trac account \u2014 harvest records, financial transactions, livestock movements, agri-environment schemes, and equipment records \u2014 to generate structured management reports. Available at \u00a35/month per farm.</p>\n\n<h3>Report Tabs</h3>\n<ul>\n<li><strong>Compliance Summary</strong> \u2014 Red Tractor compliance scores across all record-keeping areas, with progress bars showing percentage completion per category.</li>\n<li><strong>Spray Overview</strong> \u2014 total applications by product, area treated, and cost per hectare for the selected period.</li>\n<li><strong>Livestock Report</strong> \u2014 herd or flock summary including movements, medicine treatments, and mortality rates.</li>\n<li><strong>Financial Summary</strong> \u2014 gross margin by crop, P&amp;L statement, and input cost breakdown as a percentage of total expenditure.</li>\n<li><strong>Field Analysis</strong> \u2014 yield per hectare by field and crop type, with year-on-year comparison.</li>\n<li><strong>Audit Trail</strong> \u2014 a log of all record edits, creations, and deletions across the account for the selected period.</li>\n<li><strong>Custom Report</strong> \u2014 build your own report by selecting any combination of data fields and date range.</li>\n</ul>\n\n<h3>Exporting Reports</h3>\n<p>Each report can be exported as a PDF or CSV using the <strong>Export PDF</strong> button at the top right of the report view. PDF exports include your farm name, report period, and a BDE Farm Trac watermark \u2014 suitable for sharing with accountants, agronomists, or your assurance body.</p>`,
  "Article 26"
);

// ─── Article 23: Analytical Dashboards ───────────────────────────────────────
updateArticle(
  23,
  "Analytical Dashboards and Compliance Snapshots",
  "Dashboards",
  `<img src="/help-images/help-centre.png" alt="Help Centre and Dashboards" style="width:100%;border-radius:8px;margin-bottom:20px;border:1px solid #e5e7eb;" />\n\n<p>BDE Farm Trac includes a set of analytical dashboards that give you an at-a-glance view of your farm\u2019s performance and compliance status across key areas. These dashboards update in real time as records are added.</p>\n\n<h3>Available Dashboards</h3>\n<ul>\n<li><strong>Harvest Dashboard</strong> \u2014 yield per hectare by crop type, total production for the season, and a year-on-year comparison.</li>\n<li><strong>NVZ Compliance Dashboard</strong> \u2014 nitrogen applied per field as a proportion of the 170 kg N/ha organic manure limit, highlighting fields within closed periods.</li>\n<li><strong>Soil Health Dashboard</strong> \u2014 aggregates soil test results and surfaces fields with below-target pH or overdue sampling.</li>\n<li><strong>Fleet Status Dashboard</strong> \u2014 traffic-light view of all machinery: green (calibration current), amber (due within 90 days), red (overdue).</li>\n<li><strong>Livestock Health Dashboard</strong> \u2014 summary of medicine treatments, active withdrawal periods, and mortality records by group.</li>\n</ul>\n\n<h3>Exporting Dashboard Snapshots</h3>\n<p>All dashboards can be exported as a PDF summary report, suitable for sharing with your agronomist, vet, or assurance body. Click the <strong>Export</strong> button at the top right of each dashboard view to generate a dated PDF snapshot.</p>`,
  "Article 23"
);

writeFileSync(FARMS_TS, content, "utf-8");
console.log("\nAll done. File saved.");
