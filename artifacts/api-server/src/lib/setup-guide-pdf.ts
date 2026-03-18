import PDFDocument from "pdfkit";

// ─── Module setup content ────────────────────────────────────────────────────

interface ModuleGuide {
  name: string;
  description: string;
  steps: string[];
}

const MODULE_GUIDES: Record<string, ModuleGuide> = {
  "fields-crops": {
    name: "Fields & Crops",
    description:
      "The foundation of your records. Every other module links back to individual fields, so this is the first thing to complete.",
    steps: [
      "Add each field or land parcel: enter the field name (or OS field number), area in hectares, soil type, and current crop or land use.",
      "Record the OS grid reference or RPA LPIS parcel identifier for each field — inspectors may cross-reference these with the Rural Payments Agency.",
      "Flag any fields that lie within a Nitrate Vulnerable Zone (NVZ) — this unlocks closed-period warnings and nitrogen limit tracking.",
      "Once fields are added, assign the current growing season's crop so that spray, harvest, and soil records automatically link to the correct field.",
      "At the end of each season use the Crop Rotation function to archive the current crop and assign the following year's crop.",
    ],
  },
  "spray-records": {
    name: "Spray Applications",
    description:
      "UK law requires spray records within 48 hours of application and retention for at least three years. Complete these steps before logging any applications.",
    steps: [
      "Build your product register: add each pesticide and herbicide with its MAPP number, active ingredient, and maximum approved dose — you can look these up on the HSE Pesticides Register (hse.gov.uk).",
      "Register the operator(s) who carry out spraying: enter their name, PA1 certificate number, and relevant PA2 or PA6 certificate number and expiry date.",
      "Register your sprayer: enter the make, model, serial number, and the date of the most recent NSTS test certificate. Upload the certificate PDF.",
      "Set buffer zone and no-spray zone distances on each product — the system will surface these as warnings when you select a field that borders a watercourse.",
      "Enter any spray applications already made this season retrospectively — records must cover the full current season.",
    ],
  },
  "nvz-compliance": {
    name: "NVZ Compliance",
    description:
      "If your farm is within a Nitrate Vulnerable Zone, these records are a legal requirement under the Nitrates Regulations 2015.",
    steps: [
      "Enable the NVZ Designated flag in Farm Settings if any part of your holding is in an NVZ — this activates closed-period warnings across the system.",
      "In the Field Register, flag each individual field that falls within the NVZ boundary (use the Magic map at magic.defra.gov.uk to check).",
      "Add your fertiliser products to the product register: enter the product name, nitrogen content (%), and default application method.",
      "Enter any nitrogen applications made so far this season, including organic manure spreads — the system tracks cumulative loading against the 170 kg N/ha limit.",
      "Set a reminder for each field's next closed period start date so you receive advance warnings before spreading restrictions apply.",
    ],
  },
  "harvest-records": {
    name: "Harvest Records",
    description:
      "Yield records support nutrient management planning and provide the traceability chain required for combinable crops sold into assured markets.",
    steps: [
      "Confirm the current crop and variety for each field in the Field Register — harvest records link directly to the field and crop.",
      "Enter the target yield (tonnes per hectare) for each field or crop type — this is used to validate your nutrient management plan.",
      "After each harvest, log the yield in tonnes, moisture content at harvest (%), and the grain storage location or destination.",
      "For any crops destined for biofuel processing, tick the Biofuel Feedstock flag — this links automatically to the Biofuel / RTFO module.",
      "If grain is sold directly from the field (combinable crops), record the buyer and haulier details to complete the traceability record.",
    ],
  },
  "equipment-management": {
    name: "Equipment & Fleet",
    description:
      "Red Tractor requires calibration certificates and service records for all sprayers and key application equipment.",
    steps: [
      "Register each piece of key machinery: enter the make, model, serial number, and registration number (if applicable) for sprayers, spreaders, drills, and combines.",
      "For each sprayer, upload the current NSTS test certificate and enter the next test due date — the system will flag overdue certifications on the Fleet Status dashboard.",
      "Record the last self-calibration check date for each sprayer, and any adjustments made.",
      "Add recent service history for machinery where records exist — include the date, service engineer, and any defects found or remedied.",
      "Set a calibration reminder interval for each piece of equipment so the Fleet Status dashboard gives you advance warning.",
    ],
  },
  "livestock-management": {
    name: "Livestock Management",
    description:
      "Accurate livestock records are required under BCMS Cattle Identification Regulations and Red Tractor's animal welfare standards.",
    steps: [
      "Confirm your CPH (County Parish Holding) number is entered in Farm Settings — this is required for all livestock movement notifications.",
      "Register each herd or flock group: enter the species, breed, approximate numbers, and the building or grazing location.",
      "For cattle, enter individual animals with their ear tag numbers and dam details — these are required for BCMS compliance.",
      "Record any animals currently under treatment with a medicine in withdrawal — the system will flag these on the Livestock Health dashboard.",
      "Set a regular health check schedule for each group (e.g. daily for housed cattle) — the system will prompt you when a check is overdue.",
    ],
  },
  "livestock-movements": {
    name: "Livestock Movements",
    description:
      "All on and off movements must be reported to BCMS within three days for cattle, and retained as records for at least three years for all species.",
    steps: [
      "Enter your BCMS holding number (this is your CPH number formatted for eAML2) — required for all cattle movement notifications.",
      "Register regular movement destinations: markets, abattoirs, and neighbouring holdings — saving these prevents re-entry on every movement.",
      "Enter any livestock movements that have occurred in the current period (on and off your holding) — include source or destination CPH and individual ear tags for cattle.",
      "For any cattle purchased, confirm that the animal passport has been received and record the passport number against the ear tag.",
      "File digital copies of AML1/AML2 movement documents in the Documents section, linked to the relevant movement record.",
    ],
  },
  "livestock-medicine": {
    name: "Medicine Records",
    description:
      "A medicines register is a legal requirement for all livestock keepers and must be retained for at least five years.",
    steps: [
      "Enter your vet's name, practice name, and contact details — required for prescription-only medicine (POM-V) records.",
      "Create your medicines register: add each veterinary medicinal product currently in store, with batch number, expiry date, and quantity.",
      "Record any animals currently in withdrawal from recent treatments — include the product name, dose, administration route, and withdrawal period end date.",
      "For any prescription medicines (POM-V), attach the vet's written prescription to the medicine record using the document attachment function.",
      "Set up a medicine storage location record — Red Tractor inspectors will ask to see medicines stored securely and separately from other chemicals.",
    ],
  },
  "staff-training": {
    name: "Staff & Training",
    description:
      "Certificates of competence must be current for all staff carrying out regulated tasks, especially spray operations.",
    steps: [
      "Add each member of staff who carries out regulated activities: enter their full name, job role, and start date.",
      "For spray operators, record their PA1 certificate number and the relevant PA2 (ground crop sprayers) or PA6 (handheld applicators) certificate number and expiry date.",
      "Record any other certificates held: forklift (RTITB/ITSSAR), WEIL, livestock handling, fork-lift, food hygiene, or sector-specific competencies.",
      "Add in-house training events for the current year: manual handling, fire safety, biosecurity inductions — record the date, trainer name, and topics covered.",
      "Set expiry reminders: the system will alert you 90 days before any certificate lapses, giving time to book refresher training.",
    ],
  },
  "biosecurity": {
    name: "Biosecurity & Visitors",
    description:
      "A complete visitor and contractor log is a core Red Tractor requirement across all sectors.",
    steps: [
      "Pre-register your regular contractors, agronomists, vets, and feed merchants — their details will auto-fill when logging visits, saving time on the farm.",
      "Set your biosecurity risk level for the holding — this determines whether visitors are prompted to declare recent contact with other livestock holdings.",
      "Enable the biosecurity declaration template and customise it with your farm's specific biosecurity rules (e.g. use of disinfectant mats, PPE requirements).",
      "Enter any visits that have taken place in the last 30 days retrospectively — inspectors may ask to see recent records at any time.",
      "For livestock holdings, set up a pest control schedule: enter the name of your pest control contractor and the frequency of inspections for each building or area.",
    ],
  },
  "inspections-compliance": {
    name: "Inspections & Compliance",
    description:
      "Your inspection history and outstanding actions are tracked here. Keeping this current means you are always inspection-ready.",
    steps: [
      "Enter your last Red Tractor inspection: date, type (announced/unannounced), the inspection body, the inspector's name, and the overall result.",
      "Upload your current Red Tractor assurance certificate and enter its expiry date — the system will alert you in advance of renewal.",
      "Record any non-conformances raised at your last inspection: description, severity, and the deadline for resolution.",
      "For each non-conformance, add the corrective action taken and mark it as resolved once evidence has been accepted by your certification body.",
      "Enter your assurance body name and contact details in Farm Settings — these appear on compliance export reports.",
    ],
  },
  "financial-records": {
    name: "Financial Records",
    description:
      "Input cost records help reconcile purchases against applied quantities — a check inspectors sometimes carry out against your chemical store.",
    steps: [
      "Set up your main input cost categories: seeds, fertilisers, pesticides, feed, veterinary medicines, fuel, and contract services.",
      "Add your principal suppliers to the Suppliers & Stock register — link each supplier to the relevant cost category.",
      "Enter input purchases made so far in the current financial year: product, quantity, unit cost, and supplier.",
      "For agri-environment scheme payments, log each payment with the scheme name, payment reference, and the period covered.",
      "Link grant payments to the relevant field or activity record where possible — this creates an audit trail for scheme compliance.",
    ],
  },
  "biofuel-rtfo": {
    name: "Biofuel / RTFO",
    description:
      "Farms supplying feedstocks for biofuel production must demonstrate sustainability under an approved scheme such as ISCC.",
    steps: [
      "Enter your ISCC certificate details in the Certification tab: certification body name, certificate number, valid-from date, and expiry date. Upload the certificate PDF.",
      "Enable the NVZ Designated flag and the Biofuel / RTFO module in Farm Settings — these ensure the correct compliance rules apply.",
      "Complete a land eligibility declaration for each field used for biofuel feedstock production: enter the January 2008 land-use category and flag any high-risk land classifications.",
      "Flag fields as high-risk and exclude them from RTFO claims if they were peatland, wetland, or continuously forested in 2008.",
      "Log each biofuel feedstock delivery: date, buyer company, RTFO reference number (provided by the buyer), sustainability scheme, quantity in tonnes, and the GHG emission saving percentage stated on the delivery confirmation.",
    ],
  },
  "soil-tests": {
    name: "Soil Tests",
    description:
      "Regular soil testing underpins nutrient management planning and is a Red Tractor requirement on a minimum five-year cycle.",
    steps: [
      "For each field, enter the most recent soil test results: sampling date, laboratory name, sample reference, and index values for pH, phosphate (P), potassium (K), and magnesium (Mg).",
      "The system will flag fields with pH below 6.0 (requiring lime application) and fields at phosphate Index 4 or above (restricting further P applications).",
      "Record any lime applications made to correct pH: product name (e.g. ground limestone), rate per hectare, and application date.",
      "Set a re-sampling reminder for each field based on your preferred cycle — the Soil Health dashboard will surface fields approaching their sampling due date.",
      "If you have a full soil health analysis (organic matter %, bulk density, earthworm counts), enter these in the extended soil test fields for longer-term trend tracking.",
    ],
  },
};

// ─── Colour palette ───────────────────────────────────────────────────────────

const COLOURS = {
  brand: "#1a6b3a",      // BDE dark green
  accent: "#2d9e5c",     // lighter green for headers
  light: "#e8f5ee",      // very pale green tint
  text: "#1a1a1a",
  muted: "#6b7280",
  border: "#d1d5db",
  white: "#ffffff",
  stepNum: "#2d9e5c",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function drawHRule(doc: PDFKit.PDFDocument, y: number, width: number, colour = COLOURS.border) {
  doc.save().moveTo(0, y).lineTo(width, y).strokeColor(colour).lineWidth(0.5).stroke().restore();
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const pageHeight = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > pageHeight) {
    doc.addPage();
  }
}

// ─── Main generator ───────────────────────────────────────────────────────────

export interface SetupGuideOptions {
  tenantName: string;
  tenantEmail: string;
  farmName: string;
  cphNumber?: string;
  redTractorId?: string;
  farmManager?: string;
  postcode?: string;
  moduleKeys: string[];   // active module keys for this farm
  generatedAt?: Date;
}

export function generateSetupGuidePdf(opts: SetupGuideOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 56, bottom: 56, left: 56, right: 56 },
      info: {
        Title: `BDE Farm Trac — Setup Guide — ${opts.farmName}`,
        Author: "BDE Farm Trac",
        Creator: "BDE Farm Trac",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pw = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const marginL = doc.page.margins.left;

    // ── Cover page ────────────────────────────────────────────────────────────

    // Green header band
    doc.rect(0, 0, doc.page.width, 180).fill(COLOURS.brand);

    // Wordmark
    doc.fontSize(22).font("Helvetica-Bold").fillColor(COLOURS.white)
      .text("BDE Farm Trac", marginL, 40, { width: pw });
    doc.fontSize(10).font("Helvetica").fillColor("#a7d9b8")
      .text("Red Tractor Compliance Platform", marginL, 68, { width: pw });

    // White divider line inside header
    doc.save().moveTo(marginL, 90).lineTo(marginL + pw, 90)
      .strokeColor("rgba(255,255,255,0.2)").lineWidth(0.5).stroke().restore();

    // Document title inside header
    doc.fontSize(16).font("Helvetica-Bold").fillColor(COLOURS.white)
      .text("Module Purchase Confirmation", marginL, 104, { width: pw });
    doc.fontSize(11).font("Helvetica").fillColor("#c8ecd5")
      .text("& Quick Setup Guide", marginL, 126, { width: pw });

    // Below header — farm details box
    const detailsY = 204;
    doc.rect(marginL, detailsY, pw, 130).fill(COLOURS.light).stroke();

    doc.fontSize(13).font("Helvetica-Bold").fillColor(COLOURS.text)
      .text(opts.farmName, marginL + 16, detailsY + 16, { width: pw - 32 });

    doc.fontSize(9).font("Helvetica").fillColor(COLOURS.muted);
    const detailRows = [
      ["Account", opts.tenantName],
      ["Email", opts.tenantEmail],
      ...(opts.farmManager ? [["Farm Manager", opts.farmManager]] : []),
      ...(opts.cphNumber ? [["CPH Number", opts.cphNumber]] : []),
      ...(opts.redTractorId ? [["Red Tractor Membership No.", opts.redTractorId]] : []),
      ...(opts.postcode ? [["Postcode", opts.postcode]] : []),
      ["Document generated", (opts.generatedAt ?? new Date()).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })],
    ];

    let rowY = detailsY + 38;
    for (const [label, value] of detailRows) {
      doc.font("Helvetica-Bold").fillColor(COLOURS.muted).fontSize(8)
        .text(label.toUpperCase(), marginL + 16, rowY, { width: 160, continued: false });
      doc.font("Helvetica").fillColor(COLOURS.text).fontSize(9)
        .text(value, marginL + 180, rowY, { width: pw - 196 });
      rowY += 16;
    }

    // Modules purchased list
    const modsY = detailsY + 150;
    doc.fontSize(11).font("Helvetica-Bold").fillColor(COLOURS.text)
      .text("Modules Purchased", marginL, modsY);
    drawHRule(doc, modsY + 16, doc.page.width, COLOURS.border);

    const validModules = opts.moduleKeys
      .map((key) => MODULE_GUIDES[key])
      .filter(Boolean);

    let modListY = modsY + 24;
    for (const mod of validModules) {
      ensureSpace(doc, 20);
      doc.circle(marginL + 6, modListY + 5, 3).fill(COLOURS.accent);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(COLOURS.text)
        .text(mod.name, marginL + 18, modListY, { width: pw - 18 });
      modListY = doc.y + 4;
    }

    // Intro paragraph
    const introY = modListY + 24;
    ensureSpace(doc, 80);
    doc.rect(marginL, introY, pw, 64).fill(COLOURS.light);
    doc.fontSize(9).font("Helvetica").fillColor(COLOURS.muted)
      .text(
        "This document contains a tailored setup checklist for each module listed above. "
        + "We recommend working through each section in order — some modules (for example Spray Records) "
        + "depend on data entered in an earlier module (Fields & Crops). "
        + "You can return to this guide at any time from the Help Centre within BDE Farm Trac.",
        marginL + 14,
        introY + 12,
        { width: pw - 28, lineGap: 3 }
      );

    // ── Module sections ───────────────────────────────────────────────────────

    for (let mi = 0; mi < validModules.length; mi++) {
      const mod = validModules[mi];
      doc.addPage();

      // Section number badge + module name
      const sectionBadgeW = 28;
      doc.rect(marginL, doc.page.margins.top, sectionBadgeW, sectionBadgeW).fill(COLOURS.accent);
      doc.fontSize(13).font("Helvetica-Bold").fillColor(COLOURS.white)
        .text(String(mi + 1), marginL, doc.page.margins.top + 6, { width: sectionBadgeW, align: "center" });

      doc.fontSize(16).font("Helvetica-Bold").fillColor(COLOURS.brand)
        .text(mod.name, marginL + sectionBadgeW + 10, doc.page.margins.top + 4, { width: pw - sectionBadgeW - 10 });

      const afterTitle = doc.page.margins.top + sectionBadgeW + 16;

      // Description
      doc.fontSize(10).font("Helvetica").fillColor(COLOURS.muted)
        .text(mod.description, marginL, afterTitle, { width: pw, lineGap: 3 });

      drawHRule(doc, doc.y + 16, doc.page.width, COLOURS.accent);

      // "First Steps" heading
      doc.moveDown(1.6);
      doc.fontSize(11).font("Helvetica-Bold").fillColor(COLOURS.text)
        .text("First Steps — what to enter before using this module");
      doc.moveDown(0.6);

      // Numbered steps
      for (let si = 0; si < mod.steps.length; si++) {
        ensureSpace(doc, 48);

        const stepY = doc.y;
        const numW = 26;
        const textX = marginL + numW + 8;
        const textW = pw - numW - 8;

        // Step number circle
        doc.circle(marginL + numW / 2, stepY + 8, 10)
          .fill(COLOURS.light).stroke();
        doc.fontSize(9).font("Helvetica-Bold").fillColor(COLOURS.stepNum)
          .text(String(si + 1), marginL, stepY + 3, { width: numW, align: "center" });

        // Step text
        doc.fontSize(10).font("Helvetica").fillColor(COLOURS.text)
          .text(mod.steps[si], textX, stepY, { width: textW, lineGap: 2 });

        doc.y = Math.max(doc.y, stepY + 28);
        doc.moveDown(0.7);

        // Light rule between steps (not after last)
        if (si < mod.steps.length - 1) {
          drawHRule(doc, doc.y, doc.page.width, COLOURS.border);
          doc.moveDown(0.7);
        }
      }

      // Tip box at the bottom of each section
      ensureSpace(doc, 70);
      doc.moveDown(1.2);
      const tipY = doc.y;
      doc.rect(marginL, tipY, pw, 58).fill(COLOURS.light).stroke();
      doc.fontSize(8.5).font("Helvetica-Bold").fillColor(COLOURS.brand)
        .text("Need help with this module?", marginL + 12, tipY + 10, { width: pw - 24 });
      doc.fontSize(8.5).font("Helvetica").fillColor(COLOURS.muted)
        .text(
          `Open the Help Centre within BDE Farm Trac and search for "${mod.name}". `
          + "You can also use the in-app support chat to speak to the BDE Farm Trac team.",
          marginL + 12,
          tipY + 24,
          { width: pw - 24, lineGap: 2 }
        );
    }

    // ── Final page — support & contacts ──────────────────────────────────────

    doc.addPage();

    doc.rect(0, 0, doc.page.width, 80).fill(COLOURS.brand);
    doc.fontSize(16).font("Helvetica-Bold").fillColor(COLOURS.white)
      .text("Getting Further Help", marginL, 24, { width: pw });
    doc.fontSize(10).font("Helvetica").fillColor("#c8ecd5")
      .text("We're here to make sure your system is set up right.", marginL, 48, { width: pw });

    const supportY = 104;
    const cols = [
      {
        icon: "Help Centre",
        title: "Help Centre",
        body: "Every module has detailed articles in the Help Centre. Access it from the sidebar navigation within BDE Farm Trac at any time — no login is required for browsing.",
      },
      {
        icon: "Support",
        title: "In-App Support",
        body: "Use the Support option in the sidebar to open a support ticket or chat with our team. Tickets are usually answered within one working day.",
      },
      {
        icon: "Email",
        title: "Email Support",
        body: "You can also email us at support@bdefarmtrac.co.uk. Please include your farm name and CPH number in your message so we can find your account quickly.",
      },
    ];

    let colY = supportY;
    for (const col of cols) {
      ensureSpace(doc, 80);
      doc.rect(marginL, colY, pw, 70).fill(COLOURS.light);
      doc.fontSize(11).font("Helvetica-Bold").fillColor(COLOURS.brand)
        .text(col.title, marginL + 14, colY + 12, { width: pw - 28 });
      doc.fontSize(9.5).font("Helvetica").fillColor(COLOURS.text)
        .text(col.body, marginL + 14, colY + 30, { width: pw - 28, lineGap: 2 });
      colY = doc.y + 12;
    }

    // Footer
    ensureSpace(doc, 60);
    doc.moveDown(2);
    drawHRule(doc, doc.y, doc.page.width, COLOURS.border);
    doc.moveDown(0.8);
    doc.fontSize(8).font("Helvetica").fillColor(COLOURS.muted)
      .text(
        `This document was generated on ${(opts.generatedAt ?? new Date()).toLocaleDateString("en-GB", {
          day: "numeric", month: "long", year: "numeric",
        })} for ${opts.tenantName} (${opts.farmName}). `
        + "© BDE Farm Trac. All rights reserved. This document is intended for the named account holder only.",
        marginL,
        doc.y,
        { width: pw, align: "center", lineGap: 2 }
      );

    doc.end();
  });
}
