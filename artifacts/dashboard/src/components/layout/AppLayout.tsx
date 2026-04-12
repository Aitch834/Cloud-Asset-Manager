import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { useAppStore } from "@/hooks/use-app-store";
import { useQuery } from "@tanstack/react-query";
import { NotificationPanel } from "@/components/NotificationPanel";

export function AppLayout({ children, title }: { children: ReactNode, title?: string }) {
  const { farmId } = useAppStore();
  const { data: farmDetail } = useQuery<{ record: { id: number; name: string; cphNumber: string | null } }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const farmName = farmDetail?.record?.name;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sidebar backdrop — sits below the header so the hamburger stays clickable */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-8 bg-background border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-black/5 cursor-pointer"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              {title && <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>}
              {farmName && (
                <p className="text-sm text-muted-foreground -mt-0.5">{farmName}</p>
              )}
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
