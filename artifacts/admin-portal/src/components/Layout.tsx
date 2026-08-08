import { Link, useLocation } from "wouter";
import { clearSecret } from "@/lib/auth";
import { LayoutDashboard, Users, MessageSquare, LogOut, ShieldCheck, Database, Mail, TrendingUp, FileText, Gift, Settings2, List, BookOpen, Building2, FileSignature, Tag, Megaphone } from "lucide-react";

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
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  function handleLogout() {
    clearSecret();
    window.location.reload();
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
              <Link key={href} href={href}>
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
              </Link>
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
