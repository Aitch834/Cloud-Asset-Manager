import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
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
  BookOpen,
  TrendingUp,
  ClipboardList,
  Layers,
  Stethoscope,
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
  { name: "Week Ahead", href: "/week-ahead", icon: CalendarDays },
  { name: "Task Board", href: "/task-board", icon: ClipboardList },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Training", href: "/training", icon: GraduationCap },
  { name: "Fields & Crops", href: "/fields", icon: Sprout, moduleKeys: ["field-crop-management"] },
  { name: "Harvest Records", href: "/harvest", icon: Wheat, moduleKeys: ["field-crop-management"] },
  { name: "Field Operations", href: "/field-operations", icon: Shovel, moduleKeys: ["field-crop-management"] },
  { name: "Field Inspections", href: "/field-inspections", icon: ClipboardCheck, moduleKeys: ["field-crop-management"] },
  { name: "Storage Locations", href: "/storage-locations", icon: Warehouse, moduleKeys: ["field-crop-management"] },
  { name: "Crop Stock", href: "/crop-stock", icon: Layers, moduleKeys: ["field-crop-management"] },
  { name: "Crop Trials", href: "/crop-trials", icon: FlaskConical, moduleKeys: ["field-crop-management"] },
  { name: "Spray Records", href: "/sprays", icon: Droplets, moduleKeys: ["sprays-inputs"] },
  { name: "NMP", href: "/nmp", icon: Leaf, moduleKeys: ["sprays-inputs"] },
  { name: "NVZ Compliance", href: "/nvz", icon: FlaskConical, moduleKeys: ["sprays-inputs"] },
  { name: "Soil Tests", href: "/soil", icon: TestTube, moduleKeys: ["soil-management"] },
  { name: "Equipment", href: "/equipment", icon: Tractor, moduleKeys: ["equipment-management"] },
  { name: "Workshop", href: "/workshop", icon: Wrench, moduleKeys: ["workshop-management"] },
];

const complianceNav: NavItem[] = [
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck, moduleKeys: ["inspections"] },
  { name: "Health, Safety & Risk", href: "/risks", icon: ShieldAlert, moduleKeys: ["risk-waste"] },
  { name: "Waste", href: "/waste", icon: Trash2, moduleKeys: ["risk-waste"] },
  { name: "Fly-Tipping", href: "/fly-tipping", icon: AlertTriangle, moduleKeys: ["risk-waste"] },
  { name: "Encampments", href: "/encampments", icon: AlertTriangle, moduleKeys: ["risk-waste"] },
  { name: "Accident Book", href: "/accident-book", icon: BookOpen, moduleKeys: ["risk-waste"] },
  { name: "Insurance", href: "/insurance", icon: ShieldCheck },
];

const biosecurityNav: NavItem[] = [
  { name: "Farm Map", href: "/farm-map", icon: Map, moduleKeys: ["biosecurity"] },
  { name: "Farm Locations", href: "/farm-locations", icon: MapPin, moduleKeys: ["biosecurity"] },
  { name: "Visitor Log", href: "/visitors", icon: Users, moduleKeys: ["biosecurity"] },
  { name: "Pest Control", href: "/pest-control", icon: Bug, moduleKeys: ["biosecurity"] },
  { name: "Cleaning", href: "/cleaning", icon: ShieldCheck, moduleKeys: ["biosecurity"] },
  { name: "COSHH Assessments", href: "/coshh", icon: ShieldAlert, moduleKeys: ["biosecurity"] },
  { name: "Compliance & Plans", href: "/compliance", icon: FileText, moduleKeys: ["biosecurity"] },
  { name: "Organic Compliance", href: "/organic", icon: Leaf, moduleKeys: ["organic-compliance"] },
];

const livestockNav: NavItem[] = [
  { name: "Herds & Animals", href: "/livestock", icon: HeartPulse, moduleKeys: ["livestock-management"], requiresLivestock: true },
  { name: "Movements", href: "/movements", icon: Truck, moduleKeys: ["livestock-management"], requiresLivestock: true },
  { name: "Medicine", href: "/medicine", icon: HeartPulse, moduleKeys: ["livestock-management"], requiresLivestock: true },
  { name: "Herd Health Register", href: "/herd-health-register", icon: ClipboardList, moduleKeys: ["livestock-management"], requiresLivestock: true },
  { name: "Health Dashboard", href: "/livestock-health", icon: BarChart3, moduleKeys: ["livestock-management"], requiresLivestock: true },
  { name: "Dairy Records", href: "/dairy", icon: Milk, moduleKeys: ["dairy-management"], requiresLivestock: true },
  { name: "Feed Management", href: "/feed", icon: Package, moduleKeys: ["feed-management"] },
  { name: "Vet Ledger", href: "/vet-ledger", icon: Stethoscope, moduleKeys: ["livestock-management"], requiresLivestock: true },
];

const biofuelNav: NavItem[] = [
  { name: "Biofuel / RTFO", href: "/biofuel", icon: Fuel, moduleKeys: ["biofuel-rtfo"] },
  { name: "Fuel & Energy", href: "/fuel-energy", icon: Fuel, moduleKeys: ["fuel-energy"] },
];

const specialistNav: NavItem[] = [
  { name: "Pig Production", href: "/pig-production", icon: PiggyBank, moduleKeys: ["pig-production"] },
  { name: "Poultry Production", href: "/poultry-production", icon: Bird, moduleKeys: ["poultry-production"] },
  { name: "Horticulture", href: "/horticulture", icon: TreePine, moduleKeys: ["horticulture"] },
  { name: "Carbon & Sustainability", href: "/carbon", icon: Recycle, moduleKeys: ["carbon-sustainability"] },
  { name: "Farm Diversification", href: "/diversification", icon: Building2, moduleKeys: ["farm-diversification"] },
  { name: "Water & Irrigation", href: "/water-irrigation", icon: Waves, moduleKeys: ["water-irrigation"] },
];

const otherNav: NavItem[] = [
  { name: "Trade Contacts & Stock", href: "/stock", icon: Package, moduleKeys: ["stock-suppliers"] },
  { name: "Farm Services", href: "/farm-services", icon: Building2 },
  { name: "Grants & Funding", href: "/grants", icon: Landmark },
  { name: "Financial", href: "/financial", icon: PoundSterling, moduleKeys: ["financial-records"], minRole: "manager" },
  { name: "Sales & Trading", href: "/sales-trading", icon: TrendingUp, moduleKeys: ["financial-records"], minRole: "manager" },
  { name: "Trade History", href: "/trade-history", icon: BarChart3, moduleKeys: ["financial-records"], minRole: "manager" },
  { name: "Business Reports", href: "/business-reports", icon: BarChart3, moduleKeys: ["business-reports"], minRole: "manager" },
  { name: "Environmental", href: "/environmental", icon: Leaf, moduleKeys: ["environmental"] },
  { name: "Haulage", href: "/haulage", icon: Truck, moduleKeys: ["haulage-transport"] },
  { name: "Documents", href: "/documents", icon: FileText, moduleKeys: ["document-management"] },
  { name: "Weather", href: "/weather", icon: CloudSun, moduleKeys: ["weather-tracking"] },
  { name: "Season Reports", href: "/season-reports", icon: FileBarChart2, moduleKeys: ["field-crop-management", "livestock-management"] },
  { name: "Harvest Dashboard", href: "/harvest-dashboard", icon: BarChart3, moduleKeys: ["field-crop-management"] },
  { name: "NVZ Status Board", href: "/nvz-dashboard", icon: Gauge, moduleKeys: ["sprays-inputs"] },
  { name: "Soil Health", href: "/soil-dashboard", icon: FlaskConical, moduleKeys: ["soil-management"] },
  { name: "Fleet Status", href: "/fleet-dashboard", icon: Wrench, moduleKeys: ["equipment-management"] },
];

const ROLE_RANK: Record<FarmRole, number> = { operator: 0, senior: 1, manager: 2, owner: 3 };

const bottomNav: NavItem[] = [
  { name: "Help Centre", href: "/help", icon: HelpCircle },
  { name: "Support", href: "/support", icon: LifeBuoy },
  { name: "Farm Settings", href: "/settings/farm", icon: MapPin, minRole: "manager" },
  { name: "Account & Notifications", href: "/account", icon: Smartphone },
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

function SidebarInner({ onNavClick, onLogout, currentFarmName, currentFarmRedTractorId, filteredCoreNav, filteredComplianceNav, filteredBiosecurityNav, filteredLivestockNav, filteredBiofuelNav, filteredSpecialistNav, filteredOtherNav, filteredBottomNav }: {
  onNavClick?: () => void;
  onLogout: () => void;
  currentFarmName?: string;
  currentFarmRedTractorId?: string | null;
  filteredCoreNav: NavItem[];
  filteredComplianceNav: NavItem[];
  filteredBiosecurityNav: NavItem[];
  filteredLivestockNav: NavItem[];
  filteredBiofuelNav: NavItem[];
  filteredSpecialistNav: NavItem[];
  filteredOtherNav: NavItem[];
  filteredBottomNav: NavItem[];
}) {
  const navRef = useRef<HTMLElement>(null);

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
      <div className="p-5 flex items-center gap-3 flex-shrink-0">
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

      <div className="px-3 py-2 flex-shrink-0">
        <Link href="/select" className="block" onClick={onNavClick}>
          <div className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 cursor-pointer">
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-white/50 font-medium">Current Farm</span>
              <span className="text-sm font-semibold text-white">{currentFarmName || "Select Farm"}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-white/50" />
          </div>
        </Link>
      </div>

      <nav ref={navRef} className="flex-1 px-3 py-3 space-y-0 overflow-y-auto">
        <NavSection items={filteredCoreNav} onNavClick={onNavClick} />
        <NavSection title="Compliance" items={filteredComplianceNav} onNavClick={onNavClick} />
        <NavSection title="Biosecurity" items={filteredBiosecurityNav} onNavClick={onNavClick} />
        <NavSection title="Livestock" items={filteredLivestockNav} onNavClick={onNavClick} />
        <NavSection title="Fuel & Energy" items={filteredBiofuelNav} onNavClick={onNavClick} />
        <NavSection title="Specialist Modules" items={filteredSpecialistNav} onNavClick={onNavClick} />
        <NavSection title="Management" items={filteredOtherNav} onNavClick={onNavClick} />
      </nav>

      <div className="mx-3 my-1 flex-shrink-0">
        <div className="h-px bg-white/10 rounded-full" />
      </div>

      <div className="p-3 space-y-0 flex-shrink-0">
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
      </div>
    </>
  );
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { farmId, clearState } = useAppStore();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const { role: userRole } = useUserRole();

  const { data: farmDetail } = useQuery<{ record: { id: number; name: string; cphNumber: string | null; redTractorId?: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: dashboardData } = useQuery<{
    farm: Record<string, unknown>;
    activeSubscriptions: Array<{ moduleKey: string; moduleName: string; status: string }>;
  }>({
    queryKey: ["farm-dashboard", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dashboard`).then(r => r.json()),
    enabled: !!farmId,
  });

  const currentFarm = farmDetail?.record;

  const subscriptionsLoaded = !!dashboardData;

  const activeModuleKeys = useMemo(() => {
    const keys = new Set<string>();
    const subs = dashboardData?.activeSubscriptions;
    if (Array.isArray(subs)) {
      for (const sub of subs) {
        const s = sub as { moduleName?: string; moduleKey?: string; status?: string };
        if (s.moduleKey) keys.add(s.moduleKey);
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

  const filteredCoreNav = subscriptionsLoaded ? filterNavItems(coreNav, activeModuleKeys, farmSectors, userRole) : coreNav;
  const filteredComplianceNav = subscriptionsLoaded ? filterNavItems(complianceNav, activeModuleKeys, farmSectors, userRole) : complianceNav;
  const filteredBiosecurityNav = subscriptionsLoaded ? filterNavItems(biosecurityNav, activeModuleKeys, farmSectors, userRole) : biosecurityNav;
  const filteredLivestockNav = subscriptionsLoaded ? filterNavItems(livestockNav, activeModuleKeys, farmSectors, userRole) : livestockNav;
  const filteredBiofuelNav = filterNavItems(biofuelNav, activeModuleKeys, farmSectors, userRole);
  const filteredSpecialistNav = subscriptionsLoaded ? filterNavItems(specialistNav, activeModuleKeys, farmSectors, userRole) : [];
  const filteredOtherNav = subscriptionsLoaded ? filterNavItems(otherNav, activeModuleKeys, farmSectors, userRole) : otherNav;
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
    filteredComplianceNav,
    filteredBiosecurityNav,
    filteredLivestockNav,
    filteredBiofuelNav,
    filteredSpecialistNav,
    filteredOtherNav,
    filteredBottomNav,
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
