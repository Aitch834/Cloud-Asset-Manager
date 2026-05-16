import { createContext, useCallback, useContext, useEffect, useRef, useState, useMemo } from "react";
import { useLocation } from "wouter";

interface HistoryEntry {
  path: string;
  title: string;
}

interface NavHistoryContextType {
  registerTitle: (title: string, path: string) => void;
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
    "/dashboard": "Overview",
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
  // Mirror stack in a ref so goBack can read it outside of setStack
  const stackRef = useRef<HistoryEntry[]>([]);
  useEffect(() => { stackRef.current = stack; }, [stack]);

  useEffect(() => {
    if (goingBack.current) {
      goingBack.current = false;
      return;
    }
    // Skip the root path — it's always a transient redirect, never a real page
    if (location === "/") return;
    setStack((prev) => {
      const last = prev[prev.length - 1];
      // If registerTitle already added this path (fired before us), don't duplicate
      if (last?.path === location) return prev;
      return [...prev.slice(-19), { path: location, title: "" }];
    });
  }, [location]);

  /**
   * Called by AppLayout to associate a human title with its path.
   *
   * We pass both title AND the page's own current path so this function can
   * find the correct stack entry by path — avoiding the race condition where
   * this fires before the location effect has pushed the new entry (React fires
   * child effects before parent effects).
   */
  const registerTitle = useCallback((title: string, path: string) => {
    if (!title || !path) return;
    setStack((prev) => {
      // Find the most recent entry for this path and update it
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].path === path) {
          if (prev[i].title === title) return prev; // already correct
          const next = [...prev];
          next[i] = { ...next[i], title };
          return next;
        }
      }
      // Path not yet in stack — registerTitle fired before the location effect.
      // Insert it now; the location effect will see it's already there and skip.
      if (path === "/") return prev; // never add the root redirect path
      return [...prev.slice(-19), { path, title }];
    });
  }, []);

  const goBack = useCallback(() => {
    const current = stackRef.current;
    if (current.length < 2) return;
    const target = current[current.length - 2];
    goingBack.current = true;
    // Update state and navigate separately — calling navigate() inside a
    // setStack updater causes "setState during render" errors in React.
    setStack(current.slice(0, -1));
    navigate(target.path);
  }, [navigate]);

  // The label for the back button is the previous entry's title,
  // falling back to a friendly version of its path if the title hasn't been
  // registered yet.
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
