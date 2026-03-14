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
import { useListFarms } from "@workspace/api-client-react/src/generated/api";

const coreNav = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Fields & Crops", href: "/fields", icon: Sprout },
  { name: "Spray Records", href: "/sprays", icon: Droplets },
  { name: "Soil Tests", href: "/soil", icon: TestTube },
  { name: "Equipment", href: "/equipment", icon: Tractor },
];

const complianceNav = [
  { name: "Inspections", href: "/inspections", icon: ClipboardCheck },
  { name: "Risk & COSHH", href: "/risks", icon: ShieldAlert },
  { name: "Waste", href: "/waste", icon: Trash2 },
];

const biosecurityNav = [
  { name: "Visitor Log", href: "/visitors", icon: Users },
  { name: "Pest Control", href: "/pest-control", icon: Bug },
  { name: "Cleaning", href: "/cleaning", icon: ShieldCheck },
];

const livestockNav = [
  { name: "Herds & Animals", href: "/livestock", icon: HeartPulse },
  { name: "Movements", href: "/movements", icon: Truck },
  { name: "Medicine", href: "/medicine", icon: HeartPulse },
];

const otherNav = [
  { name: "Training", href: "/training", icon: GraduationCap },
  { name: "Suppliers & Stock", href: "/stock", icon: Package },
  { name: "Financial", href: "/financial", icon: PoundSterling },
  { name: "Environmental", href: "/environmental", icon: Leaf },
  { name: "Haulage", href: "/haulage", icon: Truck },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Weather", href: "/weather", icon: CloudSun },
];

const bottomNav = [
  { name: "Help Centre", href: "/help", icon: HelpCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

function NavSection({ title, items }: { title?: string; items: typeof coreNav }) {
  const [location] = useLocation();
  return (
    <div className="mb-2">
      {title && <p className="px-4 mb-1 text-[10px] uppercase tracking-widest font-bold text-white/30">{title}</p>}
      {items.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.name} href={item.href} className="block">
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

export function Sidebar() {
  const { farmId, clearState } = useAppStore();
  const { data: farmsData } = useListFarms({ query: { enabled: true } });
  const currentFarm = farmsData?.farms?.find(f => f.id === farmId);

  const handleLogout = () => {
    clearState();
    window.location.href = "/api/logout";
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0">
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <img src={`${import.meta.env.BASE_URL}images/logo-icon.png`} alt="Logo" className="w-6 h-6 object-contain" />
        </div>
        <div>
          <h1 className="text-lg font-display font-bold text-white tracking-wide">BDE Farm Trac</h1>
          <p className="text-[10px] text-sidebar-foreground/70 uppercase tracking-wider font-semibold">Red Tractor</p>
        </div>
      </div>

      <div className="px-3 py-2">
        <Link href="/select" className="block">
          <div className="w-full flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 cursor-pointer">
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-white/50 font-medium">Current Farm</span>
              <span className="text-sm font-semibold text-white">{currentFarm?.name || "Select Farm"}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-white/50" />
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0 overflow-y-auto">
        <NavSection items={coreNav} />
        <NavSection title="Compliance" items={complianceNav} />
        <NavSection title="Biosecurity" items={biosecurityNav} />
        <NavSection title="Livestock" items={livestockNav} />
        <NavSection title="Management" items={otherNav} />
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-0">
        {bottomNav.map((item) => (
          <Link key={item.name} href={item.href} className="block">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground/80 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-sm">
              <item.icon className="w-4 h-4 text-sidebar-foreground/50" />
              {item.name}
            </div>
          </Link>
        ))}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sidebar-foreground/80 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer text-sm"
        >
          <LogOut className="w-4 h-4 opacity-50" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
