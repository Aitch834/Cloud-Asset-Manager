import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Detect server restarts via the startup token endpoint.
// When Vite restarts it generates a new session token → new URL paths →
// proxy cache miss → fresh modules. The client detects the token change
// and reloads so it fetches all modules under the new session URLs.
let storedToken: string | null = null;
async function checkStartupToken() {
  try {
    const base = import.meta.env.BASE_URL ?? "/";
    const res = await fetch(`${base}__startup_token__`, { cache: "no-store" });
    if (!res.ok) return;
    const { token } = await res.json();
    if (storedToken === null) {
      storedToken = token;
    } else if (storedToken !== token) {
      window.location.reload();
    }
  } catch {
    // ignore network errors
  }
}

if (import.meta.hot) {
  import.meta.hot.on("vite:ws:connect", () => {
    checkStartupToken();
  });
}

checkStartupToken();

createRoot(document.getElementById("root")!).render(<App />);
