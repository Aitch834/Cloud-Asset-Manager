import { createRoot } from "react-dom/client";
import App from "../../dashboard/src/App";
import "../../dashboard/src/index.css";

if (import.meta.env.VITE_DEV_BYPASS_AUTH === "true") {
  try {
    const raw = localStorage.getItem("farmtrac-storage");
    const stored = raw ? JSON.parse(raw) : null;
    if (!stored?.state?.farmId) {
      localStorage.setItem(
        "farmtrac-storage",
        JSON.stringify({ state: { tenantSlug: "demo", farmId: 1 }, version: 0 }),
      );
    }
  } catch {
  }
}

createRoot(document.getElementById("root")!).render(<App />);
