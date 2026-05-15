import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

interface HistoryEntry {
  path: string;
  title: string;
}

interface NavHistoryContextType {
  registerTitle: (title: string) => void;
  goBack: () => void;
  backLabel: string | null;
}

const NavHistoryContext = createContext<NavHistoryContextType>({
  registerTitle: () => {},
  goBack: () => {},
  backLabel: null,
});

// Friendly names for paths that might appear before a title is registered
function friendlyPath(path: string): string {
  const MAP: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/documents": "Documents",
    "/training": "Staff & Training",
    "/staff": "Staff",
    "/insurance": "Insurance",
    "/compliance": "Red Tractor",
    "/risks": "Safety & Risk",
    "/equipment": "Equipment",
    "/fields": "Fields",
    "/sprays": "Sprays & Inputs",
    "/livestock": "Livestock",
    "/movements": "Movements",
    "/medicine": "Medicines",
    "/soil": "Soil Management",
    "/nmp": "NMP",
    "/nvz": "NVZ",
    "/harvest": "Harvest",
    "/storage-locations": "Storage",
    "/financial": "Financial",
    "/grants": "Grants",
    "/sfi": "SFI",
    "/organic": "Organic",
    "/carbon": "Carbon",
    "/waste": "Waste",
    "/pest-control": "Pest Control",
    "/coshh": "COSHH",
    "/cleaning": "Cleaning",
    "/contractors": "Contractors",
    "/visitors": "Visitors",
    "/accident-book": "Accident Book",
    "/task-board": "Task Board",
    "/week-ahead": "Week Ahead",
    "/settings": "Settings",
  };
  const base = "/" + path.replace(/^\//, "").split(/[/?]/)[0];
  const fromMap = MAP[base];
  if (fromMap) return fromMap;
  const humanised = base.slice(1).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return humanised || "Previous Page";
}

export function NavHistoryProvider({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [stack, setStack] = useState<HistoryEntry[]>([]);
  const goingBack = useRef(false);

  useEffect(() => {
    if (goingBack.current) {
      goingBack.current = false;
      return;
    }
    // Skip the root path — it's always a transient redirect, never a real page
    if (location === "/") return;
    setStack((prev) => {
      const last = prev[prev.length - 1];
      // Same path — no new entry (handles StrictMode double-fires etc.)
      if (last?.path === location) return prev;
      // Push new entry; keep max 20 entries
      return [...prev.slice(-19), { path: location, title: "" }];
    });
  }, [location]);

  const registerTitle = useCallback((title: string) => {
    if (!title) return;
    setStack((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.title === title) return prev;
      return [...prev.slice(0, -1), { ...last, title }];
    });
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => {
      if (prev.length < 2) return prev;
      const target = prev[prev.length - 2];
      goingBack.current = true;
      navigate(target.path);
      return prev.slice(0, -1);
    });
  }, [navigate]);

  // The label to show on the back button — the previous entry's title,
  // falling back to a friendly version of its path
  const backEntry = stack.length >= 2 ? stack[stack.length - 2] : null;
  const backLabel = backEntry
    ? backEntry.title || friendlyPath(backEntry.path)
    : null;

  return (
    <NavHistoryContext.Provider value={{ registerTitle, goBack, backLabel }}>
      {children}
    </NavHistoryContext.Provider>
  );
}

export function useNavHistory() {
  return useContext(NavHistoryContext);
}
