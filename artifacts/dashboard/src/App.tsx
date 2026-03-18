import React from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import "@/lib/fetch-patch";

import Login from "@/pages/Login";
import SelectContext from "@/pages/SelectContext";
import Dashboard from "@/pages/Dashboard";
import FieldsPage from "@/pages/Fields";
import EquipmentPage from "@/pages/Equipment";
import ModulePage from "@/pages/ModulePage";
import MovementsPage from "@/pages/Movements";
import LivestockPageFull from "@/pages/LivestockPage";
import SuppliersStockPage from "@/pages/SuppliersStock";
import FinancialPage from "@/pages/FinancialPage";
import HarvestPage from "@/pages/HarvestPage";
import SprayPage from "@/pages/SprayPage";
import NMPPage from "@/pages/NMPPage";
import NVZPage from "@/pages/NVZPage";
import DocumentsPageCustom from "@/pages/DocumentsPage";
import HelpCentre from "@/pages/HelpCentre";
import SupportPage from "@/pages/SupportPage";
import HarvestDashboard from "@/pages/HarvestDashboard";
import LivestockHealthDashboard from "@/pages/LivestockHealthDashboard";
import NVZDashboard from "@/pages/NVZDashboard";
import SoilDashboard from "@/pages/SoilDashboard";
import FleetDashboard from "@/pages/FleetDashboard";
import FarmSettingsPage from "@/pages/FarmSettings";
import AppSettingsPage from "@/pages/SettingsPage";
import StaffPage from "@/pages/Staff";
import NotFound from "@/pages/not-found";
import SoilTestsPage from "@/pages/SoilTestsPage";
import BiosecurityPage from "@/pages/BiosecurityPage";
import MedicinePageDedicated from "@/pages/MedicinePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});


function SoilPage() {
  return <SoilTestsPage />;
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
  return <BiosecurityPage defaultTab="visitors" />;
}

function PestControlPage() {
  return <BiosecurityPage defaultTab="pest-control" />;
}

function CleaningPage() {
  return <BiosecurityPage defaultTab="cleaning" />;
}

function LivestockPage() {
  return <LivestockPageFull />;
}


function MedicinePage() {
  return <MedicinePageDedicated />;
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
  return <SuppliersStockPage />;
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
  return <HelpCentre />;
}

function SettingsPage() {
  return <AppSettingsPage />;
}

function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <ErrorBoundary key={location}>
      {children}
    </ErrorBoundary>
  );
}

function Router() {
  return (
    <RouteErrorBoundary>
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/select" component={SelectContext} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/fields" component={FieldsPage} />
      <Route path="/harvest" component={HarvestPage} />
      <Route path="/equipment" component={EquipmentPage} />
      <Route path="/sprays" component={SprayPage} />
      <Route path="/nmp" component={NMPPage} />
      <Route path="/nvz" component={NVZPage} />
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
      <Route path="/documents" component={DocumentsPageCustom} />
      <Route path="/weather" component={WeatherPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/harvest-dashboard" component={HarvestDashboard} />
      <Route path="/livestock-health" component={LivestockHealthDashboard} />
      <Route path="/nvz-dashboard" component={NVZDashboard} />
      <Route path="/soil-dashboard" component={SoilDashboard} />
      <Route path="/fleet-dashboard" component={FleetDashboard} />
      <Route path="/staff" component={StaffPage} />
      <Route path="/settings/farm" component={FarmSettingsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
    </RouteErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
