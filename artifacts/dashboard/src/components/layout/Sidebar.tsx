import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Sprout, 
  Tractor, 
  Droplets, 
  TestTube,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-app-store";
import { useListFarms, useGetFarmDashboard } from "@workspace/api-client-react/src/generated/api";
import { useMemo } from "react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleKeys?: string[];
  requiresLivestock?: boolean;
}

const coreNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Fields & Crops", href: "/fields", icon: Sprout, moduleKeys: ["field-crop-management"] },
  { name: "Spray Records", href: "/sprays", icon: Droplets, moduleKeys: ["sprays-inputs"] },
  { name: "Soil Tests", href: "/soil", icon: TestTube, moduleKeys: ["soil-management"] },
  { name: "Equipment", href: "/equipment", icon: Tractor, moduleKeys: ["equipment-management"] },
];

const complianceNav: NavItem[] = [
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck, moduleKeys: ["inspections"] },
  { name: "Risk & COSHH", href: "/risks", icon: ShieldAlert, moduleKeys: ["risk-waste"] },
  { name: "Waste", href: "/waste", icon: Trash2, moduleKeys: ["risk-waste"] },
];

const biosecurityNav: NavItem[] = [
  { name: "Visitor Log", href: "/visitors", icon: Users, moduleKeys: ["biosecurity"] },
  { name: "Pest Control", href: "/pest-control", icon: Bug, moduleKeys: ["biosecurity"] },
  { name: "Cleaning", href: "/cleaning", icon: ShieldCheck, moduleKeys: ["biosecurity"] },
];

const livestockNav: NavItem[] = [
  { name: "Herds & Animals", href: "/livestock", icon: HeartPulse, moduleKeys: ["livestock-management"], requiresLivestock: true },
  { name: "Movements", href: "/movements", icon: Truck, moduleKeys: ["livestock-management"], requiresLivestock: true },
  { name: "Medicine", href: "/medicine", icon: HeartPulse, moduleKeys: ["livestock-management"], requiresLivestock: true },
];

const otherNav: NavItem[] = [
  { name: "Training", href: "/training", icon: GraduationCap, moduleKeys: ["staff-training"] },
  { name: "Suppliers & Stock", href: "/stock", icon: Package, moduleKeys: ["stock-suppliers"] },
  { name: "Financial", href: "/financial", icon: PoundSterling, moduleKeys: ["financial-records"] },
  { name: "Environmental", href: "/environmental", icon: Leaf, moduleKeys: ["environmental"] },
  { name: "Haulage", href: "/haulage", icon: Truck, moduleKeys: ["haulage-transport"] },
  { name: "Documents", href: "/documents", icon: FileText, moduleKeys: ["document-management"] },
  { name: "Weather", href: "/weather", icon: CloudSun, moduleKeys: ["weather-tracking"] },
];

const bottomNav: NavItem[] = [
  { name: "Help Centre", href: "/help", icon: HelpCircle },
  { name: "Farm Settings", href: "/settings/farm", icon: MapPin },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface FarmSectors {
  hasLivestock: boolean;
}

function filterNavItems(items: NavItem[], activeModuleKeys: Set<string>, sectors: FarmSectors): NavItem[] {
  return items.filter((item) => {
    if (item.requiresLivestock && !sectors.hasLivestock) return false;
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

function SidebarInner({ onNavClick, onLogout, currentFarmName, filteredCoreNav, filteredComplianceNav, filteredBiosecurityNav, filteredLivestockNav, filteredOtherNav }: {
  onNavClick?: () => void;
  onLogout: () => void;
  currentFarmName?: string;
  filteredCoreNav: NavItem[];
  filteredComplianceNav: NavItem[];
  filteredBiosecurityNav: NavItem[];
  filteredLivestockNav: NavItem[];
  filteredOtherNav: NavItem[];
}) {
  return (
    <>
      <div className="p-5 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-6 h-6 object-contain" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-white tracking-wide">BDE Farm Trac</h1>
          <p className="text-[10px] text-sidebar-foreground/70 uppercase tracking-wider font-semibold">Red Tractor</p>
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

      <nav className="flex-1 px-3 py-3 space-y-0 overflow-y-auto">
        <NavSection items={filteredCoreNav} onNavClick={onNavClick} />
        <NavSection title="Compliance" items={filteredComplianceNav} onNavClick={onNavClick} />
        <NavSection title="Biosecurity" items={filteredBiosecurityNav} onNavClick={onNavClick} />
        <NavSection title="Livestock" items={filteredLivestockNav} onNavClick={onNavClick} />
        <NavSection title="Management" items={filteredOtherNav} onNavClick={onNavClick} />
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-0 flex-shrink-0">
        {bottomNav.map((item) => (
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
  const { data: farmsData } = useListFarms({ query: { enabled: true } });
  const { data: dashboardData } = useGetFarmDashboard(farmId ?? 0, { query: { enabled: !!farmId } });
  const currentFarm = farmsData?.farms?.find(f => f.id === farmId);

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

  const filteredCoreNav = subscriptionsLoaded ? filterNavItems(coreNav, activeModuleKeys, farmSectors) : coreNav;
  const filteredComplianceNav = subscriptionsLoaded ? filterNavItems(complianceNav, activeModuleKeys, farmSectors) : complianceNav;
  const filteredBiosecurityNav = subscriptionsLoaded ? filterNavItems(biosecurityNav, activeModuleKeys, farmSectors) : biosecurityNav;
  const filteredLivestockNav = subscriptionsLoaded ? filterNavItems(livestockNav, activeModuleKeys, farmSectors) : livestockNav;
  const filteredOtherNav = subscriptionsLoaded ? filterNavItems(otherNav, activeModuleKeys, farmSectors) : otherNav;

  const handleLogout = () => {
    clearState();
    window.location.href = "/api/logout";
  };

  const sidebarBaseClasses = "flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen";

  const innerProps = {
    onLogout: handleLogout,
    currentFarmName: currentFarm?.name,
    filteredCoreNav,
    filteredComplianceNav,
    filteredBiosecurityNav,
    filteredLivestockNav,
    filteredOtherNav,
  };

  return (
    <>
      {/* Desktop sidebar — always visible, in normal document flow */}
      <div className={cn(sidebarBaseClasses, "hidden md:flex sticky top-0")}>
        <SidebarInner {...innerProps} />
      </div>

      {/* Mobile sidebar — fixed overlay, slides in/out */}
      <div className={cn(
        sidebarBaseClasses,
        "flex md:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarInner {...innerProps} onNavClick={onClose} />
      </div>
    </>
  );
}
