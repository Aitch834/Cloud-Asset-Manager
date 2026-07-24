import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { ArrowLeft, Menu } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery } from "@tanstack/react-query";
import { NotificationPanel } from "@/components/NotificationPanel";
import { useNavHistory } from "@/context/NavHistoryContext";
import { useLocation } from "wouter";
import { SandboxBanner } from "@/components/SandboxBanner";

export function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  const { farmId } = useAppStore();
  const { data: farmDetail } = useQuery<{ record: { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const farmName = farmDetail?.record?.name;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { registerTitle, goBack, backLabel } = useNavHistory();

  // Register this page's title keyed by its own path so the context can
  // match the right stack entry regardless of effect firing order.
  useEffect(() => {
    if (title) registerTitle(title, location);
  }, [title, location, registerTitle]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <SandboxBanner />
        <header className="h-20 flex items-center justify-between px-8 bg-background border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-black/5 cursor-pointer"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              {/* Subtle back button — only visible when there is somewhere to return to */}
              {backLabel && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors bg-muted/40 hover:bg-muted px-2.5 py-1.5 rounded-full border border-border/60 shrink-0"
                  title={`Back to ${backLabel}`}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span className="hidden sm:inline">{backLabel}</span>
                </button>
              )}

              <div>
                {title && <h2 className="text-2xl font-display font-bold text-foreground leading-tight">{title}</h2>}
                {farmName && (
                  <p className="text-sm text-muted-foreground -mt-0.5">{farmName}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationPanel />
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
              JD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
