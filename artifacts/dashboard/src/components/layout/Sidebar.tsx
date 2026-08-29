import { Link, useLocation } from "wouter";
import { useAppVersion } from "@/hooks/use-app-version";
import { useSafeClerk } from "@/hooks/use-safe-clerk";
import { 
  LayoutDashboard, 
  Sprout, 
  Tractor, 
  Droplets, 
  TestTube,
  Wheat,
  ShieldAlert,
  ClipboardCheck,
  Settings,
  MapPin,
  LogOut,
  ChevronDown,
  Bug,
  Trash2,
  Users,
  FileText,
  CloudSun,
  Truck,
  Package,
  PoundSterling,
  Leaf,
  HeartPulse,
  GraduationCap,
  ShieldCheck,
  HelpCircle,
  FlaskConical,
  LifeBuoy,
  BarChart3,
  FileBarChart2,
  Wrench,
  Gauge,
  Fuel,
  Database,
  Warehouse,
  Smartphone,
  Shovel,
  Map,
  CalendarDays,
  Milk,
  PiggyBank,
  Bird,
  Recycle,
  Building2,
  Waves,
  TreePine,
  Landmark,
  AlertTriangle,
  Grape,
  BookOpen,
  TrendingUp,
  ClipboardList,
  List,
  Layers,
  Stethoscope,
  Zap,
  ShoppingBag,
  Scissors,
  Scale,
  Clock,
  Crosshair,
  CalendarClock,
  Boxes,
  Bell,
  Navigation,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useEffect } from "react";
import { useUserRole, type FarmRole } from "@/hooks/use-user-role";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleKeys?: string[];
  requiresLivestock?: boolean;
  minRole?: FarmRole;
}

const coreNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Group Overview", href: "/group-overview", icon: Building2 },
  { name: "Week Ahead", href: "/week-ahead", icon: CalendarDays },
  { name: "Task Board", href: "/task-board", icon: ClipboardList },
  { name: "Resource Planner", href: "/resources", icon: CalendarClock, moduleKeys: ["resource-planner"] },
  { name: "Resource Map", href: "/resource-map", icon: Navigation },
  { name: "Weather", href: "/weather", icon: CloudSun, moduleKeys: ["weather-tracking"] },
];

const peopleNav: NavItem[] = [
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Departments", href: "/departments", icon: Building2 },
  { name: "Labour", href: "/labour", icon: Clock, moduleKeys: ["staff-training"] },
  { name: "Training", href: "/training", icon: GraduationCap, moduleKeys: ["staff-training"] },
];

const farmManagementNav: NavItem[] = [
  { name: "Fields & Crops", href: "/fields", icon: Sprout, moduleKeys: ["field-crop-management", "viticulture", "fresh-produce", "organic-compliance", "organic-fresh-produce", "organic-arable", "biofuel-rtfo"] },
  { name: "Harvest Records", href: "/harvest", icon: Wheat, moduleKeys: ["field-crop-management", "viticulture", "fresh-produce", "organic-arable"] },
  { name: "Field Operations", href: "/field-operations", icon: Shovel, moduleKeys: ["field-crop-management", "viticulture", "fresh-produce", "organic-arable"] },
  { name: "Field Inspections", href: "/field-inspections", icon: ClipboardCheck, moduleKeys: ["field-crop-management", "viticulture", "fresh-produce", "organic-arable"] },
  { name: "Storage Locations", href: "/storage-locations", icon: Warehouse, moduleKeys: ["field-crop-management", "fresh-produce", "organic-arable"] },
  { name: "Crop Stock", href: "/crop-stock", icon: Layers, moduleKeys: ["field-crop-management", "fresh-produce", "organic-arable"] },
  { name: "Seed Store", href: "/seed-store", icon: Package, moduleKeys: ["field-crop-management", "fresh-produce", "organic-arable"] },
  { name: "Straw Management", href: "/straw-management", icon: Wheat, moduleKeys: ["field-crop-management"] },
  { name: "Crop Trials", href: "/crop-trials", icon: FlaskConical, moduleKeys: ["field-crop-management"] },
  { name: "Spray Records", href: "/sprays", icon: Droplets, moduleKeys: ["sprays-inputs", "viticulture", "fresh-produce"] },
  { name: "NMP", href: "/nmp", icon: Leaf, moduleKeys: ["sprays-inputs"] },
  { name: "NVZ Compliance", href: "/nvz", icon: FlaskConical, moduleKeys: ["sprays-inputs"] },
  { name: "Soil Tests", href: "/soil", icon: TestTube, moduleKeys: ["soil-management"] },
  { name: "Equipment", href: "/equipment", icon: Tractor, moduleKeys: ["equipment-management"] },
  { name: "Workshop", href: "/workshop", icon: Wrench, moduleKeys: ["workshop-management"] },
];

const livestockNav: NavItem[] = [
  { name: "Herds & Animals", href: "/livestock", icon: HeartPulse, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "organic-livestock", "organic-dairy"], requiresLivestock: true },
  { name: "Movements", href: "/movements", icon: Truck, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "pig-production"], requiresLivestock: true },
  { name: "Medicine", href: "/medicine", icon: HeartPulse, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "pig-production", "poultry-production"], requiresLivestock: true },
  { name: "Herd Health Register", href: "/herd-health-register", icon: ClipboardList, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production"], requiresLivestock: true },
  { name: "Health Dashboard", href: "/livestock-health", icon: BarChart3, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production"], requiresLivestock: true },
  { name: "Dairy Records", href: "/dairy", icon: Milk, moduleKeys: ["dairy-management", "organic-dairy"], requiresLivestock: true },
  { name: "Dairy Restock", href: "/dairy-restock", icon: Package, moduleKeys: ["dairy-management", "sheep-dairy", "goat-dairy", "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy"] },
  { name: "Sheep Dairy", href: "/sheep-dairy", icon: Milk, moduleKeys: ["sheep-dairy"] },
  { name: "Goat Dairy", href: "/goat-dairy", icon: Milk, moduleKeys: ["goat-dairy"] },
  { name: "Feed Management", href: "/feed", icon: Package, moduleKeys: ["feed-management"] },
  { name: "Vet Ledger", href: "/vet-ledger", icon: Stethoscope, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "pig-production", "poultry-production"], requiresLivestock: true },
  { name: "TB Testing Register", href: "/tb-tests", icon: TestTube, moduleKeys: ["livestock-management", "beef-production", "sheep-production", "goat-production", "organic-livestock", "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy"], requiresLivestock: true },
  { name: "Lambing Records", href: "/lambing", icon: Scissors, moduleKeys: ["sheep-production", "organic-livestock", "organic-sheep-dairy"] },
  { name: "Annual Health Reviews", href: "/ahwr", icon: ClipboardList, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "pig-production", "poultry-production", "organic-livestock", "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy", "organic-venison"] },
];

const biosecurityNav: NavItem[] = [
  { name: "Farm Map", href: "/farm-map", icon: Map, moduleKeys: ["biosecurity"] },
  { name: "Farm Locations", href: "/farm-locations", icon: MapPin, moduleKeys: ["biosecurity"] },
  { name: "Visitor Log", href: "/visitors", icon: Users, moduleKeys: ["biosecurity"] },
  { name: "Pest Control", href: "/pest-control", icon: Bug, moduleKeys: ["biosecurity"] },
  { name: "Cleaning", href: "/cleaning", icon: ShieldCheck, moduleKeys: ["biosecurity"] },
  { name: "COSHH Assessments", href: "/coshh", icon: ShieldAlert, moduleKeys: ["biosecurity"] },
  { name: "Compliance & Plans", href: "/compliance", icon: FileText, moduleKeys: ["biosecurity"] },
];

const complianceNav: NavItem[] = [
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck, moduleKeys: ["inspections"] },
  { name: "Health, Safety & Risk", href: "/risks", icon: ShieldAlert, moduleKeys: ["risk-waste"] },
  { name: "Waste", href: "/waste", icon: Trash2, moduleKeys: ["risk-waste"] },
  { name: "Fly-Tipping", href: "/fly-tipping", icon: AlertTriangle, moduleKeys: ["risk-waste"] },
  { name: "Encampments", href: "/encampments", icon: AlertTriangle, moduleKeys: ["risk-waste"] },
  { name: "Farm Incidents", href: "/farm-incidents", icon: Flame, moduleKeys: ["risk-waste"] },
  { name: "Accident Book", href: "/accident-book", icon: BookOpen, moduleKeys: ["risk-waste"] },
  { name: "Contractors H&S File", href: "/contractors", icon: ClipboardCheck, moduleKeys: ["risk-waste"] },
  { name: "Insurance", href: "/insurance", icon: ShieldCheck },
  { name: "AMR Report", href: "/amr-report", icon: FlaskConical, moduleKeys: ["livestock-management", "sheep-production", "beef-production", "goat-production", "pig-production", "poultry-production", "organic-livestock", "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy", "organic-venison"] },
];

const organicFarmingNav: NavItem[] = [
  { name: "Organic Compliance", href: "/organic", icon: Leaf, moduleKeys: ["organic-compliance"] },
  { name: "Organic Livestock", href: "/organic-livestock", icon: HeartPulse, moduleKeys: ["organic-livestock"] },
  { name: "Organic Dairy", href: "/organic-dairy", icon: Milk, moduleKeys: ["organic-dairy"] },
  { name: "Organic Sheep Dairy", href: "/organic-sheep-dairy", icon: Milk, moduleKeys: ["organic-sheep-dairy"] },
  { name: "Organic Goat Dairy", href: "/organic-goat-dairy", icon: Milk, moduleKeys: ["organic-goat-dairy"] },
  { name: "Organic Fresh Produce", href: "/organic-fresh-produce", icon: Leaf, moduleKeys: ["organic-fresh-produce"] },
  { name: "Organic Viticulture", href: "/organic-viticulture", icon: Grape, moduleKeys: ["organic-viticulture"] },
  { name: "Organic Arable", href: "/organic-arable", icon: Wheat, moduleKeys: ["organic-arable"] },
  { name: "Organic Venison", href: "/organic-venison", icon: Leaf, moduleKeys: ["organic-venison"] },
  { name: "Organic Poultry", href: "/organic-poultry", icon: Bird, moduleKeys: ["organic-poultry"] },
];

const specialistNav: NavItem[] = [
  { name: "Pig Production", href: "/pig-production", icon: PiggyBank, moduleKeys: ["pig-production"] },
  { name: "Poultry Production", href: "/poultry-production", icon: Bird, moduleKeys: ["poultry-production"] },
  { name: "Poultry NCP / Salmonella", href: "/poultry-ncp", icon: FlaskConical, moduleKeys: ["poultry-production", "organic-poultry"] },
  { name: "Sheep Production", href: "/sheep-production", icon: Scissors, moduleKeys: ["sheep-production"] },
  { name: "Goat Production", href: "/goat-production", icon: HeartPulse, moduleKeys: ["goat-production"] },
  { name: "Venison Production", href: "/venison-production", icon: Crosshair, moduleKeys: ["venison-production"] },
  { name: "Beef Production", href: "/beef-production", icon: Scale, moduleKeys: ["beef-production"] },
  { name: "Fresh Produce", href: "/fresh-produce", icon: ShoppingBag, moduleKeys: ["fresh-produce"] },
  { name: "Viticulture", href: "/viticulture", icon: TreePine, moduleKeys: ["viticulture"] },
  { name: "Farm Diversification", href: "/diversification", icon: Building2, moduleKeys: ["farm-diversification"] },
  { name: "Equine", href: "/equine", icon: Zap, moduleKeys: ["farm-diversification", "equine"] },
  { name: "Beekeeping", href: "/beekeeping", icon: Boxes, moduleKeys: ["beekeeping"] },
  { name: "Water & Irrigation", href: "/water-irrigation", icon: Waves, moduleKeys: ["water-irrigation"] },
];

const financeNav: NavItem[] = [
  { name: "Financial", href: "/financial", icon: PoundSterling, moduleKeys: ["financial-records"], minRole: "manager" },
  { name: "Sales & Trading", href: "/sales-trading", icon: TrendingUp, moduleKeys: ["financial-records"], minRole: "manager" },
  { name: "Trade History", href: "/trade-history", icon: BarChart3, moduleKeys: ["financial-records"], minRole: "manager" },
  { name: "Trade Contacts & Stock", href: "/stock", icon: Package, moduleKeys: ["stock-suppliers"] },
  { name: "Farm Services", href: "/farm-services", icon: Building2 },
  { name: "SFI / ELM", href: "/sfi", icon: Leaf, moduleKeys: ["environmental"] },
  { name: "Grants & Funding", href: "/grants", icon: Landmark },
  { name: "Haulage", href: "/haulage", icon: Truck, moduleKeys: ["haulage-transport"] },
];

const tradeLevyNav: NavItem[] = [
  { name: "AHDB Levy", href: "/ahdb-levy", icon: Landmark },
  { name: "Trade Body Levies", href: "/trade-levies", icon: Landmark },
];

const environmentalNav: NavItem[] = [
  { name: "Environmental", href: "/environmental", icon: Leaf, moduleKeys: ["environmental"] },
  { name: "Woodland & Felling", href: "/woodland", icon: TreePine, moduleKeys: ["environmental"] },
  { name: "Regenerative Farming", href: "/regenerative", icon: Sprout, moduleKeys: ["environmental"] },
  { name: "Carbon & Sustainability", href: "/carbon", icon: Recycle, moduleKeys: ["carbon-sustainability"] },
  { name: "Biofuel / RTFO", href: "/biofuel", icon: Fuel, moduleKeys: ["biofuel-rtfo"] },
  { name: "Fuel & Energy", href: "/fuel-energy", icon: Fuel, moduleKeys: ["fuel-energy"] },
];

const reportingNav: NavItem[] = [
  { name: "Business Reports", href: "/business-reports", icon: BarChart3, moduleKeys: ["business-reports"], minRole: "manager" },
  { name: "Season Reports", href: "/season-reports", icon: FileBarChart2, moduleKeys: ["field-crop-management", "livestock-management"] },
  { name: "Harvest Dashboard", href: "/harvest-dashboard", icon: BarChart3, moduleKeys: ["field-crop-management"] },
  { name: "NVZ Status Board", href: "/nvz-dashboard", icon: Gauge, moduleKeys: ["sprays-inputs"] },
  { name: "Soil Health", href: "/soil-dashboard", icon: FlaskConical, moduleKeys: ["soil-management"] },
  { name: "Fleet Status", href: "/fleet-dashboard", icon: Wrench, moduleKeys: ["equipment-management"] },
];

const documentsNav: NavItem[] = [
  { name: "Documents", href: "/documents", icon: FileText, moduleKeys: ["document-management"] },
];

const integrationsNav: NavItem[] = [
  { name: "Data API Access", href: "/data-api", icon: Database, moduleKeys: ["data-api"] },
  { name: "Report Builder", href: "/report-builder", icon: BarChart3, moduleKeys: ["report-builder"] },
];

const ROLE_RANK: Record<FarmRole, number> = { operator: 0, senior: 1, manager: 2, owner: 3 };

const bottomNav: NavItem[] = [
  { name: "Help Centre", href: "/help", icon: HelpCircle },
  { name: "Support", href: "/support", icon: LifeBuoy },
  { name: "Farm Settings", href: "/settings/farm", icon: MapPin, minRole: "manager" },
  { name: "Lookup Lists", href: "/settings/lookups", icon: List, minRole: "manager" },
  { name: "Account & Notifications", href: "/account", icon: Smartphone },
  { name: "SMS & Alert Settings", href: "/sms-alerts", icon: Bell, minRole: "manager" },
  { name: "Settings", href: "/settings", icon: Settings, minRole: "manager" },
];

interface FarmSectors {
  hasLivestock: boolean;
}

function filterNavItems(items: NavItem[], activeModuleKeys: Set<string>, sectors: FarmSectors, userRole: FarmRole = "owner"): NavItem[] {
  return items.filter((item) => {
    if (item.requiresLivestock && !sectors.hasLivestock) return false;
    if (item.minRole && ROLE_RANK[userRole] < ROLE_RANK[item.minRole]) return false;
    if (!item.moduleKeys || item.moduleKeys.length === 0) return true;
    return item.moduleKeys.some((key) => activeModuleKeys.has(key));
  });
}

function NavSection({ title, items, onNavClick }: { title?: string; items: NavItem[]; onNavClick?: () => void }) {
  const [location] = useLocation();
  if (items.length === 0) return null;
  return (
    <div className="mb-2">
      {title && <p className="px-4 mb-1 text-[10px] uppercase tracking-widest font-bold text-white/30">{title}</p>}
      {items.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.name} href={item.href} className="block" onClick={onNavClick}>
            <div className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer text-sm",
              isActive 
                ? "bg-sidebar-active text-white font-medium shadow-inner shadow-black/20" 
                : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
            )}>
              <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-white/80")} />
              {item.name}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface TrialInfo {
  daysRemaining: number | null;
  endsAt: string | null;
}

function SidebarInner({ onNavClick, onLogout, currentFarmName, currentFarmRedTractorId,
  filteredCoreNav, filteredPeopleNav, filteredFarmManagementNav, filteredLivestockNav,
  filteredBiosecurityNav, filteredComplianceNav, filteredOrganicFarmingNav,
  filteredSpecialistNav, filteredFinanceNav, filteredEnvironmentalNav,
  filteredTradeLevyNav, filteredReportingNav, filteredDocumentsNav, filteredIntegrationsNav, filteredBottomNav, trialInfo,
}: {
  onNavClick?: () => void;
  onLogout: () => void;
  currentFarmName?: string;
  currentFarmRedTractorId?: string | null;
  filteredCoreNav: NavItem[];
  filteredPeopleNav: NavItem[];
  filteredFarmManagementNav: NavItem[];
  filteredLivestockNav: NavItem[];
  filteredBiosecurityNav: NavItem[];
  filteredComplianceNav: NavItem[];
  filteredOrganicFarmingNav: NavItem[];
  filteredSpecialistNav: NavItem[];
  filteredFinanceNav: NavItem[];
  filteredTradeLevyNav: NavItem[];
  filteredEnvironmentalNav: NavItem[];
  filteredReportingNav: NavItem[];
  filteredDocumentsNav: NavItem[];
  filteredIntegrationsNav: NavItem[];
  filteredBottomNav: NavItem[];
  trialInfo?: TrialInfo | null;
}) {
  const navRef = useRef<HTMLElement>(null);
  const [, setLocation] = useLocation();
  const { setFarmId } = useAppStore();
  const versionFull = useAppVersion();

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem("sidebar-nav-scroll");
    if (saved) el.scrollTop = parseInt(saved, 10);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const save = () => sessionStorage.setItem("sidebar-nav-scroll", String(el.scrollTop));
    el.addEventListener("scroll", save, { passive: true });
    return () => el.removeEventListener("scroll", save);
  }, []);

  return (
    <>
      <div className="flex-shrink-0 bg-white/[0.07] border-b border-white/[0.06]">
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-6 h-6 object-contain" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-white tracking-wide">BDE Farm Trac</h1>
          {currentFarmRedTractorId ? (
            <p className="text-[10px] text-sidebar-foreground/70 uppercase tracking-wider font-semibold">
              RT ID: {currentFarmRedTractorId}
            </p>
          ) : (
            <p className="text-[10px] text-sidebar-foreground/70 uppercase tracking-wider font-semibold">Red Tractor</p>
          )}
        </div>
      </div>

      <div className="px-3 py-2">
        <button
          className="w-full block"
          onClick={() => {
            setFarmId(null);
            setLocation("/select");
            onNavClick?.();
          }}
        >
          <div className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 cursor-pointer group">
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-white/50 font-medium group-hover:text-white/70 transition-colors">Switch Farm</span>
              <span className="text-sm font-semibold text-white">{currentFarmName || "Select Farm"}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-white/70 transition-colors" />
          </div>
        </button>
      </div>
      </div>

      <nav ref={navRef} className="flex-1 px-3 py-3 space-y-0 overflow-y-auto">
        <NavSection items={filteredCoreNav} onNavClick={onNavClick} />
        <NavSection title="People & Workforce" items={filteredPeopleNav} onNavClick={onNavClick} />
        <NavSection title="Farm Management" items={filteredFarmManagementNav} onNavClick={onNavClick} />
        <NavSection title="Livestock & Dairy" items={filteredLivestockNav} onNavClick={onNavClick} />
        <NavSection title="Biosecurity" items={filteredBiosecurityNav} onNavClick={onNavClick} />
        <NavSection title="Compliance & Safety" items={filteredComplianceNav} onNavClick={onNavClick} />
        <NavSection title="Organic Farming" items={filteredOrganicFarmingNav} onNavClick={onNavClick} />
        <NavSection title="Specialist Modules" items={filteredSpecialistNav} onNavClick={onNavClick} />
        <NavSection title="Finance & Commercial" items={filteredFinanceNav} onNavClick={onNavClick} />
        <NavSection title="Trade & Levy" items={filteredTradeLevyNav} onNavClick={onNavClick} />
        <NavSection title="Environmental" items={filteredEnvironmentalNav} onNavClick={onNavClick} />
        <NavSection title="Reporting" items={filteredReportingNav} onNavClick={onNavClick} />
        <NavSection title="Documents" items={filteredDocumentsNav} onNavClick={onNavClick} />
        <NavSection title="Integrations & API" items={filteredIntegrationsNav} onNavClick={onNavClick} />
      </nav>

      {trialInfo && (
        <div className="mx-3 mb-2 flex-shrink-0">
          <div className={cn(
            "rounded-xl px-4 py-3 border",
            trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 2
              ? "bg-red-500/15 border-red-500/30"
              : trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 7
              ? "bg-amber-500/15 border-amber-500/30"
              : "bg-emerald-500/10 border-emerald-500/20",
          )}>
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className={cn(
                "w-3.5 h-3.5 shrink-0",
                trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 2
                  ? "text-red-400"
                  : trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 7
                  ? "text-amber-400"
                  : "text-emerald-400",
              )} />
              <p className={cn(
                "text-xs font-semibold",
                trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 2
                  ? "text-red-400"
                  : trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 7
                  ? "text-amber-400"
                  : "text-emerald-400",
              )}>
                {trialInfo.daysRemaining === 0
                  ? "Trial expires today"
                  : trialInfo.daysRemaining === 1
                  ? "1 day left in trial"
                  : trialInfo.daysRemaining !== null
                  ? `${trialInfo.daysRemaining} days left in trial`
                  : "Free trial active"}
              </p>
            </div>
            <p className="text-[10px] text-white/45 mb-2.5 leading-relaxed">
              All modules unlocked. Subscribe before your trial ends to keep your records.
            </p>
            <Link href="/settings" onClick={onNavClick}>
              <div className={cn(
                "w-full text-xs font-semibold px-3 py-1.5 rounded-lg text-center transition-colors",
                trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 2
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : trialInfo.daysRemaining !== null && trialInfo.daysRemaining <= 7
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-primary/80 hover:bg-primary text-white",
              )}>
                Choose a Plan
              </div>
            </Link>
          </div>
        </div>
      )}

      <div className="flex-shrink-0 bg-white/[0.07] border-t border-white/[0.06]">
        <div className="p-3 space-y-0">
          {filteredBottomNav.map((item) => (
            <Link key={item.name} href={item.href} className="block" onClick={onNavClick}>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground/80 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-sm">
                <item.icon className="w-4 h-4 text-sidebar-foreground/50" />
                {item.name}
              </div>
            </Link>
          ))}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground/80 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer text-sm"
          >
            <LogOut className="w-4 h-4 opacity-50" />
            Sign Out
          </button>
          <p className="text-center text-[10px] text-white/25 pt-1 pb-0.5 select-none">
            v{versionFull}
          </p>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { farmId, clearState } = useAppStore();
  const { signOut } = useSafeClerk();
  const [, setLocation] = useLocation();
  const { role: userRole } = useUserRole();

  const { data: farmDetail } = useQuery<{ record: { id: number; name: string; cphNumber: string | null; redTractorId?: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: dashboardData } = useQuery<{
    farm: Record<string, unknown>;
    activeSubscriptions: Array<{ moduleKey: string; moduleName: string; status: string; currentPeriodEnd?: string | null }>;
  }>({
    queryKey: ["farm-dashboard", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dashboard`).then(r => r.json()),
    enabled: !!farmId,
    // Match the staleTime used by useVessels (winery/shared.tsx) so both
    // observers share the same freshness window and the sidebar never briefly
    // shows module links from a previous farm's stale cache entry.
    staleTime: 60_000,
  });

  const currentFarm = farmDetail?.record;

  const activeModuleKeys = useMemo(() => {
    const keys = new Set<string>();
    const subs = dashboardData?.activeSubscriptions;
    if (!Array.isArray(subs)) return keys;
    const nowMs = Date.now();
    for (const sub of subs) {
      const s = sub as { moduleKey?: string; status?: string; currentPeriodEnd?: string | null };
      if (!s.moduleKey) continue;
      // Only include subscriptions that are genuinely active or within a live
      // trial period.  The API pre-filters activeSubs, but bundled entries
      // injected server-side carry status:"active" unconditionally — this
      // client-side guard ensures the sidebar never uses a stale or
      // cancelled subscription to unlock a nav section.
      if (s.status === "active") { keys.add(s.moduleKey); continue; }
      if (s.status === "trial") {
        const end = s.currentPeriodEnd ? new Date(s.currentPeriodEnd).getTime() : Infinity;
        if (end > nowMs) keys.add(s.moduleKey);
      }
    }
    return keys;
  }, [dashboardData?.activeSubscriptions]);

  const farmSectors = useMemo((): FarmSectors => {
    const farm = dashboardData?.farm as Record<string, unknown> | undefined;
    if (!farm) return { hasLivestock: true };
    const hasLivestock = !!(farm.sectorBeef || farm.sectorDairy || farm.sectorPigs || farm.sectorPoultry);
    return { hasLivestock };
  }, [dashboardData?.farm]);

  const trialInfo = useMemo((): TrialInfo | null => {
    const subs = dashboardData?.activeSubscriptions;
    if (!Array.isArray(subs)) return null;
    const trialSubs = subs.filter((s) => s.status === "trial");
    if (trialSubs.length === 0) return null;
    const withEnd = trialSubs.filter((s) => s.currentPeriodEnd);
    if (withEnd.length === 0) return { daysRemaining: null, endsAt: null };
    const earliest = withEnd.reduce((a, b) =>
      new Date(a.currentPeriodEnd!).getTime() < new Date(b.currentPeriodEnd!).getTime() ? a : b,
    );
    const msRemaining = new Date(earliest.currentPeriodEnd!).getTime() - Date.now();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    return { daysRemaining, endsAt: earliest.currentPeriodEnd! };
  }, [dashboardData?.activeSubscriptions]);

  const filteredCoreNav = filterNavItems(coreNav, activeModuleKeys, farmSectors, userRole);
  const filteredPeopleNav = filterNavItems(peopleNav, activeModuleKeys, farmSectors, userRole);
  const filteredFarmManagementNav = filterNavItems(farmManagementNav, activeModuleKeys, farmSectors, userRole);
  const filteredLivestockNav = filterNavItems(livestockNav, activeModuleKeys, farmSectors, userRole);
  const filteredBiosecurityNav = filterNavItems(biosecurityNav, activeModuleKeys, farmSectors, userRole);
  const filteredComplianceNav = filterNavItems(complianceNav, activeModuleKeys, farmSectors, userRole);
  const filteredOrganicFarmingNav = filterNavItems(organicFarmingNav, activeModuleKeys, farmSectors, userRole);
  const filteredSpecialistNav = filterNavItems(specialistNav, activeModuleKeys, farmSectors, userRole);
  const filteredFinanceNav = filterNavItems(financeNav, activeModuleKeys, farmSectors, userRole);
  const filteredTradeLevyNav = filterNavItems(tradeLevyNav, activeModuleKeys, farmSectors, userRole);
  const filteredEnvironmentalNav = filterNavItems(environmentalNav, activeModuleKeys, farmSectors, userRole);
  const filteredReportingNav = filterNavItems(reportingNav, activeModuleKeys, farmSectors, userRole);
  const filteredDocumentsNav = filterNavItems(documentsNav, activeModuleKeys, farmSectors, userRole);
  const filteredIntegrationsNav = filterNavItems(integrationsNav, activeModuleKeys, farmSectors, userRole);
  const filteredBottomNav = filterNavItems(bottomNav, new Set(), { hasLivestock: true }, userRole);

  const handleLogout = () => {
    clearState();
    signOut(() => setLocation("/"));
  };

  const sidebarBaseClasses = "flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen";

  const innerProps = {
    onLogout: handleLogout,
    currentFarmName: currentFarm?.name,
    currentFarmRedTractorId: currentFarm?.redTractorId ?? null,
    filteredCoreNav,
    filteredPeopleNav,
    filteredFarmManagementNav,
    filteredLivestockNav,
    filteredBiosecurityNav,
    filteredComplianceNav,
    filteredOrganicFarmingNav,
    filteredSpecialistNav,
    filteredFinanceNav,
    filteredTradeLevyNav,
    filteredEnvironmentalNav,
    filteredReportingNav,
    filteredDocumentsNav,
    filteredIntegrationsNav,
    filteredBottomNav,
    trialInfo,
  };

  return (
    <>
      {/* Desktop sidebar — always visible, in normal document flow */}
      <div className={cn(sidebarBaseClasses, "hidden md:flex sticky top-0")}>
        <SidebarInner {...innerProps} />
      </div>

      {/* Mobile sidebar — fixed overlay, slides in/out. Always in DOM; visibility controlled only by transform */}
      <div className={cn(
        sidebarBaseClasses,
        "fixed inset-y-0 left-0 z-[60] transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarInner {...innerProps} onNavClick={onClose} />
      </div>
    </>
  );
}
