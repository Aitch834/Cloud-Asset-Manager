import { useLocation } from "wouter";
import { clearSecret } from "@/lib/auth";
import { checkNavGuard, setNavGuard } from "@/lib/nav-guard";
import { LayoutDashboard, Users, MessageSquare, LogOut, ShieldCheck, Database, Mail, TrendingUp, FileText, Gift, Settings2, List, BookOpen, Building2, FileSignature, Tag, Megaphone, Bird, AlertTriangle, CheckSquare } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/leads", label: "Leads Pipeline", icon: TrendingUp },
  { href: "/referrals", label: "Referrals", icon: Gift },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/company-settings", label: "Company & Billing", icon: Building2 },
  { href: "/support", label: "Support Tickets", icon: MessageSquare },
  { href: "/email", label: "Email", icon: Mail },
  { href: "/database", label: "SQL Console", icon: Database },
  { href: "/lookups", label: "Lookup Lists", icon: List },
  { href: "/help-articles", label: "Help Centre", icon: BookOpen },
  { href: "/nda", label: "NDA Template", icon: FileSignature },
  { href: "/version", label: "Version Management", icon: Tag },
  { href: "/ad-pdf", label: "Ad PDF Generator", icon: Megaphone },
  { href: "/platform-config", label: "Platform Config", icon: Settings2 },
  { href: "/sector-alerts", label: "Sector Alerts", icon: AlertTriangle },
  { href: "/hpai-alert-log", label: "Sector Alert Log", icon: Bird },
  { href: "/alert-subscriptions", label: "Alert Subscriptions", icon: CheckSquare },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();

  function handleLogout() {
    // Check any active navigation guard (e.g. unsaved preset edit) before
    // clearing credentials. If the user cancels, abort the logout entirely.
    if (!checkNavGuard()) return;
    // Guard confirmed — clear it immediately so the page reload doesn't
    // re-trigger the beforeunload prompt a second time.
    setNavGuard(null);
    clearSecret();
    window.location.reload();
  }

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    // Let ctrl/cmd/shift+click and middle-click open in a new tab/window as normal.
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    // Let any registered page guard confirm before navigating away.
    if (!checkNavGuard()) return;
    // Clear the guard before the route change so an approved navigation cannot
    // trigger a second prompt through a subsequent unload or route event.
    setNavGuard(null);
    navigate(href);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-60 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-sidebar-primary" />
            <div>
              <p className="font-bold text-sm text-sidebar-accent-foreground">BDE Admin</p>
              <p className="text-xs text-sidebar-foreground/60">Management Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <a key={href} href={href} onClick={(e) => handleNavClick(e, href)}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </div>
              </a>
            );
          })}
        </nav>

        <div className="px-2 pb-4 border-t border-sidebar-border pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
