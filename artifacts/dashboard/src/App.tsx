import React, { useEffect, useRef, Suspense } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClerkProvider, SignIn, SignUp, useClerk, useAuth } from "@clerk/react";

import "@/lib/fetch-patch";

// Static imports for framework-level pages (always needed)
import Login from "@/pages/Login";
import SelectContext from "@/pages/SelectContext";
import NotFound from "@/pages/not-found";

// Lazy-loaded page imports — each becomes a separate async chunk,
// dramatically reducing Rollup's peak memory during the production build.
const OnboardingPage = React.lazy(() => import("@/pages/OnboardingPage"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const FieldsPage = React.lazy(() => import("@/pages/Fields"));
const CropTrialsPage = React.lazy(() => import("@/pages/CropTrialsPage"));
const EquipmentPage = React.lazy(() => import("@/pages/Equipment"));
const ModulePage = React.lazy(() => import("@/pages/ModulePage"));
const MovementsPage = React.lazy(() => import("@/pages/Movements"));
const LivestockPageFull = React.lazy(() => import("@/pages/LivestockPage"));
const SuppliersStockPage = React.lazy(() => import("@/pages/SuppliersStock"));
const FinancialPage = React.lazy(() => import("@/pages/FinancialPage"));
const HarvestPage = React.lazy(() => import("@/pages/HarvestPage"));
const SprayPage = React.lazy(() => import("@/pages/SprayPage"));
const NMPPage = React.lazy(() => import("@/pages/NMPPage"));
const NVZPage = React.lazy(() => import("@/pages/NVZPage"));
const DocumentsPageCustom = React.lazy(() => import("@/pages/DocumentsPage"));
const HelpCentre = React.lazy(() => import("@/pages/HelpCentre"));
const SupportPage = React.lazy(() => import("@/pages/SupportPage"));
const HarvestDashboard = React.lazy(() => import("@/pages/HarvestDashboard"));
const LivestockHealthDashboard = React.lazy(() => import("@/pages/LivestockHealthDashboard"));
const NVZDashboard = React.lazy(() => import("@/pages/NVZDashboard"));
const SoilDashboard = React.lazy(() => import("@/pages/SoilDashboard"));
const FleetDashboard = React.lazy(() => import("@/pages/FleetDashboard"));
const BusinessReportsPage = React.lazy(() => import("@/pages/BusinessReportsPage"));
const FieldOperationsPage = React.lazy(() => import("@/pages/FieldOperationsPage"));
const FieldInspectionsPage = React.lazy(() => import("@/pages/FieldInspectionsPage"));
const FarmSettingsPage = React.lazy(() => import("@/pages/FarmSettings"));
const LookupListsPage = React.lazy(() => import("@/pages/LookupListsPage"));
const AppSettingsPage = React.lazy(() => import("@/pages/SettingsPage"));
const StaffPage = React.lazy(() => import("@/pages/Staff"));
const DepartmentsPage = React.lazy(() => import("@/pages/DepartmentsPage"));
const StaffTrainingPage = React.lazy(() => import("@/pages/StaffTrainingPage"));
const LabourPage = React.lazy(() => import("@/pages/LabourPage"));
const SoilTestsPage = React.lazy(() => import("@/pages/SoilTestsPage"));
const BiosecurityPage = React.lazy(() => import("@/pages/BiosecurityPage"));
const MedicinePageDedicated = React.lazy(() => import("@/pages/MedicinePage"));
const BiofuelPage = React.lazy(() => import("@/pages/BiofuelPage"));
const DataApiPage = React.lazy(() => import("@/pages/DataApiPage"));
const ReportBuilderPage = React.lazy(() => import("@/pages/ReportBuilderPage"));
const InspectionsPageFull = React.lazy(() => import("@/pages/InspectionsPageFull"));
const WeatherPageFull = React.lazy(() => import("@/pages/WeatherPageFull"));
const HaulagePageFull = React.lazy(() => import("@/pages/HaulagePageFull"));
const CropStockPage = React.lazy(() => import("@/pages/CropStockPage"));
const SeedStorePage = React.lazy(() => import("@/pages/SeedStorePage"));
const WoodlandPage = React.lazy(() => import("@/pages/woodland/WoodlandPage"));
const RegenerativePage = React.lazy(() => import("@/pages/regenerative/RegenerativePage"));
const StrawManagementPage = React.lazy(() => import("@/pages/StrawManagementPage"));
const EnvironmentalPageFull = React.lazy(() => import("@/pages/EnvironmentalPageFull"));
const StorageLocationsPage = React.lazy(() => import("@/pages/StorageLocationsPage"));
const AccountSettings = React.lazy(() => import("@/pages/AccountSettings"));
const AdvisorsAccessPage = React.lazy(() => import("@/pages/AdvisorsAccessPage"));
const InspectionViewPage = React.lazy(() => import("@/pages/InspectionViewPage"));
const RiskAssessmentsPage = React.lazy(() => import("@/pages/RiskAssessmentsPage"));
const WasteDisposalPage = React.lazy(() => import("@/pages/WasteDisposalPage"));
const ContractorsPage = React.lazy(() => import("@/pages/ContractorsPage"));
const FlyTippingPage = React.lazy(() => import("@/pages/FlyTippingPage"));
const EncampmentPage = React.lazy(() => import("@/pages/EncampmentPage"));
const FarmIncidentsPage = React.lazy(() => import("@/pages/FarmIncidentsPage"));
const AccidentBookPage = React.lazy(() => import("@/pages/AccidentBookPage"));
const FarmLocationsPage = React.lazy(() => import("@/pages/FarmLocationsPage"));
const FarmMapPage = React.lazy(() => import("@/pages/FarmMapPage"));
const ResourceMapPage = React.lazy(() => import("@/pages/ResourceMapPage"));
const DairyRestockPage = React.lazy(() => import("@/pages/DairyRestockPage"));
const WeekAheadPage = React.lazy(() => import("@/pages/WeekAheadPage"));
const TaskBoardPage = React.lazy(() => import("@/pages/TaskBoardPage"));
const ResourcesPage = React.lazy(() => import("@/pages/ResourcesPage"));
const HerdHealthRegisterPage = React.lazy(() => import("@/pages/HerdHealthRegisterPage"));
const DairyPage = React.lazy(() => import("@/pages/DairyPage"));
const WorkshopPage = React.lazy(() => import("@/pages/WorkshopPage"));
const PigProductionPage = React.lazy(() => import("@/pages/PigProductionPage"));
const PoultryProductionPage = React.lazy(() => import("@/pages/PoultryProductionPage"));
const SheepProductionPage = React.lazy(() => import("@/pages/SheepProductionPage"));
const GoatProductionPage = React.lazy(() => import("@/pages/GoatProductionPage"));
const VenisonProductionPage = React.lazy(() => import("@/pages/VenisonProductionPage"));
const OrganicVenisonPage = React.lazy(() => import("@/pages/OrganicVenisonPage"));
const BeefProductionPage = React.lazy(() => import("@/pages/BeefProductionPage"));
const ViticulturePage = React.lazy(() => import("@/pages/ViticulturePage"));
const FreshProducePage = React.lazy(() => import("@/pages/FreshProducePage"));
const CarbonPage = React.lazy(() => import("@/pages/CarbonPage"));
const DiversificationPage = React.lazy(() => import("@/pages/DiversificationPage"));
const WaterIrrigationPage = React.lazy(() => import("@/pages/WaterIrrigationPage"));
const InsurancePage = React.lazy(() => import("@/pages/InsurancePage"));
const FarmServicesPage = React.lazy(() => import("@/pages/FarmServicesPage"));
const GrantsPage = React.lazy(() => import("@/pages/GrantsPage"));
const AhdbLevyPage = React.lazy(() => import("@/pages/AhdbLevyPage"));
const TradeBodiesPage = React.lazy(() => import("@/pages/TradeBodiesPage"));
const SFIPage = React.lazy(() => import("@/pages/SFIPage"));
const FuelEnergyPage = React.lazy(() => import("@/pages/FuelEnergyPage"));
const FeedManagementPage = React.lazy(() => import("@/pages/FeedManagementPage"));
const SalesTradingPage = React.lazy(() => import("@/pages/SalesTradingPage"));
const TradeHistory = React.lazy(() => import("@/pages/TradeHistory"));
const OrganicPage = React.lazy(() => import("@/pages/OrganicPage"));
const OrganicLivestockPage = React.lazy(() => import("@/pages/OrganicLivestockPage"));
const OrganicDairyPage = React.lazy(() => import("@/pages/OrganicDairyPage"));
const SheepDairyPage = React.lazy(() => import("@/pages/SheepDairyPage"));
const OrganicSheepDairyPage = React.lazy(() => import("@/pages/OrganicSheepDairyPage"));
const GoatDairyPage = React.lazy(() => import("@/pages/GoatDairyPage"));
const OrganicGoatDairyPage = React.lazy(() => import("@/pages/OrganicGoatDairyPage"));
const OrganicFreshProducePage = React.lazy(() => import("@/pages/OrganicFreshProducePage"));
const OrganicViticulturePage = React.lazy(() => import("@/pages/OrganicViticulturePage"));
const OrganicArablePage = React.lazy(() => import("@/pages/OrganicArablePage"));
const CompliancePage = React.lazy(() => import("@/pages/CompliancePage"));
const VetLedgerPage = React.lazy(() => import("@/pages/VetLedgerPage"));
const SeasonReportsPage = React.lazy(() => import("@/pages/SeasonReportsPage"));
const MultiFarmGroupPage = React.lazy(() => import("@/pages/MultiFarmGroupPage"));
const TBTestingPage = React.lazy(() => import("@/pages/TBTestingPage"));
const EquinePage = React.lazy(() => import("@/pages/EquinePage"));
const AMRReportPage = React.lazy(() => import("@/pages/AMRReportPage"));
const LambingRecordsPage = React.lazy(() => import("@/pages/LambingRecordsPage"));
const PoultryNCPPage = React.lazy(() => import("@/pages/PoultryNCPPage"));
const AHWRPage = React.lazy(() => import("@/pages/AHWRPage"));
const BeekeepingPage = React.lazy(() => import("@/pages/BeekeepingPage"));
const OrganicPoultryPage = React.lazy(() => import("@/pages/OrganicPoultryPage"));
const SMSAlertsPage = React.lazy(() => import("@/pages/SMSAlertsPage"));

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

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

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

function RouteErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <ErrorBoundary key={location}>
      {children}
    </ErrorBoundary>
  );
}

function AppRoutes() {
  const { farmId } = useAppStore();
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        <Route path="/select" component={SelectContext} />
        <Route path="/onboard" component={OnboardingPage} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/week-ahead" component={WeekAheadPage} />
        <Route path="/task-board" component={TaskBoardPage} />
        <Route path="/resources" component={ResourcesPage} />
        <Route path="/fields" component={FieldsPage} />
        <Route path="/crop-trials" component={CropTrialsPage} />
        <Route path="/straw-management" component={StrawManagementPage} />
        <Route path="/harvest" component={HarvestPage} />
        <Route path="/storage-locations" component={StorageLocationsPage} />
        <Route path="/equipment" component={EquipmentPage} />
        <Route path="/sprays" component={SprayPage} />
        <Route path="/nmp" component={NMPPage} />
        <Route path="/nvz" component={NVZPage} />
        <Route path="/soil" component={SoilTestsPage} />
        <Route path="/inspections" component={InspectionsPageFull} />
        <Route path="/risks" component={RiskAssessmentsPage} />
        <Route path="/waste" component={WasteDisposalPage} />
        <Route path="/fly-tipping" component={() => <FlyTippingPage farmId={farmId} />} />
        <Route path="/encampments" component={EncampmentPage} />
        <Route path="/farm-incidents" component={FarmIncidentsPage} />
        <Route path="/accident-book" component={AccidentBookPage} />
        <Route path="/contractors" component={ContractorsPage} />
        <Route path="/visitors" component={() => <BiosecurityPage defaultTab="visitors" />} />
        <Route path="/pest-control" component={() => <BiosecurityPage defaultTab="pest-control" />} />
        <Route path="/cleaning" component={() => <BiosecurityPage defaultTab="cleaning" />} />
        <Route path="/coshh" component={() => <BiosecurityPage defaultTab="coshh" />} />
        <Route path="/farm-locations" component={FarmLocationsPage} />
        <Route path="/farm-map" component={FarmMapPage} />
        <Route path="/resource-map" component={ResourceMapPage} />
        <Route path="/dairy-restock" component={DairyRestockPage} />
        <Route path="/livestock" component={LivestockPageFull} />
        <Route path="/movements" component={MovementsPage} />
        <Route path="/medicine" component={MedicinePageDedicated} />
        <Route path="/training" component={StaffTrainingPage} />
        <Route path="/labour" component={LabourPage} />
        <Route path="/stock" component={SuppliersStockPage} />
        <Route path="/financial" component={FinancialPage} />
        <Route path="/sales-trading" component={SalesTradingPage} />
        <Route path="/trade-history" component={TradeHistory} />
        <Route path="/business-reports" component={BusinessReportsPage} />
        <Route path="/season-reports" component={SeasonReportsPage} />
        <Route path="/field-operations" component={FieldOperationsPage} />
        <Route path="/field-inspections" component={FieldInspectionsPage} />
        <Route path="/environmental" component={EnvironmentalPageFull} />
        <Route path="/haulage" component={HaulagePageFull} />
        <Route path="/crop-stock" component={CropStockPage} />
        <Route path="/seed-store" component={SeedStorePage} />
        <Route path="/woodland" component={WoodlandPage} />
        <Route path="/regenerative" component={RegenerativePage} />
        <Route path="/documents" component={DocumentsPageCustom} />
        <Route path="/weather" component={WeatherPageFull} />
        <Route path="/help" component={HelpCentre} />
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
        <Route path="/settings/lookups" component={LookupListsPage} />
        <Route path="/settings" component={AppSettingsPage} />
        <Route path="/account" component={AccountSettings} />
        <Route path="/dairy" component={DairyPage} />
        <Route path="/workshop" component={WorkshopPage} />
        <Route path="/biofuel" component={BiofuelPage} />
        <Route path="/data-api" component={DataApiPage} />
        <Route path="/report-builder" component={ReportBuilderPage} />
        <Route path="/pig-production" component={PigProductionPage} />
        <Route path="/poultry-production" component={PoultryProductionPage} />
        <Route path="/sheep-production" component={SheepProductionPage} />
        <Route path="/goat-production" component={GoatProductionPage} />
        <Route path="/venison-production" component={VenisonProductionPage} />
        <Route path="/organic-venison" component={OrganicVenisonPage} />
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
        <Route path="/ahdb-levy" component={AhdbLevyPage} />
        <Route path="/trade-levies" component={TradeBodiesPage} />
        <Route path="/sfi" component={SFIPage} />
        <Route path="/fuel-energy" component={FuelEnergyPage} />
        <Route path="/feed" component={FeedManagementPage} />
        <Route path="/organic" component={OrganicPage} />
        <Route path="/organic-livestock" component={OrganicLivestockPage} />
        <Route path="/organic-dairy" component={OrganicDairyPage} />
        <Route path="/sheep-dairy" component={SheepDairyPage} />
        <Route path="/organic-sheep-dairy" component={OrganicSheepDairyPage} />
        <Route path="/goat-dairy" component={GoatDairyPage} />
        <Route path="/organic-goat-dairy" component={OrganicGoatDairyPage} />
        <Route path="/organic-fresh-produce" component={OrganicFreshProducePage} />
        <Route path="/organic-viticulture" component={OrganicViticulturePage} />
        <Route path="/organic-arable" component={OrganicArablePage} />
        <Route path="/compliance" component={CompliancePage} />
        <Route path="/group-overview" component={MultiFarmGroupPage} />
        <Route path="/tb-tests" component={TBTestingPage} />
        <Route path="/equine" component={EquinePage} />
        <Route path="/amr-report" component={AMRReportPage} />
        <Route path="/lambing" component={LambingRecordsPage} />
        <Route path="/poultry-ncp" component={PoultryNCPPage} />
        <Route path="/ahwr" component={AHWRPage} />
        <Route path="/beekeeping" component={BeekeepingPage} />
        <Route path="/organic-poultry" component={OrganicPoultryPage} />
        <Route path="/sms-alerts" component={SMSAlertsPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function ProtectedContent() {
  return (
    <AuthGate>
      <AppRoutes />
    </AuthGate>
  );
}

function Router() {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/inspect/:token" component={InspectionViewPage} />
          <Route component={ProtectedContent} />
        </Switch>
      </Suspense>
    </RouteErrorBoundary>
  );
}

function DevBypassContent() {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Switch>
          <Route path="/" component={() => <Redirect to="/select" />} />
          <Route path="/sign-in/*?" component={() => <Redirect to="/select" />} />
          <Route path="/sign-up/*?" component={() => <Redirect to="/select" />} />
          <Route path="/inspect/:token" component={InspectionViewPage} />
          <Route component={AppRoutes} />
        </Switch>
      </Suspense>
    </RouteErrorBoundary>
  );
}

function ClerkProviderWrapper() {
  const [, setLocation] = useLocation();
  const isDevBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";

  if (isDevBypass) {
    return (
      <QueryClientProvider client={queryClient}>
        <NavHistoryProvider>
          <DevBypassContent />
          <Toaster />
        </NavHistoryProvider>
      </QueryClientProvider>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <NavHistoryProvider>
          <ClerkQueryClientCacheInvalidator />
          <Router />
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
