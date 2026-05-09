import { createRoot } from "react-dom/client";
import App from "../../dashboard/src/App";
import "../../dashboard/src/index.css";
import { useAppStore } from "../../dashboard/src/hooks/use-app-store";

if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
  try {
    const TENANT_SLUG = "oakfield-farms";
    const FARM_ID = 1;

    const raw = localStorage.getItem("farmtrac-storage");
    const stored = raw ? JSON.parse(raw) : null;
    const currentTenant = stored?.state?.tenantSlug;

    if (!stored?.state?.farmId || currentTenant === "demo" || currentTenant !== TENANT_SLUG) {
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: TENANT_SLUG, farmId: FARM_ID }, version: 0 }),
      );
    }
    localStorage.setItem("farmtrac_tenantSlug", TENANT_SLUG);

    // Pre-populate Zustand store synchronously before React renders to avoid
    // the async rehydration race condition that causes "Invalid hook call" errors.
    // Zustand persist reads localStorage asynchronously (microtask); calling
    // setState here ensures farmId=1 is available on the very first render so
    // child tabs (WeighTab, etc.) are never rendered mid-rehydration.
    useAppStore.setState({ tenantSlug: TENANT_SLUG, farmId: FARM_ID });
  } catch {
  }
}

createRoot(document.getElementById("root")!).render(<App />);
