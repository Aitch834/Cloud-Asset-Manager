import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Eye, Lock, AlertTriangle, Leaf, CheckCircle2 } from "lucide-react";

interface AccessData {
  valid: boolean;
  sessionType: "advisor" | "inspection";
  farm: {
    name: string;
    cphNumber?: string;
    address?: string;
    postcode?: string;
    sbiNumber?: string;
    redTractorId?: string;
    farmManager?: string;
  };
  accessor: {
    name: string;
    email?: string;
    organisation?: string;
    expiresAt?: string;
  };
  permittedModules: string[];
  data: Record<string, unknown>;
}

const MODULE_LABELS: Record<string, string> = {
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
  "water-irrigation": "Water & Irrigation Management",
};

function fmt(val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  const s = String(val);
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return new Date(s).toLocaleDateString("en-GB");
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + "T00:00:00").toLocaleDateString("en-GB");
  return s;
}

function RecordTable({ records, columns }: { records: Record<string, unknown>[]; columns: { key: string; label: string }[] }) {
  if (!records || records.length === 0) {
    return <p className="text-sm text-muted-foreground italic py-2">No records</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            {columns.map(c => (
              <th key={c.key} className="text-left px-3 py-2 font-semibold text-xs text-foreground/70 whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {records.map((r, i) => (
            <tr key={i} className="hover:bg-muted/20">
              {columns.map(c => (
                <td key={c.key} className="px-3 py-2 text-foreground/80 whitespace-nowrap">{fmt(r[c.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionCard({ moduleKey, data }: { moduleKey: string; data: unknown }) {
  const title = MODULE_LABELS[moduleKey] ?? moduleKey;

  const renderContent = () => {
    if (!data) return <p className="text-sm text-muted-foreground italic">No data</p>;

    switch (moduleKey) {
      case "spray_records": {
        const records = data as Record<string, unknown>[];
        return <RecordTable records={records} columns={[
          { key: "applicationDate", label: "Date" },
          { key: "fieldName", label: "Field" },
          { key: "productName", label: "Product" },
          { key: "totalAreaHa", label: "Area (ha)" },
          { key: "operatorName", label: "Operator" },
          { key: "windSpeed", label: "Wind (m/s)" },
          { key: "temperature", label: "Temp (°C)" },
        ]} />;
      }
      case "fields_crops": {
        const records = data as Record<string, unknown>[];
        return <RecordTable records={records} columns={[
          { key: "name", label: "Field Name" },
          { key: "areaHa", label: "Area (ha)" },
          { key: "soilType", label: "Soil Type" },
          { key: "isNvzDesignated", label: "NVZ" },
          { key: "currentCrop", label: "Current Crop" },
        ]} />;
      }
      case "soil_tests": {
        const records = data as Record<string, unknown>[];
        return <RecordTable records={records} columns={[
          { key: "sampleDate", label: "Date" },
          { key: "fieldName", label: "Field" },
          { key: "laboratory", label: "Laboratory" },
          { key: "pH", label: "pH" },
          { key: "phosphateIndex", label: "P Index" },
          { key: "potassiumIndex", label: "K Index" },
        ]} />;
      }
      case "harvest": {
        const records = data as Record<string, unknown>[];
        return <RecordTable records={records} columns={[
          { key: "harvestDate", label: "Date" },
          { key: "fieldName", label: "Field" },
          { key: "cropName", label: "Crop" },
          { key: "yieldTonnes", label: "Yield (t)" },
          { key: "moistureContent", label: "Moisture %" },
        ]} />;
      }
      case "equipment": {
        const records = data as Record<string, unknown>[];
        return <RecordTable records={records} columns={[
          { key: "name", label: "Equipment" },
          { key: "make", label: "Make" },
          { key: "model", label: "Model" },
          { key: "serialNumber", label: "Serial No." },
          { key: "lastCalibrationDate", label: "Last Calibration" },
          { key: "nextCalibrationDue", label: "Next Due" },
          { key: "nstsCertificateExpiry", label: "NSTS Expiry" },
        ]} />;
      }
      case "livestock": {
        const records = data as Record<string, unknown>[];
        return <RecordTable records={records} columns={[
          { key: "name", label: "Herd / Flock" },
          { key: "species", label: "Species" },
          { key: "breedType", label: "Breed" },
          { key: "currentCount", label: "Count" },
          { key: "locationBuilding", label: "Location" },
        ]} />;
      }
      case "medicines": {
        const records = data as Record<string, unknown>[];
        return <RecordTable records={records} columns={[
          { key: "treatmentDate", label: "Date" },
          { key: "productName", label: "Product" },
          { key: "animalGroup", label: "Animals Treated" },
          { key: "dosageAmount", label: "Dose" },
          { key: "routeOfAdministration", label: "Route" },
          { key: "withdrawalPeriodDays", label: "Withdrawal (days)" },
          { key: "withdrawalEndDate", label: "Withdrawal End" },
          { key: "administeredBy", label: "Administered By" },
        ]} />;
      }
      case "movements": {
        const records = data as Record<string, unknown>[];
        return <RecordTable records={records} columns={[
          { key: "movementDate", label: "Date" },
          { key: "movementType", label: "Type" },
          { key: "species", label: "Species" },
          { key: "animalCount", label: "Count" },
          { key: "sourceCphNumber", label: "From CPH" },
          { key: "destinationCphNumber", label: "To CPH" },
        ]} />;
      }
      case "biosecurity": {
        const d = data as { visitors: Record<string, unknown>[]; pestControl: Record<string, unknown>[]; biosecurityPlan: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Visitor Log</h4>
              <RecordTable records={d.visitors ?? []} columns={[
                { key: "arrivalTime", label: "Date" },
                { key: "visitorName", label: "Visitor" },
                { key: "company", label: "Company" },
                { key: "purposeOfVisit", label: "Purpose" },
                { key: "signedDeclaration", label: "Signed Declaration" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Pest Control</h4>
              <RecordTable records={d.pestControl ?? []} columns={[
                { key: "treatmentDate", label: "Date" },
                { key: "areaInspected", label: "Area" },
                { key: "pestFound", label: "Pest Found" },
                { key: "treatmentApplied", label: "Treatment" },
                { key: "operatorName", label: "Operator" },
              ]} />
            </div>
            {d.biosecurityPlan?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Biosecurity Plan</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                  Written biosecurity plan on file — reviewed {fmt((d.biosecurityPlan[0] as Record<string, unknown>)?.lastReviewDate)}
                </div>
              </div>
            )}
          </div>
        );
      }
      case "staff_training": {
        const d = data as { trainingRecords: Record<string, unknown>[]; certificates: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Training Records</h4>
              <RecordTable records={d.trainingRecords ?? []} columns={[
                { key: "staffName", label: "Staff Name" },
                { key: "trainingCourse", label: "Course" },
                { key: "provider", label: "Provider" },
                { key: "trainingDate", label: "Date" },
                { key: "expiryDate", label: "Expiry" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Certificates & Qualifications</h4>
              <RecordTable records={d.certificates ?? []} columns={[
                { key: "staffName", label: "Staff Name" },
                { key: "certificateType", label: "Certificate" },
                { key: "certificateNumber", label: "Cert No." },
                { key: "issuingBody", label: "Issuer" },
                { key: "issueDate", label: "Issued" },
                { key: "expiryDate", label: "Expiry" },
              ]} />
            </div>
          </div>
        );
      }
      case "inspections": {
        const d = data as { inspections: Record<string, unknown>[]; nonconformances: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Inspection Records</h4>
              <RecordTable records={d.inspections ?? []} columns={[
                { key: "inspectionDate", label: "Date" },
                { key: "inspectionType", label: "Type" },
                { key: "inspectionBody", label: "Body" },
                { key: "inspectorName", label: "Inspector" },
                { key: "overallResult", label: "Result" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Non-Conformances</h4>
              <RecordTable records={d.nonconformances ?? []} columns={[
                { key: "identifiedDate", label: "Date" },
                { key: "category", label: "Category" },
                { key: "severity", label: "Severity" },
                { key: "status", label: "Status" },
                { key: "description", label: "Description" },
              ]} />
            </div>
          </div>
        );
      }
      case "nvz": {
        const d = data as { applications: Record<string, unknown>[]; riskAssessments: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">NVZ Fertiliser Applications</h4>
              <RecordTable records={d.applications ?? []} columns={[
                { key: "applicationDate", label: "Date" },
                { key: "fieldName", label: "Field" },
                { key: "productName", label: "Product" },
                { key: "nitrogenKgHa", label: "N kg/ha" },
                { key: "applicationMethod", label: "Method" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">NVZ Risk Assessments</h4>
              <RecordTable records={d.riskAssessments ?? []} columns={[
                { key: "assessmentDate", label: "Date" },
                { key: "assessorName", label: "Assessor" },
                { key: "soilType", label: "Soil Type" },
                { key: "drainageRisk", label: "Drainage Risk" },
                { key: "overallRiskLevel", label: "Overall Risk" },
                { key: "nextReviewDate", label: "Next Review" },
              ]} />
            </div>
          </div>
        );
      }
      case "risk_assessments": {
        const d = data as { riskAssessments: Record<string, unknown>[]; coshh: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Risk Assessments</h4>
              <RecordTable records={d.riskAssessments ?? []} columns={[
                { key: "assessmentDate", label: "Date" },
                { key: "activityDescription", label: "Activity" },
                { key: "riskLevel", label: "Risk Level" },
                { key: "controlMeasures", label: "Controls" },
                { key: "reviewDate", label: "Review Date" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">COSHH Records</h4>
              <RecordTable records={d.coshh ?? []} columns={[
                { key: "substanceName", label: "Substance" },
                { key: "assessmentDate", label: "Assessed" },
                { key: "reviewDate", label: "Review" },
                { key: "hazardDescription", label: "Hazard" },
                { key: "ppe", label: "PPE Required" },
              ]} />
            </div>
          </div>
        );
      }
      case "workshop": {
        const d = data as {
          jobCards: { job: Record<string, unknown>; equipmentName: string | null }[];
          patTests: Record<string, unknown>[];
          fireExtinguishers: Record<string, unknown>[];
        };
        const flatJobs = (d.jobCards ?? []).map(({ job, equipmentName }) => ({ ...job, equipmentName }));
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Job Cards</h4>
              <RecordTable records={flatJobs} columns={[
                { key: "jobNumber", label: "Job No." },
                { key: "equipmentName", label: "Equipment" },
                { key: "jobType", label: "Type" },
                { key: "priority", label: "Priority" },
                { key: "status", label: "Status" },
                { key: "description", label: "Description" },
                { key: "createdAt", label: "Raised" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">PAT Testing</h4>
              <RecordTable records={d.patTests ?? []} columns={[
                { key: "itemName", label: "Appliance" },
                { key: "location", label: "Location" },
                { key: "testDate", label: "Test Date" },
                { key: "result", label: "Result" },
                { key: "testerName", label: "Tester" },
                { key: "certificateNumber", label: "Cert No." },
                { key: "nextDueDate", label: "Next Due" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Fire Extinguishers</h4>
              <RecordTable records={d.fireExtinguishers ?? []} columns={[
                { key: "location", label: "Location" },
                { key: "type", label: "Type" },
                { key: "capacityKg", label: "Capacity (kg)" },
                { key: "serialNumber", label: "Serial No." },
                { key: "lastServiceDate", label: "Last Service" },
                { key: "engineerName", label: "Engineer" },
                { key: "nextServiceDue", label: "Next Service Due" },
              ]} />
            </div>
          </div>
        );
      }
      case "environmental": {
        const records = data as Record<string, unknown>[];
        return <RecordTable records={records} columns={[
          { key: "featureName", label: "Feature" },
          { key: "featureType", label: "Type" },
          { key: "areaHa", label: "Area (ha)" },
          { key: "managementAgreement", label: "Agreement" },
          { key: "lastReviewDate", label: "Last Review" },
        ]} />;
      }
      case "pig-production": {
        const d = data as { herds?: Record<string, unknown>[]; healthRecords?: Record<string, unknown>[]; medicineRecords?: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Pig Herds</h4>
              <RecordTable records={d.herds ?? []} columns={[
                { key: "herdName", label: "Herd Name" },
                { key: "breedType", label: "Breed" },
                { key: "currentCount", label: "Count" },
                { key: "productionSystem", label: "System" },
                { key: "locationBuilding", label: "Building" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Health Records</h4>
              <RecordTable records={d.healthRecords ?? []} columns={[
                { key: "eventDate", label: "Date" },
                { key: "eventType", label: "Type" },
                { key: "description", label: "Description" },
                { key: "outcome", label: "Outcome" },
                { key: "vetName", label: "Vet" },
              ]} />
            </div>
          </div>
        );
      }
      case "poultry-production": {
        const d = data as { flocks?: Record<string, unknown>[]; mortalityRecords?: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Poultry Flocks</h4>
              <RecordTable records={d.flocks ?? []} columns={[
                { key: "flockId", label: "Flock ID" },
                { key: "species", label: "Species" },
                { key: "breed", label: "Breed" },
                { key: "placementDate", label: "Placement" },
                { key: "currentCount", label: "Count" },
                { key: "productionType", label: "Type" },
                { key: "houseId", label: "House" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Mortality Records</h4>
              <RecordTable records={d.mortalityRecords ?? []} columns={[
                { key: "recordDate", label: "Date" },
                { key: "count", label: "Count" },
                { key: "cause", label: "Cause" },
                { key: "action", label: "Action" },
              ]} />
            </div>
          </div>
        );
      }
      case "horticulture": {
        const d = data as { crops?: Record<string, unknown>[]; harvestRecords?: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Horticultural Crops</h4>
              <RecordTable records={d.crops ?? []} columns={[
                { key: "cropName", label: "Crop" },
                { key: "variety", label: "Variety" },
                { key: "fieldOrBlock", label: "Field / Block" },
                { key: "plantingDate", label: "Planted" },
                { key: "expectedHarvestDate", label: "Exp. Harvest" },
                { key: "areaHa", label: "Area (ha)" },
                { key: "certificationScheme", label: "Certification" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Harvest Records</h4>
              <RecordTable records={d.harvestRecords ?? []} columns={[
                { key: "harvestDate", label: "Date" },
                { key: "cropName", label: "Crop" },
                { key: "quantityKg", label: "Quantity (kg)" },
                { key: "grade", label: "Grade" },
                { key: "destination", label: "Destination" },
              ]} />
            </div>
          </div>
        );
      }
      case "carbon-sustainability": {
        const d = data as { footprints?: Record<string, unknown>[]; actions?: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Carbon Footprint Assessments</h4>
              <RecordTable records={d.footprints ?? []} columns={[
                { key: "assessmentYear", label: "Year" },
                { key: "totalEmissionsTco2e", label: "Total (tCO₂e)" },
                { key: "emissionsPerHa", label: "Per ha" },
                { key: "assessmentMethod", label: "Method" },
                { key: "assessorName", label: "Assessor" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Sustainability Actions</h4>
              <RecordTable records={d.actions ?? []} columns={[
                { key: "actionDate", label: "Date" },
                { key: "category", label: "Category" },
                { key: "description", label: "Action" },
                { key: "status", label: "Status" },
                { key: "estimatedReductionTco2e", label: "Est. Saving (tCO₂e)" },
              ]} />
            </div>
          </div>
        );
      }
      case "farm-diversification": {
        const d = data as { enterprises?: Record<string, unknown>[]; incomeRecords?: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Diversification Enterprises</h4>
              <RecordTable records={d.enterprises ?? []} columns={[
                { key: "enterpriseName", label: "Enterprise" },
                { key: "enterpriseType", label: "Type" },
                { key: "startDate", label: "Start Date" },
                { key: "planningPermission", label: "Planning Permission" },
                { key: "status", label: "Status" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Income Records</h4>
              <RecordTable records={d.incomeRecords ?? []} columns={[
                { key: "incomeDate", label: "Date" },
                { key: "enterpriseName", label: "Enterprise" },
                { key: "incomeType", label: "Type" },
                { key: "amount", label: "Amount (£)" },
                { key: "payerName", label: "Payer" },
              ]} />
            </div>
          </div>
        );
      }
      case "water-irrigation": {
        const d = data as { sources?: Record<string, unknown>[]; usageRecords?: Record<string, unknown>[] };
        return (
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-semibold mb-2">Water Sources & Abstraction Licences</h4>
              <RecordTable records={d.sources ?? []} columns={[
                { key: "sourceName", label: "Source" },
                { key: "sourceType", label: "Type" },
                { key: "abstractionLicenceNumber", label: "Licence No." },
                { key: "annualAllocatedM3", label: "Annual Allocation (m³)" },
                { key: "licenceExpiryDate", label: "Expiry" },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Irrigation Usage Records</h4>
              <RecordTable records={d.usageRecords ?? []} columns={[
                { key: "irrigationDate", label: "Date" },
                { key: "fieldName", label: "Field" },
                { key: "volumeUsedM3", label: "Volume (m³)" },
                { key: "method", label: "Method" },
                { key: "cropName", label: "Crop" },
              ]} />
            </div>
          </div>
        );
      }
      default:
        return <p className="text-sm text-muted-foreground italic">Data available</p>;
    }
  };

  const count = (() => {
    if (Array.isArray(data)) return data.length;
    if (data && typeof data === "object") {
      const nested = Object.values(data as Record<string, unknown>).filter(Array.isArray);
      return nested.reduce((sum: number, arr) => sum + (arr as unknown[]).length, 0);
    }
    return 0;
  })();

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="secondary">{count} record{count !== 1 ? "s" : ""}</Badge>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}

export default function InspectionViewPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<"loading" | "error" | "expired" | "revoked" | "ok">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [accessData, setAccessData] = useState<AccessData | null>(null);

  useEffect(() => {
    if (!token) { setState("error"); setErrorMsg("No access token provided."); return; }
    fetch(`/api/access-token/${token}`)
      .then(async r => {
        if (r.status === 403) {
          const body = await r.json();
          if (String(body.error).includes("expired")) setState("expired");
          else setState("revoked");
          return;
        }
        if (!r.ok) { setState("error"); setErrorMsg("Access token not found."); return; }
        const body = await r.json();
        setAccessData(body);
        setState("ok");
      })
      .catch(() => { setState("error"); setErrorMsg("Could not load data. Please try again."); });
  }, [token]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (state === "error" || state === "expired" || state === "revoked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-4" />
            <h2 className="text-lg font-bold mb-2">
              {state === "expired" ? "Access Expired" : state === "revoked" ? "Access Revoked" : "Access Unavailable"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {state === "expired" && "This access link has passed its expiry date. Please contact the farm to request a new link."}
              {state === "revoked" && "This access link has been revoked by the farm. Please contact the farm if you believe this is an error."}
              {state === "error" && (errorMsg || "This access link is invalid or has already expired.")}
            </p>
            <div className="mt-6 pt-6 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Leaf className="w-3.5 h-3.5 text-green-600" />
              Powered by BDE Farm Trac
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!accessData) return null;
  const { farm, accessor, permittedModules, data, sessionType } = accessData;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Read-only banner */}
      <div className="bg-primary text-primary-foreground py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span className="font-semibold text-sm">Read-only compliance view</span>
            <span className="text-primary-foreground/70 text-xs">— You cannot edit, add, or delete records.</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-primary-foreground/80">
            <Lock className="w-3.5 h-3.5" />
            <span>Secured by BDE Farm Trac</span>
            {accessor.expiresAt && (
              <span className="bg-primary-foreground/10 px-2 py-0.5 rounded">
                Expires {new Date(accessor.expiresAt).toLocaleDateString("en-GB")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Farm & accessor header */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground">{farm.name}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                  {farm.cphNumber && <span>CPH: <span className="text-foreground font-medium">{farm.cphNumber}</span></span>}
                  {farm.sbiNumber && <span>SBI: <span className="text-foreground font-medium">{farm.sbiNumber}</span></span>}
                  {farm.redTractorId && <span>RT ID: <span className="text-foreground font-medium">{farm.redTractorId}</span></span>}
                  {farm.postcode && <span>Postcode: <span className="text-foreground font-medium">{farm.postcode}</span></span>}
                  {farm.farmManager && <span>Farm Manager: <span className="text-foreground font-medium">{farm.farmManager}</span></span>}
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    {permittedModules.length} module{permittedModules.length !== 1 ? "s" : ""} shared
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {sessionType === "advisor" ? "Advisor access" : "Inspection session"}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                <p className="font-medium text-foreground">{accessor.name}</p>
                {accessor.organisation && <p>{accessor.organisation}</p>}
                {accessor.email && <p>{accessor.email}</p>}
                <p className="mt-1">Viewed {new Date().toLocaleDateString("en-GB")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module sections */}
        {permittedModules.map(moduleKey => (
          <SectionCard key={moduleKey} moduleKey={moduleKey} data={data[moduleKey]} />
        ))}

        {/* Footer */}
        <div className="text-center py-4 border-t text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Leaf className="w-3.5 h-3.5 text-green-600" />
          Powered by BDE Farm Trac — UK Farm Compliance Management
        </div>

      </div>
    </div>
  );
}
