import { createRoot } from "react-dom/client";
import App from "../../dashboard/src/App";
import "../../dashboard/src/index.css";
import { useAppStore } from "../../dashboard/src/hooks/use-app-store";

// Detect Vite dev-server restarts that changed the dep-bundle browserHash.
// On restart the browser reconnects via HMR but KEEPS its JS module graph,
// so old-hash chunks (react.js?v=A) coexist with newly-loaded new-hash chunks
// (react.js?v=B) → two React instances → "Invalid hook call" on any tab.
// Fetching /__td_startup_token__ on every vite:ws:connect event lets us detect
// the restart and force a full page reload before any navigation happens,
// ensuring all modules are loaded with the same consistent browserHash.
if (import.meta.hot) {
  const TOKEN_KEY = "__td_startup_token__";
  const checkServerToken = async () => {
    try {
      const base = import.meta.env.BASE_URL;
      const r = await fetch(`${base}__td_startup_token__`);
      if (!r.ok) return;
      const { token } = (await r.json()) as { token: string };
      const stored = sessionStorage.getItem(TOKEN_KEY);
      if (stored === null) {
        sessionStorage.setItem(TOKEN_KEY, token);
      } else if (stored !== token) {
        sessionStorage.setItem(TOKEN_KEY, token);
        location.reload();
      }
    } catch {
      // Server not ready or non-dev environment — ignore silently.
    }
  };
  checkServerToken();
  import.meta.hot.on("vite:ws:connect", checkServerToken);
}

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
