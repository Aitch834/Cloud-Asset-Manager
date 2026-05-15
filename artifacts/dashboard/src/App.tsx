import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClerkProvider, SignIn, SignUp, useClerk, useAuth } from "@clerk/react";

import "@/lib/fetch-patch";

import Login from "@/pages/Login";
import SelectContext from "@/pages/SelectContext";
import OnboardingPage from "@/pages/OnboardingPage";
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
import DepartmentsPage from "@/pages/DepartmentsPage";
import StaffTrainingPage from "@/pages/StaffTrainingPage";
import LabourPage from "@/pages/LabourPage";
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
import ContractorsPage from "@/pages/ContractorsPage";
const FlyTippingPage = React.lazy(() => import("@/pages/FlyTippingPage"));
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
import SheepProductionPage from "@/pages/SheepProductionPage";
import BeefProductionPage from "@/pages/BeefProductionPage";
import ViticulturePage from "@/pages/ViticulturePage";
import FreshProducePage from "@/pages/FreshProducePage";
import CarbonPage from "@/pages/CarbonPage";
import DiversificationPage from "@/pages/DiversificationPage";
import WaterIrrigationPage from "@/pages/WaterIrrigationPage";
import InsurancePage from "@/pages/InsurancePage";
import FarmServicesPage from "@/pages/FarmServicesPage";
import GrantsPage from "@/pages/GrantsPage";
import SFIPage from "@/pages/SFIPage";
import FuelEnergyPage from "@/pages/FuelEnergyPage";
import FeedManagementPage from "@/pages/FeedManagementPage";
import SalesTradingPage from "@/pages/SalesTradingPage";
import TradeHistory from "@/pages/TradeHistory";
import OrganicPage from "@/pages/OrganicPage";
import OrganicLivestockPage from "@/pages/OrganicLivestockPage";
import OrganicDairyPage from "@/pages/OrganicDairyPage";
import OrganicFreshProducePage from "@/pages/OrganicFreshProducePage";
import OrganicViticulturePage from "@/pages/OrganicViticulturePage";
import CompliancePage from "@/pages/CompliancePage";
import VetLedgerPage from "@/pages/VetLedgerPage";
import SeasonReportsPage from "@/pages/SeasonReportsPage";
import MultiFarmGroupPage from "@/pages/MultiFarmGroupPage";
import { NavHistoryProvider } from "@/context/NavHistoryContext";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
// NOTE: in dev this env var will be empty, in prod it will be automatically set
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);
  return null;
}

function SignInPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/select`}
      />
    </div>
  );
}

function SignUpPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/onboard`}
      />
    </div>
  );
}

function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setLocation("/select");
    }
  }, [isLoaded, isSignedIn, setLocation]);
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (isSignedIn) return null;
  return <Login />;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setLocation("/");
    }
  }, [isLoaded, isSignedIn, setLocation]);
  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!isSignedIn) return null;
  return <>{children}</>;
}


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
  const { farmId } = useAppStore();
  return (
    <React.Suspense fallback={<div style={{ padding: 40, color: "#9ca3af" }}>Loading…</div>}>
      <FlyTippingPage farmId={farmId} />
    </React.Suspense>
  );
}

function CompliancePageWrapper() {
  return <CompliancePage />;
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

function ProtectedContent() {
  return (
    <AuthGate>
      <Switch>
        <Route path="/select" component={SelectContext} />
        <Route path="/onboard" component={OnboardingPage} />
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
        <Route path="/contractors" component={ContractorsPage} />
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
        <Route path="/labour" component={() => <React.Suspense fallback={null}><LabourPage /></React.Suspense>} />
        <Route path="/stock" component={StockPage} />
        <Route path="/financial" component={FinancialPage} />
        <Route path="/sales-trading" component={SalesTradingPage} />
        <Route path="/trade-history" component={TradeHistory} />
        <Route path="/business-reports" component={BusinessReportsPage} />
        <Route path="/season-reports" component={SeasonReportsPage} />
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
        <Route path="/vet-ledger" component={VetLedgerPage} />
        <Route path="/nvz-dashboard" component={NVZDashboard} />
        <Route path="/soil-dashboard" component={SoilDashboard} />
        <Route path="/fleet-dashboard" component={FleetDashboard} />
        <Route path="/staff" component={StaffPage} />
        <Route path="/departments" component={DepartmentsPage} />
        <Route path="/settings/access" component={AdvisorsAccessPage} />
        <Route path="/settings/farm" component={FarmSettingsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/account" component={AccountSettings} />
        <Route path="/dairy" component={DairyPage} />
        <Route path="/workshop" component={WorkshopPage} />
        <Route path="/biofuel" component={BiofuelPage} />
        <Route path="/pig-production" component={PigProductionPage} />
        <Route path="/poultry-production" component={PoultryProductionPage} />
        <Route path="/sheep-production" component={SheepProductionPage} />
        <Route path="/beef-production" component={BeefProductionPage} />
        <Route path="/viticulture" component={ViticulturePage} />
        <Route path="/horticulture"><Redirect to="/fresh-produce" /></Route>
        <Route path="/fresh-produce" component={FreshProducePage} />
        <Route path="/carbon" component={CarbonPage} />
        <Route path="/diversification" component={DiversificationPage} />
        <Route path="/water-irrigation" component={WaterIrrigationPage} />
        <Route path="/insurance" component={InsurancePage} />
        <Route path="/farm-services" component={FarmServicesPage} />
        <Route path="/grants" component={GrantsPage} />
        <Route path="/sfi" component={SFIPage} />
        <Route path="/fuel-energy" component={FuelEnergyPage} />
        <Route path="/feed" component={FeedManagementPage} />
        <Route path="/organic" component={OrganicPage} />
        <Route path="/organic-livestock" component={OrganicLivestockPage} />
        <Route path="/organic-dairy" component={OrganicDairyPage} />
        <Route path="/organic-fresh-produce" component={OrganicFreshProducePage} />
        <Route path="/organic-viticulture" component={OrganicViticulturePage} />
        <Route path="/compliance" component={CompliancePageWrapper} />
        <Route path="/group-overview" component={MultiFarmGroupPage} />
        <Route component={NotFound} />
      </Switch>
    </AuthGate>
  );
}

function Router() {
  return (
    <RouteErrorBoundary>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/inspect/:token" component={InspectionViewPage} />
        <Route component={ProtectedContent} />
      </Switch>
    </RouteErrorBoundary>
  );
}

function DevBypassContent() {
  return (
    <RouteErrorBoundary>
      <Switch>
        <Route path="/" component={() => <Redirect to="/select" />} />
        <Route path="/sign-in/*?" component={() => <Redirect to="/select" />} />
        <Route path="/sign-up/*?" component={() => <Redirect to="/select" />} />
        <Route path="/inspect/:token" component={InspectionViewPage} />
        <Route path="/select" component={SelectContext} />
        <Route path="/onboard" component={OnboardingPage} />
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
        <Route path="/contractors" component={ContractorsPage} />
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
        <Route path="/labour" component={() => <React.Suspense fallback={null}><LabourPage /></React.Suspense>} />
        <Route path="/stock" component={StockPage} />
        <Route path="/financial" component={FinancialPage} />
        <Route path="/sales-trading" component={SalesTradingPage} />
        <Route path="/trade-history" component={TradeHistory} />
        <Route path="/business-reports" component={BusinessReportsPage} />
        <Route path="/season-reports" component={SeasonReportsPage} />
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
        <Route path="/vet-ledger" component={VetLedgerPage} />
        <Route path="/nvz-dashboard" component={NVZDashboard} />
        <Route path="/soil-dashboard" component={SoilDashboard} />
        <Route path="/fleet-dashboard" component={FleetDashboard} />
        <Route path="/staff" component={StaffPage} />
        <Route path="/departments" component={DepartmentsPage} />
        <Route path="/settings/access" component={AdvisorsAccessPage} />
        <Route path="/settings/farm" component={FarmSettingsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/account" component={AccountSettings} />
        <Route path="/dairy" component={DairyPage} />
        <Route path="/workshop" component={WorkshopPage} />
        <Route path="/biofuel" component={BiofuelPage} />
        <Route path="/pig-production" component={PigProductionPage} />
        <Route path="/poultry-production" component={PoultryProductionPage} />
        <Route path="/sheep-production" component={SheepProductionPage} />
        <Route path="/beef-production" component={BeefProductionPage} />
        <Route path="/viticulture" component={ViticulturePage} />
        <Route path="/horticulture"><Redirect to="/fresh-produce" /></Route>
        <Route path="/fresh-produce" component={FreshProducePage} />
        <Route path="/carbon" component={CarbonPage} />
        <Route path="/diversification" component={DiversificationPage} />
        <Route path="/water-irrigation" component={WaterIrrigationPage} />
        <Route path="/insurance" component={InsurancePage} />
        <Route path="/farm-services" component={FarmServicesPage} />
        <Route path="/grants" component={GrantsPage} />
        <Route path="/sfi" component={SFIPage} />
        <Route path="/fuel-energy" component={FuelEnergyPage} />
        <Route path="/feed" component={FeedManagementPage} />
        <Route path="/organic" component={OrganicPage} />
        <Route path="/organic-livestock" component={OrganicLivestockPage} />
        <Route path="/organic-dairy" component={OrganicDairyPage} />
        <Route path="/organic-fresh-produce" component={OrganicFreshProducePage} />
        <Route path="/organic-viticulture" component={OrganicViticulturePage} />
        <Route path="/compliance" component={CompliancePageWrapper} />
        <Route path="/group-overview" component={MultiFarmGroupPage} />
        <Route component={NotFound} />
      </Switch>
    </RouteErrorBoundary>
  );
}

function ClerkProviderWrapper() {
  const [, setLocation] = useLocation();
  const isDevBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <NavHistoryProvider>
          {!isDevBypass && <ClerkQueryClientCacheInvalidator />}
          {isDevBypass ? <DevBypassContent /> : <Router />}
          <Toaster />
        </NavHistoryProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <WouterRouter base={basePath}>
        <ClerkProviderWrapper />
      </WouterRouter>
    </ErrorBoundary>
  );
}

export default App;
