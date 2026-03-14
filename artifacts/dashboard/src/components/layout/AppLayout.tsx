import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, Bell } from "lucide-react";

export function AppLayout({ children, title }: { children: ReactNode, title: string }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded-lg hover:bg-black/5">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-full bg-white border border-border shadow-sm hover:shadow-md transition-all text-foreground/70 relative">
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
              JD
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
