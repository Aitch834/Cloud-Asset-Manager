import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

// Helper: resolve a package inside test-dashboard's own node_modules.
// Any package that (a) is imported by dashboard source files, and (b) uses
// React hooks or React context internally, must be aliased here.  Without
// an explicit alias Vite resolves the import from dashboard/node_modules,
// which carries a separate React instance and triggers "Invalid hook call".
const td = (pkg: string) =>
  path.resolve(import.meta.dirname, "node_modules", pkg);

export default defineConfig({
  base: basePath,
  plugins: [
    react({
      include: [
        path.resolve(import.meta.dirname, "src") + "/**/*.{tsx,ts,jsx,js}",
        path.resolve(import.meta.dirname, "../dashboard/src") + "/**/*.{tsx,ts,jsx,js}",
        path.resolve(import.meta.dirname, "index.html"),
      ],
    }),
    tailwindcss(),
    runtimeErrorOverlay(),
    // NOTE: cartographer plugin intentionally omitted for test-dashboard.
    // The cartographer adds data-replit-metadata to JSX elements (including
    // React.Fragment), which corrupts React's hook dispatcher in large
    // components like CompliancePage, causing "Invalid hook call" errors.
    // The test-dashboard is a dev testing tool and does not need visual editing.
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    // Array form is required because some entries are objects (not just strings).
    //
    // RULE: every package that dashboard source files import AND that calls
    // React hooks / uses React context internally must appear in this alias
    // list, pointing to test-dashboard's own node_modules copy.  If it
    // resolves from dashboard/node_modules instead it gets a separate React
    // instance, causing "Invalid hook call" at runtime.
    alias: [
      // ── Core path aliases ────────────────────────────────────────────────
      { find: "@", replacement: path.resolve(import.meta.dirname, "../dashboard/src") },
      { find: "@assets", replacement: path.resolve(import.meta.dirname, "..", "..", "attached_assets") },

      // ── React (single instance) ──────────────────────────────────────────
      // Sub-paths must come before the bare "react" entry so Vite matches
      // the more-specific pattern first.
      { find: "react/jsx-runtime",     replacement: td("react/jsx-runtime.js") },
      { find: "react/jsx-dev-runtime", replacement: td("react/jsx-dev-runtime.js") },
      { find: "react-dom/client",      replacement: td("react-dom/client.js") },
      { find: "react-dom",             replacement: td("react-dom") },
      { find: "react",                 replacement: td("react") },

      // ── Radix UI (each top-level package present in test-dashboard's node_modules)
      // Only the packages that exist as top-level entries are aliased.
      // Internal transitive packages (react-primitive, react-id, etc.) are
      // resolved by pnpm's hoisting from the canonical workspace store and
      // do NOT need explicit aliases.
      { find: "@radix-ui/react-accordion",       replacement: td("@radix-ui/react-accordion") },
      { find: "@radix-ui/react-alert-dialog",    replacement: td("@radix-ui/react-alert-dialog") },
      { find: "@radix-ui/react-aspect-ratio",    replacement: td("@radix-ui/react-aspect-ratio") },
      { find: "@radix-ui/react-avatar",          replacement: td("@radix-ui/react-avatar") },
      { find: "@radix-ui/react-checkbox",        replacement: td("@radix-ui/react-checkbox") },
      { find: "@radix-ui/react-collapsible",     replacement: td("@radix-ui/react-collapsible") },
      { find: "@radix-ui/react-context-menu",    replacement: td("@radix-ui/react-context-menu") },
      { find: "@radix-ui/react-dialog",          replacement: td("@radix-ui/react-dialog") },
      { find: "@radix-ui/react-dropdown-menu",   replacement: td("@radix-ui/react-dropdown-menu") },
      { find: "@radix-ui/react-hover-card",      replacement: td("@radix-ui/react-hover-card") },
      { find: "@radix-ui/react-label",           replacement: td("@radix-ui/react-label") },
      { find: "@radix-ui/react-menubar",         replacement: td("@radix-ui/react-menubar") },
      { find: "@radix-ui/react-navigation-menu", replacement: td("@radix-ui/react-navigation-menu") },
      { find: "@radix-ui/react-popover",         replacement: td("@radix-ui/react-popover") },
      { find: "@radix-ui/react-progress",        replacement: td("@radix-ui/react-progress") },
      { find: "@radix-ui/react-radio-group",     replacement: td("@radix-ui/react-radio-group") },
      { find: "@radix-ui/react-scroll-area",     replacement: td("@radix-ui/react-scroll-area") },
      { find: "@radix-ui/react-select",          replacement: td("@radix-ui/react-select") },
      { find: "@radix-ui/react-separator",       replacement: td("@radix-ui/react-separator") },
      { find: "@radix-ui/react-slider",          replacement: td("@radix-ui/react-slider") },
      { find: "@radix-ui/react-slot",            replacement: td("@radix-ui/react-slot") },
      { find: "@radix-ui/react-switch",          replacement: td("@radix-ui/react-switch") },
      { find: "@radix-ui/react-tabs",            replacement: td("@radix-ui/react-tabs") },
      { find: "@radix-ui/react-toast",           replacement: td("@radix-ui/react-toast") },
      { find: "@radix-ui/react-toggle",          replacement: td("@radix-ui/react-toggle") },
      { find: "@radix-ui/react-toggle-group",    replacement: td("@radix-ui/react-toggle-group") },
      { find: "@radix-ui/react-tooltip",         replacement: td("@radix-ui/react-tooltip") },

      // ── @clerk/react ─────────────────────────────────────────────────────
      // Lives only in dashboard/node_modules; alias so Vite pre-bundles it
      // with the react alias above applied (avoiding a second React instance).
      { find: "@clerk/react", replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/@clerk/react") },

      // ── Other React-aware packages ───────────────────────────────────────
      { find: "@tanstack/react-query", replacement: td("@tanstack/react-query") },
      { find: "react-hook-form",       replacement: td("react-hook-form") },
      { find: "wouter",                replacement: td("wouter") },

      // ── Zustand (each ESM sub-path) ───────────────────────────────────────
      // Zustand lives only in dashboard/node_modules.
      { find: "zustand/vanilla",     replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/vanilla.mjs") },
      { find: "zustand/react",       replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/react.mjs") },
      { find: "zustand/middleware",  replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/middleware.mjs") },
      { find: "zustand/traditional", replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/traditional.mjs") },
      { find: "zustand/shallow",     replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/shallow.mjs") },
      { find: "zustand",             replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/index.mjs") },
    ],
    dedupe: [
      "react",
      "react-dom",
      "@tanstack/react-query",
      "react-hook-form",
      "wouter",
      "zustand",
      "@clerk/react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
    ],
  },
  optimizeDeps: {
    force: true,
    include: [
      "react",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-dom/client",
      "@tanstack/react-query",
      "react-hook-form",
      "wouter",
      "zustand",
      "zustand/middleware",
      "@clerk/react",
      // Radix UI packages must be pre-bundled before any page renders.
      // Without this, Vite discovers them during the first CompliancePage render
      // (which uses many Radix components via @/components/ui/*), triggers a
      // forced mid-render re-optimisation, and briefly creates two React instances
      // — causing "Invalid hook call" on every first visit to Compliance & Plans.
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
    ],
  },
  root: path.resolve(import.meta.dirname),
  publicDir: path.resolve(import.meta.dirname, "../dashboard/public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    // Prevent browser caching of Vite chunks in the Replit preview pane.
    // optimizeDeps.force:true re-hashes chunks on every restart; without this
    // header the preview iframe serves stale old chunks alongside new ones,
    // creating two React instances that trigger "Invalid hook call" crashes.
    headers: {
      "Cache-Control": "no-store",
    },
    proxy: {
      // Forward BASE-prefixed API calls to the API server.
      // DairyPage (and any other page using the `api()` helper with BASE_URL)
      // constructs URLs like /test-dashboard/api/farms/... which the Vite server
      // itself cannot serve.  This proxy rewrites the prefix and forwards to the
      // API server so those pages work the same as pages that use raw /api/ paths.
      [`${basePath}api`]: {
        target: "http://localhost:8080",
        rewrite: (p: string) => p.replace(new RegExp(`^${basePath}api`), "/api"),
        changeOrigin: true,
        configure: (proxy: any) => {
          proxy.on("error", (err: Error) => {
            console.error("[test-dashboard proxy] API proxy error:", err.message);
          });
        },
      },
    },
    fs: {
      allow: [path.resolve(import.meta.dirname, "../..")],
      strict: true,
      deny: ["**/.*"],
    },
  },
  define: {
    "import.meta.env.VITE_DEV_BYPASS_AUTH": JSON.stringify("true"),
    "import.meta.env.VITE_DEV_BYPASS_TOKEN": JSON.stringify("bde-dev-bypass-local"),
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
