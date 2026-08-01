import { b1 as useParams, r as reactExports, j as jsxRuntimeExports, d as LoaderCircle, m as Card, n as CardContent, aZ as CardHeader, a_ as CardTitle } from "./index-CxGrFdGB.js";
import { B as Badge } from "./badge-DkmXFQk5.js";
import { T as TriangleAlert, L as Leaf } from "./triangle-alert-DGJ7NzCC.js";
import { E as Eye } from "./eye-CYGHedwH.js";
import { L as Lock } from "./lock-BrsoftIx.js";
import { S as ShieldCheck } from "./shield-check-DLyfmRRw.js";
import { C as CircleCheck } from "./circle-check-B91paFTT.js";
const MODULE_LABELS = {
  spray_records: "Spray & Input Applications",
  fields_crops: "Fields & Crops",
  soil_tests: "Soil Tests",
  harvest: "Harvest Records",
  equipment: "Equipment & Calibration",
  workshop: "Workshop — Job Cards, PAT Testing & Fire Safety",
  livestock: "Livestock Records",
  medicines: "Medicine Records",
  movements: "Livestock Movements",
  biosecurity: "Biosecurity & Visitors",
  staff_training: "Staff Training & Certificates",
  inspections: "Inspections & Non-Conformances",
  nvz: "NVZ Records",
  risk_assessments: "Risk Assessments & COSHH",
  environmental: "Environmental Records",
  "pig-production": "Pig Production",
  "poultry-production": "Poultry Production",
  horticulture: "Horticulture & Fresh Produce",
  "carbon-sustainability": "Carbon & Sustainability",
  "farm-diversification": "Farm Diversification",
  "water-irrigation": "Water & Irrigation Management"
};
function fmt(val) {
  if (val === null || val === void 0 || val === "") return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  const s = String(val);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return new Date(s).toLocaleDateString("en-GB");
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return (/* @__PURE__ */ new Date(s + "T00:00:00")).toLocaleDateString("en-GB");
  return s;
}
function RecordTable({ records, columns }) {
  if (!records || records.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-2", children: "No records" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-muted/50", children: columns.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-semibold text-xs text-foreground/70 whitespace-nowrap", children: c.label }, c.key)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: records.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "hover:bg-muted/20", children: columns.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-foreground/80 whitespace-nowrap", children: fmt(r[c.key]) }, c.key)) }, i)) })
  ] }) });
}
function SectionCard({ moduleKey, data }) {
  const title = MODULE_LABELS[moduleKey] ?? moduleKey;
  const renderContent = () => {
    if (!data) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "No data" });
    switch (moduleKey) {
      case "spray_records": {
        const records = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records, columns: [
          { key: "applicationDate", label: "Date" },
          { key: "fieldName", label: "Field" },
          { key: "productName", label: "Product" },
          { key: "totalAreaHa", label: "Area (ha)" },
          { key: "operatorName", label: "Operator" },
          { key: "windSpeed", label: "Wind (m/s)" },
          { key: "temperature", label: "Temp (°C)" }
        ] });
      }
      case "fields_crops": {
        const records = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records, columns: [
          { key: "name", label: "Field Name" },
          { key: "areaHa", label: "Area (ha)" },
          { key: "soilType", label: "Soil Type" },
          { key: "isNvzDesignated", label: "NVZ" },
          { key: "currentCrop", label: "Current Crop" }
        ] });
      }
      case "soil_tests": {
        const records = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records, columns: [
          { key: "sampleDate", label: "Date" },
          { key: "fieldName", label: "Field" },
          { key: "laboratory", label: "Laboratory" },
          { key: "pH", label: "pH" },
          { key: "phosphateIndex", label: "P Index" },
          { key: "potassiumIndex", label: "K Index" }
        ] });
      }
      case "harvest": {
        const records = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records, columns: [
          { key: "harvestDate", label: "Date" },
          { key: "fieldName", label: "Field" },
          { key: "cropName", label: "Crop" },
          { key: "yieldTonnes", label: "Yield (t)" },
          { key: "moistureContent", label: "Moisture %" }
        ] });
      }
      case "equipment": {
        const records = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records, columns: [
          { key: "name", label: "Equipment" },
          { key: "make", label: "Make" },
          { key: "model", label: "Model" },
          { key: "serialNumber", label: "Serial No." },
          { key: "lastCalibrationDate", label: "Last Calibration" },
          { key: "nextCalibrationDue", label: "Next Due" },
          { key: "nstsCertificateExpiry", label: "NSTS Expiry" }
        ] });
      }
      case "livestock": {
        const records = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records, columns: [
          { key: "name", label: "Herd / Flock" },
          { key: "species", label: "Species" },
          { key: "breedType", label: "Breed" },
          { key: "currentCount", label: "Count" },
          { key: "locationBuilding", label: "Location" }
        ] });
      }
      case "medicines": {
        const records = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records, columns: [
          { key: "treatmentDate", label: "Date" },
          { key: "productName", label: "Product" },
          { key: "animalGroup", label: "Animals Treated" },
          { key: "dosageAmount", label: "Dose" },
          { key: "routeOfAdministration", label: "Route" },
          { key: "withdrawalPeriodDays", label: "Withdrawal (days)" },
          { key: "withdrawalEndDate", label: "Withdrawal End" },
          { key: "administeredBy", label: "Administered By" }
        ] });
      }
      case "movements": {
        const records = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records, columns: [
          { key: "movementDate", label: "Date" },
          { key: "movementType", label: "Type" },
          { key: "species", label: "Species" },
          { key: "animalCount", label: "Count" },
          { key: "sourceCphNumber", label: "From CPH" },
          { key: "destinationCphNumber", label: "To CPH" }
        ] });
      }
      case "biosecurity": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Visitor Log" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.visitors ?? [], columns: [
              { key: "arrivalTime", label: "Date" },
              { key: "visitorName", label: "Visitor" },
              { key: "company", label: "Company" },
              { key: "purposeOfVisit", label: "Purpose" },
              { key: "signedDeclaration", label: "Signed Declaration" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Pest Control" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.pestControl ?? [], columns: [
              { key: "treatmentDate", label: "Date" },
              { key: "areaInspected", label: "Area" },
              { key: "pestFound", label: "Pest Found" },
              { key: "treatmentApplied", label: "Treatment" },
              { key: "operatorName", label: "Operator" }
            ] })
          ] }),
          d.biosecurityPlan?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Biosecurity Plan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800", children: [
              "Written biosecurity plan on file — reviewed ",
              fmt(d.biosecurityPlan[0]?.lastReviewDate)
            ] })
          ] })
        ] });
      }
      case "staff_training": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Training Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.trainingRecords ?? [], columns: [
              { key: "staffName", label: "Staff Name" },
              { key: "trainingCourse", label: "Course" },
              { key: "provider", label: "Provider" },
              { key: "trainingDate", label: "Date" },
              { key: "expiryDate", label: "Expiry" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Certificates & Qualifications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.certificates ?? [], columns: [
              { key: "staffName", label: "Staff Name" },
              { key: "certificateType", label: "Certificate" },
              { key: "certificateNumber", label: "Cert No." },
              { key: "issuingBody", label: "Issuer" },
              { key: "issueDate", label: "Issued" },
              { key: "expiryDate", label: "Expiry" }
            ] })
          ] })
        ] });
      }
      case "inspections": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Inspection Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.inspections ?? [], columns: [
              { key: "inspectionDate", label: "Date" },
              { key: "inspectionType", label: "Type" },
              { key: "inspectionBody", label: "Body" },
              { key: "inspectorName", label: "Inspector" },
              { key: "overallResult", label: "Result" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Non-Conformances" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.nonconformances ?? [], columns: [
              { key: "identifiedDate", label: "Date" },
              { key: "category", label: "Category" },
              { key: "severity", label: "Severity" },
              { key: "status", label: "Status" },
              { key: "description", label: "Description" }
            ] })
          ] })
        ] });
      }
      case "nvz": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "NVZ Fertiliser Applications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.applications ?? [], columns: [
              { key: "applicationDate", label: "Date" },
              { key: "fieldName", label: "Field" },
              { key: "productName", label: "Product" },
              { key: "nitrogenKgHa", label: "N kg/ha" },
              { key: "applicationMethod", label: "Method" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "NVZ Risk Assessments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.riskAssessments ?? [], columns: [
              { key: "assessmentDate", label: "Date" },
              { key: "assessorName", label: "Assessor" },
              { key: "soilType", label: "Soil Type" },
              { key: "drainageRisk", label: "Drainage Risk" },
              { key: "overallRiskLevel", label: "Overall Risk" },
              { key: "nextReviewDate", label: "Next Review" }
            ] })
          ] })
        ] });
      }
      case "risk_assessments": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Risk Assessments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.riskAssessments ?? [], columns: [
              { key: "assessmentDate", label: "Date" },
              { key: "activityDescription", label: "Activity" },
              { key: "riskLevel", label: "Risk Level" },
              { key: "controlMeasures", label: "Controls" },
              { key: "reviewDate", label: "Review Date" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "COSHH Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.coshh ?? [], columns: [
              { key: "substanceName", label: "Substance" },
              { key: "assessmentDate", label: "Assessed" },
              { key: "reviewDate", label: "Review" },
              { key: "hazardDescription", label: "Hazard" },
              { key: "ppe", label: "PPE Required" }
            ] })
          ] })
        ] });
      }
      case "workshop": {
        const d = data;
        const flatJobs = (d.jobCards ?? []).map(({ job, equipmentName }) => ({ ...job, equipmentName }));
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Job Cards" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: flatJobs, columns: [
              { key: "jobNumber", label: "Job No." },
              { key: "equipmentName", label: "Equipment" },
              { key: "jobType", label: "Type" },
              { key: "priority", label: "Priority" },
              { key: "status", label: "Status" },
              { key: "description", label: "Description" },
              { key: "createdAt", label: "Raised" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "PAT Testing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.patTests ?? [], columns: [
              { key: "itemName", label: "Appliance" },
              { key: "location", label: "Location" },
              { key: "testDate", label: "Test Date" },
              { key: "result", label: "Result" },
              { key: "testerName", label: "Tester" },
              { key: "certificateNumber", label: "Cert No." },
              { key: "nextDueDate", label: "Next Due" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Fire Extinguishers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.fireExtinguishers ?? [], columns: [
              { key: "location", label: "Location" },
              { key: "type", label: "Type" },
              { key: "capacityKg", label: "Capacity (kg)" },
              { key: "serialNumber", label: "Serial No." },
              { key: "lastServiceDate", label: "Last Service" },
              { key: "engineerName", label: "Engineer" },
              { key: "nextServiceDue", label: "Next Service Due" }
            ] })
          ] })
        ] });
      }
      case "environmental": {
        const records = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records, columns: [
          { key: "featureName", label: "Feature" },
          { key: "featureType", label: "Type" },
          { key: "areaHa", label: "Area (ha)" },
          { key: "managementAgreement", label: "Agreement" },
          { key: "lastReviewDate", label: "Last Review" }
        ] });
      }
      case "pig-production": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Pig Herds" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.herds ?? [], columns: [
              { key: "herdName", label: "Herd Name" },
              { key: "breedType", label: "Breed" },
              { key: "currentCount", label: "Count" },
              { key: "productionSystem", label: "System" },
              { key: "locationBuilding", label: "Building" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Health Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.healthRecords ?? [], columns: [
              { key: "eventDate", label: "Date" },
              { key: "eventType", label: "Type" },
              { key: "description", label: "Description" },
              { key: "outcome", label: "Outcome" },
              { key: "vetName", label: "Vet" }
            ] })
          ] })
        ] });
      }
      case "poultry-production": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Poultry Flocks" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.flocks ?? [], columns: [
              { key: "flockId", label: "Flock ID" },
              { key: "species", label: "Species" },
              { key: "breed", label: "Breed" },
              { key: "placementDate", label: "Placement" },
              { key: "currentCount", label: "Count" },
              { key: "productionType", label: "Type" },
              { key: "houseId", label: "House" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Mortality Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.mortalityRecords ?? [], columns: [
              { key: "recordDate", label: "Date" },
              { key: "count", label: "Count" },
              { key: "cause", label: "Cause" },
              { key: "action", label: "Action" }
            ] })
          ] })
        ] });
      }
      case "horticulture": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Horticultural Crops" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.crops ?? [], columns: [
              { key: "cropName", label: "Crop" },
              { key: "variety", label: "Variety" },
              { key: "fieldOrBlock", label: "Field / Block" },
              { key: "plantingDate", label: "Planted" },
              { key: "expectedHarvestDate", label: "Exp. Harvest" },
              { key: "areaHa", label: "Area (ha)" },
              { key: "certificationScheme", label: "Certification" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Harvest Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.harvestRecords ?? [], columns: [
              { key: "harvestDate", label: "Date" },
              { key: "cropName", label: "Crop" },
              { key: "quantityKg", label: "Quantity (kg)" },
              { key: "grade", label: "Grade" },
              { key: "destination", label: "Destination" }
            ] })
          ] })
        ] });
      }
      case "carbon-sustainability": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Carbon Footprint Assessments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.footprints ?? [], columns: [
              { key: "assessmentYear", label: "Year" },
              { key: "totalEmissionsTco2e", label: "Total (tCO₂e)" },
              { key: "emissionsPerHa", label: "Per ha" },
              { key: "assessmentMethod", label: "Method" },
              { key: "assessorName", label: "Assessor" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Sustainability Actions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.actions ?? [], columns: [
              { key: "actionDate", label: "Date" },
              { key: "category", label: "Category" },
              { key: "description", label: "Action" },
              { key: "status", label: "Status" },
              { key: "estimatedReductionTco2e", label: "Est. Saving (tCO₂e)" }
            ] })
          ] })
        ] });
      }
      case "farm-diversification": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Diversification Enterprises" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.enterprises ?? [], columns: [
              { key: "enterpriseName", label: "Enterprise" },
              { key: "enterpriseType", label: "Type" },
              { key: "startDate", label: "Start Date" },
              { key: "planningPermission", label: "Planning Permission" },
              { key: "status", label: "Status" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Income Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.incomeRecords ?? [], columns: [
              { key: "incomeDate", label: "Date" },
              { key: "enterpriseName", label: "Enterprise" },
              { key: "incomeType", label: "Type" },
              { key: "amount", label: "Amount (£)" },
              { key: "payerName", label: "Payer" }
            ] })
          ] })
        ] });
      }
      case "water-irrigation": {
        const d = data;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Water Sources & Abstraction Licences" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.sources ?? [], columns: [
              { key: "sourceName", label: "Source" },
              { key: "sourceType", label: "Type" },
              { key: "abstractionLicenceNumber", label: "Licence No." },
              { key: "annualAllocatedM3", label: "Annual Allocation (m³)" },
              { key: "licenceExpiryDate", label: "Expiry" }
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold mb-2", children: "Irrigation Usage Records" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RecordTable, { records: d.usageRecords ?? [], columns: [
              { key: "irrigationDate", label: "Date" },
              { key: "fieldName", label: "Field" },
              { key: "volumeUsedM3", label: "Volume (m³)" },
              { key: "method", label: "Method" },
              { key: "cropName", label: "Crop" }
            ] })
          ] })
        ] });
      }
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic", children: "Data available" });
    }
  };
  const count = (() => {
    if (Array.isArray(data)) return data.length;
    if (data && typeof data === "object") {
      const nested = Object.values(data).filter(Array.isArray);
      return nested.reduce((sum, arr) => sum + arr.length, 0);
    }
    return 0;
  })();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
        count,
        " record",
        count !== 1 ? "s" : ""
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: renderContent() })
  ] });
}
function InspectionViewPage() {
  const { token } = useParams();
  const [state, setState] = reactExports.useState("loading");
  const [errorMsg, setErrorMsg] = reactExports.useState("");
  const [accessData, setAccessData] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMsg("No access token provided.");
      return;
    }
    fetch(`/api/access-token/${token}`).then(async (r) => {
      if (r.status === 403) {
        const body2 = await r.json();
        if (String(body2.error).includes("expired")) setState("expired");
        else setState("revoked");
        return;
      }
      if (!r.ok) {
        setState("error");
        setErrorMsg("Access token not found.");
        return;
      }
      const body = await r.json();
      setAccessData(body);
      setState("ok");
    }).catch(() => {
      setState("error");
      setErrorMsg("Could not load data. Please try again.");
    });
  }, [token]);
  if (state === "loading") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 animate-spin mx-auto text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Verifying access…" })
    ] }) });
  }
  if (state === "error" || state === "expired" || state === "revoked") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "max-w-md w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-10 h-10 mx-auto text-amber-500 mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold mb-2", children: state === "expired" ? "Access Expired" : state === "revoked" ? "Access Revoked" : "Access Unavailable" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        state === "expired" && "This access link has passed its expiry date. Please contact the farm to request a new link.",
        state === "revoked" && "This access link has been revoked by the farm. Please contact the farm if you believe this is an error.",
        state === "error" && (errorMsg || "This access link is invalid or has already expired.")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 pt-6 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-3.5 h-3.5 text-green-600" }),
        "Powered by BDE Farm Trac"
      ] })
    ] }) }) });
  }
  if (!accessData) return null;
  const { farm, accessor, permittedModules, data, sessionType } = accessData;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-muted/30", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary text-primary-foreground py-3 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: "Read-only compliance view" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary-foreground/70 text-xs", children: "— You cannot edit, add, or delete records." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-primary-foreground/80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3.5 h-3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Secured by BDE Farm Trac" }),
        accessor.expiresAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-primary-foreground/10 px-2 py-0.5 rounded", children: [
          "Expires ",
          new Date(accessor.expiresAt).toLocaleDateString("en-GB")
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-6 h-6 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: farm.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground", children: [
            farm.cphNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "CPH: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: farm.cphNumber })
            ] }),
            farm.sbiNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "SBI: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: farm.sbiNumber })
            ] }),
            farm.redTractorId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "RT ID: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: farm.redTractorId })
            ] }),
            farm.postcode && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Postcode: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: farm.postcode })
            ] }),
            farm.farmManager && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Farm Manager: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: farm.farmManager })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "gap-1 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3 text-green-600" }),
              permittedModules.length,
              " module",
              permittedModules.length !== 1 ? "s" : "",
              " shared"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: sessionType === "advisor" ? "Advisor access" : "Inspection session" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs text-muted-foreground flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: accessor.name }),
          accessor.organisation && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: accessor.organisation }),
          accessor.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: accessor.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1", children: [
            "Viewed ",
            (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")
          ] })
        ] })
      ] }) }) }),
      permittedModules.map((moduleKey) => /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { moduleKey, data: data[moduleKey] }, moduleKey)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-4 border-t text-xs text-muted-foreground flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-3.5 h-3.5 text-green-600" }),
        "Powered by BDE Farm Trac — UK Farm Compliance Management"
      ] })
    ] })
  ] });
}
export {
  InspectionViewPage as default
};
