import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import "@/lib/fetch-patch";

import Login from "@/pages/Login";
import SelectContext from "@/pages/SelectContext";
import Dashboard from "@/pages/Dashboard";
import FieldsPage from "@/pages/Fields";
import EquipmentPage from "@/pages/Equipment";
import ModulePage from "@/pages/ModulePage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function SpraysPage() {
  return <ModulePage title="Spray Records" apiPath="spray-applications" columns={[
    { key: "applicationDate", label: "Date" },
    { key: "fieldName", label: "Field" },
    { key: "productName", label: "Product" },
    { key: "operatorName", label: "Operator" },
    { key: "areaSprayedHa", label: "Area (ha)" },
  ]} formFields={[
    { key: "applicationDate", label: "Application Date", type: "date", required: true },
    { key: "operatorName", label: "Operator", required: true },
    { key: "reasonForApplication", label: "Reason", required: true },
    { key: "areaSprayedHa", label: "Area (ha)", type: "number" },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function SoilPage() {
  return <ModulePage title="Soil Tests" apiPath="soil-tests" columns={[
    { key: "sampleDate", label: "Sample Date" },
    { key: "labReference", label: "Lab Reference" },
    { key: "sampledBy", label: "Sampled By" },
    { key: "status", label: "Status" },
  ]} formFields={[
    { key: "sampleDate", label: "Sample Date", type: "date", required: true },
    { key: "labReference", label: "Lab Reference" },
    { key: "sampledBy", label: "Sampled By", required: true },
    { key: "status", label: "Status", type: "select", options: ["pending", "received", "analysed"] },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function InspectionsPage() {
  return <ModulePage title="Inspections" apiPath="inspections" columns={[
    { key: "inspectionDate", label: "Date" },
    { key: "inspectorName", label: "Inspector" },
    { key: "inspectionType", label: "Type" },
    { key: "outcome", label: "Outcome" },
    { key: "nextInspectionDue", label: "Next Due" },
  ]} formFields={[
    { key: "inspectionDate", label: "Inspection Date", type: "date", required: true },
    { key: "inspectorName", label: "Inspector Name", required: true },
    { key: "inspectionType", label: "Type", type: "select", options: ["Red Tractor", "Internal Audit", "EHO", "Trading Standards", "Other"] },
    { key: "outcome", label: "Outcome", type: "select", options: ["pass", "conditional_pass", "fail", "pending"] },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function RisksPage() {
  return <ModulePage title="Risk Assessments & COSHH" apiPath="risk-assessments" columns={[
    { key: "title", label: "Title" },
    { key: "assessmentDate", label: "Date" },
    { key: "assessedBy", label: "Assessed By" },
    { key: "riskLevel", label: "Risk Level" },
    { key: "reviewDate", label: "Review Due" },
  ]} formFields={[
    { key: "title", label: "Title", required: true },
    { key: "assessmentDate", label: "Assessment Date", type: "date", required: true },
    { key: "assessedBy", label: "Assessed By", required: true },
    { key: "riskLevel", label: "Risk Level", type: "select", options: ["low", "medium", "high", "critical"] },
    { key: "hazardDescription", label: "Hazard Description", type: "textarea", required: true },
    { key: "controlMeasures", label: "Control Measures", type: "textarea" },
    { key: "reviewDate", label: "Review Date", type: "date" },
  ]} />;
}

function WastePage() {
  return <ModulePage title="Waste Management" apiPath="waste" columns={[
    { key: "wasteType", label: "Type" },
    { key: "disposalDate", label: "Date" },
    { key: "disposalMethod", label: "Method" },
    { key: "quantityKg", label: "Qty (kg)" },
    { key: "carrierName", label: "Carrier" },
  ]} formFields={[
    { key: "wasteType", label: "Waste Type", required: true },
    { key: "disposalDate", label: "Disposal Date", type: "date", required: true },
    { key: "disposalMethod", label: "Method", required: true },
    { key: "quantityKg", label: "Quantity (kg)", type: "number" },
    { key: "carrierName", label: "Carrier" },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function VisitorsPage() {
  return <ModulePage title="Visitor & Contractor Log" apiPath="visitors" columns={[
    { key: "visitorName", label: "Name" },
    { key: "companyName", label: "Company" },
    { key: "purpose", label: "Purpose" },
    { key: "arrivalTime", label: "Arrived" },
    { key: "departureTime", label: "Departed" },
  ]} formFields={[
    { key: "visitorName", label: "Visitor Name", required: true },
    { key: "companyName", label: "Company" },
    { key: "purpose", label: "Purpose of Visit", required: true },
    { key: "vehicleReg", label: "Vehicle Reg" },
    { key: "arrivalTime", label: "Arrival Time", type: "datetime-local", required: true },
    { key: "biosecurityChecked", label: "Biosecurity Checked", type: "select", options: ["true", "false"] },
  ]} />;
}

function PestControlPage() {
  return <ModulePage title="Pest Control" apiPath="pest-control" columns={[
    { key: "pestType", label: "Pest Type" },
    { key: "treatmentDate", label: "Date" },
    { key: "treatmentMethod", label: "Method" },
    { key: "location", label: "Location" },
    { key: "conductedBy", label: "Conducted By" },
  ]} formFields={[
    { key: "pestType", label: "Pest Type", required: true },
    { key: "treatmentDate", label: "Treatment Date", type: "date", required: true },
    { key: "treatmentMethod", label: "Method", required: true },
    { key: "location", label: "Location" },
    { key: "conductedBy", label: "Conducted By", required: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function CleaningPage() {
  return <ModulePage title="Cleaning & Disinfection" apiPath="cleaning" columns={[
    { key: "cleanedDate", label: "Date" },
    { key: "area", label: "Area" },
    { key: "method", label: "Method" },
    { key: "cleanedBy", label: "Cleaned By" },
    { key: "productUsed", label: "Product Used" },
  ]} formFields={[
    { key: "cleanedDate", label: "Cleaning Date", type: "date", required: true },
    { key: "area", label: "Area/Location", required: true },
    { key: "method", label: "Method", required: true },
    { key: "cleanedBy", label: "Cleaned By", required: true },
    { key: "productUsed", label: "Product Used" },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function LivestockPage() {
  return <ModulePage title="Herds & Animals" apiPath="herds" columns={[
    { key: "herdName", label: "Herd/Flock Name" },
    { key: "speciesType", label: "Species" },
    { key: "breedType", label: "Breed" },
    { key: "currentCount", label: "Count" },
    { key: "isActive", label: "Active" },
  ]} formFields={[
    { key: "herdName", label: "Herd/Flock Name", required: true },
    { key: "speciesType", label: "Species", type: "select", options: ["cattle", "sheep", "pigs", "poultry", "goats", "other"], required: true },
    { key: "breedType", label: "Breed" },
    { key: "currentCount", label: "Current Count", type: "number" },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function MovementsPage() {
  return <ModulePage title="Livestock Movements" apiPath="movements" columns={[
    { key: "movementDate", label: "Date" },
    { key: "movementType", label: "Type" },
    { key: "animalCount", label: "Count" },
    { key: "originCph", label: "Origin CPH" },
    { key: "destinationCph", label: "Destination CPH" },
  ]} formFields={[
    { key: "movementDate", label: "Movement Date", type: "date", required: true },
    { key: "movementType", label: "Type", type: "select", options: ["on", "off", "between"], required: true },
    { key: "animalCount", label: "Animal Count", type: "number", required: true },
    { key: "originCph", label: "Origin CPH" },
    { key: "destinationCph", label: "Destination CPH" },
    { key: "licenceNumber", label: "Licence Number" },
  ]} />;
}

function MedicinePage() {
  return <ModulePage title="Medicine Records" apiPath="medicine-records" columns={[
    { key: "medicineName", label: "Medicine" },
    { key: "administeredDate", label: "Date" },
    { key: "administeredBy", label: "Given By" },
    { key: "dosage", label: "Dosage" },
    { key: "withdrawalEndDate", label: "Withdrawal End" },
  ]} formFields={[
    { key: "medicineName", label: "Medicine Name", required: true },
    { key: "administeredDate", label: "Date Given", type: "date", required: true },
    { key: "administeredBy", label: "Given By", required: true },
    { key: "dosage", label: "Dosage", required: true },
    { key: "batchNumber", label: "Batch Number" },
    { key: "withdrawalDays", label: "Withdrawal Days", type: "number" },
  ]} />;
}

function TrainingPage() {
  return <ModulePage title="Staff Training" apiPath="training" columns={[
    { key: "trainingTitle", label: "Title" },
    { key: "trainingDate", label: "Date" },
    { key: "staffName", label: "Staff" },
    { key: "provider", label: "Provider" },
    { key: "expiryDate", label: "Expires" },
  ]} formFields={[
    { key: "trainingTitle", label: "Training Title", required: true },
    { key: "trainingDate", label: "Date", type: "date", required: true },
    { key: "staffName", label: "Staff Name", required: true },
    { key: "provider", label: "Provider" },
    { key: "expiryDate", label: "Expiry Date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function StockPage() {
  return <ModulePage title="Suppliers & Stock" apiPath="suppliers" columns={[
    { key: "companyName", label: "Company" },
    { key: "contactName", label: "Contact" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "isActive", label: "Active" },
  ]} formFields={[
    { key: "companyName", label: "Company Name", required: true },
    { key: "contactName", label: "Contact Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email", type: "email" },
    { key: "address", label: "Address", type: "textarea" },
  ]} />;
}

function FinancialPage() {
  return <ModulePage title="Financial Records" apiPath="financial-transactions" columns={[
    { key: "transactionDate", label: "Date" },
    { key: "description", label: "Description" },
    { key: "category", label: "Category" },
    { key: "transactionType", label: "Type" },
    { key: "amountPence", label: "Amount", render: (val: number) => val ? `\u00A3${(val / 100).toFixed(2)}` : "-" },
  ]} formFields={[
    { key: "transactionDate", label: "Date", type: "date", required: true },
    { key: "description", label: "Description", required: true },
    { key: "category", label: "Category", required: true },
    { key: "transactionType", label: "Type", type: "select", options: ["income", "expense"], required: true },
    { key: "amountPence", label: "Amount (pence)", type: "number", required: true },
    { key: "vatAmountPence", label: "VAT (pence)", type: "number" },
  ]} />;
}

function EnvironmentalPage() {
  return <ModulePage title="Environmental Features" apiPath="environmental-features" columns={[
    { key: "featureType", label: "Type" },
    { key: "featureName", label: "Name" },
    { key: "areaSqMetres", label: "Area (m\u00B2)" },
    { key: "dateRecorded", label: "Recorded" },
  ]} formFields={[
    { key: "featureType", label: "Feature Type", type: "select", options: ["hedgerow", "pond", "woodland", "wetland", "grassland", "wildflower_margin", "other"], required: true },
    { key: "featureName", label: "Name", required: true },
    { key: "areaSqMetres", label: "Area (m\u00B2)", type: "number" },
    { key: "dateRecorded", label: "Date Recorded", type: "date", required: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function HaulagePage() {
  return <ModulePage title="Haulage Records" apiPath="haulage" columns={[
    { key: "departureDate", label: "Departure" },
    { key: "cargoDescription", label: "Cargo" },
    { key: "vehicleReg", label: "Vehicle" },
    { key: "driverName", label: "Driver" },
    { key: "destination", label: "Destination" },
  ]} formFields={[
    { key: "departureDate", label: "Departure Date", type: "date", required: true },
    { key: "cargoDescription", label: "Cargo", required: true },
    { key: "vehicleReg", label: "Vehicle Reg", required: true },
    { key: "driverName", label: "Driver", required: true },
    { key: "destination", label: "Destination", required: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function DocumentsPage() {
  return <ModulePage title="Documents" apiPath="documents" columns={[
    { key: "title", label: "Title" },
    { key: "documentType", label: "Type" },
    { key: "category", label: "Category" },
    { key: "createdAt", label: "Uploaded" },
  ]} formFields={[
    { key: "title", label: "Title", required: true },
    { key: "documentType", label: "Type", type: "select", options: ["certificate", "report", "policy", "procedure", "record", "other"] },
    { key: "category", label: "Category" },
    { key: "notes", label: "Notes", type: "textarea" },
  ]} />;
}

function WeatherPage() {
  return <ModulePage title="Weather Records" apiPath="weather-readings" columns={[
    { key: "readingTimestamp", label: "Date/Time" },
    { key: "temperatureC", label: "Temp (\u00B0C)" },
    { key: "humidityPercent", label: "Humidity (%)" },
    { key: "windSpeedKmh", label: "Wind (km/h)" },
    { key: "rainfallMm", label: "Rain (mm)" },
  ]} formFields={[
    { key: "readingTimestamp", label: "Reading Time", type: "datetime-local", required: true },
    { key: "temperatureC", label: "Temperature (\u00B0C)", type: "number" },
    { key: "humidityPercent", label: "Humidity (%)", type: "number" },
    { key: "windSpeedKmh", label: "Wind Speed (km/h)", type: "number" },
    { key: "rainfallMm", label: "Rainfall (mm)", type: "number" },
  ]} />;
}

function HelpPage() {
  return <ModulePage title="Help Centre" apiPath="help/articles" scope="global" responseKey="articles" columns={[
    { key: "title", label: "Article" },
    { key: "category", label: "Category" },
  ]} />;
}

function SettingsPage() {
  return <ModulePage title="Staff & Settings" apiPath="tenants/current/users" scope="global" responseKey="users" columns={[
    { key: "email", label: "Email" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "isActive", label: "Active" },
  ]} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/select" component={SelectContext} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/fields" component={FieldsPage} />
      <Route path="/equipment" component={EquipmentPage} />
      <Route path="/sprays" component={SpraysPage} />
      <Route path="/soil" component={SoilPage} />
      <Route path="/inspections" component={InspectionsPage} />
      <Route path="/risks" component={RisksPage} />
      <Route path="/waste" component={WastePage} />
      <Route path="/visitors" component={VisitorsPage} />
      <Route path="/pest-control" component={PestControlPage} />
      <Route path="/cleaning" component={CleaningPage} />
      <Route path="/livestock" component={LivestockPage} />
      <Route path="/movements" component={MovementsPage} />
      <Route path="/medicine" component={MedicinePage} />
      <Route path="/training" component={TrainingPage} />
      <Route path="/stock" component={StockPage} />
      <Route path="/financial" component={FinancialPage} />
      <Route path="/environmental" component={EnvironmentalPage} />
      <Route path="/haulage" component={HaulagePage} />
      <Route path="/documents" component={DocumentsPage} />
      <Route path="/weather" component={WeatherPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
