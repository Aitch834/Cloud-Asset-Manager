import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Strip the session routing prefix /@v/TOKEN/ from the URL before mounting.
// The Vite plugin bounces /dashboard/ → /dashboard/@v/TOKEN/ to guarantee a
// proxy cache miss on the HTML. Once the fresh HTML loads, we clean up the URL
// so wouter sees the canonical /dashboard/... path and routes correctly.
const base = import.meta.env.BASE_URL ?? "/dashboard/";
const vPfx = window.location.pathname.match(
  /^(\/[^/]+\/?)@v\/[^/]+\/(.*)/,
);
if (vPfx) {
  const restored = vPfx[1] + (vPfx[2] || "");
  window.history.replaceState(
    null,
    "",
    restored + window.location.search + window.location.hash,
  );
}

// Detect server restarts: reload if the session token changed so we fetch
// all modules under the new session URLs (proxy cache miss).
let storedToken: string | null = null;
async function checkStartupToken() {
  try {
    const t5 = Math.floor(Date.now() / 5000);
    const res = await fetch(`${base}__startup_token__/${t5}/`, {
      cache: "no-store",
    });
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
