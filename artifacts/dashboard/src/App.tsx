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
import CropTrialsPage from "@/pages/CropTrialsPage";
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
import BusinessReportsPage from "@/pages/BusinessReportsPage";
import FieldOperationsPage from "@/pages/FieldOperationsPage";
import FieldInspectionsPage from "@/pages/FieldInspectionsPage";
import FarmSettingsPage from "@/pages/FarmSettings";
import AppSettingsPage from "@/pages/SettingsPage";
import StaffPage from "@/pages/Staff";
import StaffTrainingPage from "@/pages/StaffTrainingPage";
import NotFound from "@/pages/not-found";
import SoilTestsPage from "@/pages/SoilTestsPage";
import BiosecurityPage from "@/pages/BiosecurityPage";
import MedicinePageDedicated from "@/pages/MedicinePage";
import BiofuelPage from "@/pages/BiofuelPage";
import InspectionsPageFull from "@/pages/InspectionsPageFull";
import WeatherPageFull from "@/pages/WeatherPageFull";
import HaulagePageFull from "@/pages/HaulagePageFull";
import CropStockPage from "@/pages/CropStockPage";
import EnvironmentalPageFull from "@/pages/EnvironmentalPageFull";
import StorageLocationsPage from "@/pages/StorageLocationsPage";
import AccountSettings from "@/pages/AccountSettings";
import AdvisorsAccessPage from "@/pages/AdvisorsAccessPage";
import InspectionViewPage from "@/pages/InspectionViewPage";
import RiskAssessmentsPage from "@/pages/RiskAssessmentsPage";
import WasteDisposalPage from "@/pages/WasteDisposalPage";
import FlyTippingPage from "@/pages/FlyTippingPage";
import EncampmentPage from "@/pages/EncampmentPage";
import AccidentBookPage from "@/pages/AccidentBookPage";
import FarmLocationsPage from "@/pages/FarmLocationsPage";
import FarmMapPage from "@/pages/FarmMapPage";
import WeekAheadPage from "@/pages/WeekAheadPage";
import TaskBoardPage from "@/pages/TaskBoardPage";
import HerdHealthRegisterPage from "@/pages/HerdHealthRegisterPage";
import DairyPage from "@/pages/DairyPage";
import WorkshopPage from "@/pages/WorkshopPage";
import PigProductionPage from "@/pages/PigProductionPage";
import PoultryProductionPage from "@/pages/PoultryProductionPage";
import HorticulturePage from "@/pages/HorticulturePage";
import CarbonPage from "@/pages/CarbonPage";
import DiversificationPage from "@/pages/DiversificationPage";
import WaterIrrigationPage from "@/pages/WaterIrrigationPage";
import InsurancePage from "@/pages/InsurancePage";
import GrantsPage from "@/pages/GrantsPage";
import FuelEnergyPage from "@/pages/FuelEnergyPage";
import FeedManagementPage from "@/pages/FeedManagementPage";
import SalesTradingPage from "@/pages/SalesTradingPage";
import OrganicPage from "@/pages/OrganicPage";
import CompliancePage from "@/pages/CompliancePage";

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
  return <InspectionsPageFull />;
}

function RisksPage() {
  return <RiskAssessmentsPage />;
}

function WastePage() {
  return <WasteDisposalPage />;
}

function FlyTippingPageWrapper() {
  return <FlyTippingPage />;
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
  return <StaffTrainingPage />;
}

function StockPage() {
  return <SuppliersStockPage />;
}


function EnvironmentalPage() {
  return <EnvironmentalPageFull />;
}

function HaulagePage() {
  return <HaulagePageFull />;
}

function WeatherPage() {
  return <WeatherPageFull />;
}

function CoshhPage() {
  return <BiosecurityPage defaultTab="coshh" />;
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
      <Route path="/week-ahead" component={WeekAheadPage} />
      <Route path="/task-board" component={TaskBoardPage} />
      <Route path="/fields" component={FieldsPage} />
      <Route path="/crop-trials" component={CropTrialsPage} />
      <Route path="/harvest" component={HarvestPage} />
      <Route path="/storage-locations" component={StorageLocationsPage} />
      <Route path="/equipment" component={EquipmentPage} />
      <Route path="/sprays" component={SprayPage} />
      <Route path="/nmp" component={NMPPage} />
      <Route path="/nvz" component={NVZPage} />
      <Route path="/soil" component={SoilPage} />
      <Route path="/inspections" component={InspectionsPage} />
      <Route path="/risks" component={RisksPage} />
      <Route path="/waste" component={WastePage} />
      <Route path="/fly-tipping" component={FlyTippingPageWrapper} />
      <Route path="/encampments" component={EncampmentPage} />
      <Route path="/accident-book" component={AccidentBookPage} />
      <Route path="/visitors" component={VisitorsPage} />
      <Route path="/pest-control" component={PestControlPage} />
      <Route path="/cleaning" component={CleaningPage} />
      <Route path="/coshh" component={CoshhPage} />
      <Route path="/farm-locations" component={FarmLocationsPage} />
      <Route path="/farm-map" component={FarmMapPage} />
      <Route path="/livestock" component={LivestockPage} />
      <Route path="/movements" component={MovementsPage} />
      <Route path="/medicine" component={MedicinePage} />
      <Route path="/training" component={TrainingPage} />
      <Route path="/stock" component={StockPage} />
      <Route path="/financial" component={FinancialPage} />
      <Route path="/sales-trading" component={SalesTradingPage} />
      <Route path="/business-reports" component={BusinessReportsPage} />
      <Route path="/field-operations" component={FieldOperationsPage} />
      <Route path="/field-inspections" component={FieldInspectionsPage} />
      <Route path="/environmental" component={EnvironmentalPage} />
      <Route path="/haulage" component={HaulagePage} />
      <Route path="/crop-stock" component={CropStockPage} />
      <Route path="/documents" component={DocumentsPageCustom} />
      <Route path="/weather" component={WeatherPage} />
      <Route path="/help" component={HelpPage} />
      <Route path="/support" component={SupportPage} />
      <Route path="/harvest-dashboard" component={HarvestDashboard} />
      <Route path="/livestock-health" component={LivestockHealthDashboard} />
      <Route path="/herd-health-register" component={HerdHealthRegisterPage} />
      <Route path="/nvz-dashboard" component={NVZDashboard} />
      <Route path="/soil-dashboard" component={SoilDashboard} />
      <Route path="/fleet-dashboard" component={FleetDashboard} />
      <Route path="/staff" component={StaffPage} />
      <Route path="/settings/access" component={AdvisorsAccessPage} />
      <Route path="/settings/farm" component={FarmSettingsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/account" component={AccountSettings} />
      <Route path="/dairy" component={DairyPage} />
      <Route path="/workshop" component={WorkshopPage} />
      <Route path="/biofuel" component={BiofuelPage} />
      <Route path="/pig-production" component={PigProductionPage} />
      <Route path="/poultry-production" component={PoultryProductionPage} />
      <Route path="/horticulture" component={HorticulturePage} />
      <Route path="/carbon" component={CarbonPage} />
      <Route path="/diversification" component={DiversificationPage} />
      <Route path="/water-irrigation" component={WaterIrrigationPage} />
      <Route path="/insurance" component={InsurancePage} />
      <Route path="/grants" component={GrantsPage} />
      <Route path="/fuel-energy" component={FuelEnergyPage} />
      <Route path="/feed" component={FeedManagementPage} />
      <Route path="/organic" component={OrganicPage} />
      <Route path="/compliance" component={CompliancePage} />
      <Route path="/inspect/:token" component={InspectionViewPage} />
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
