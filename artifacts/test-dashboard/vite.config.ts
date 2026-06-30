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

// Plugin: prevent stale cross-session module cache hits from Replit's proxy,
// and force a full page reload when the Vite dev server restarts or re-optimises.
//
// ROOT CAUSE:
// Replit's preview proxy caches module responses keyed on the URL PATH only —
// it ignores (or normalises away) query-string parameters.  This means the
// previous query-string approach (?td=SESSION_TOKEN) was not effective: the
// proxy served cached source files with stale dep-chunk hashes regardless of
// the ?td= stamp, while freshly-served files embedded the current hashes.
// Two different dep-chunk hash URLs for the same package (e.g. react.js?v=OLD
// vs react.js?v=NEW) cause the browser to load TWO separate React module
// instances → "Invalid hook call" on the first hook call in any component
// served from the stale file.
//
// FIX — PATH-BASED SESSION TOKEN (FOUR LAYERS):
//
// 1. PATH-EMBEDDED SESSION TOKEN ON @fs/ SOURCE FILE URLS
//    Every @fs/ import URL in compiled source-file responses is rewritten to
//    embed the session token INSIDE THE URL PATH:
//      /<base>@fs/path  →  /<base>@td/SESSION_TOKEN/@fs/path
//    Because the token is part of the path (not the query string), the proxy
//    treats each session as a completely different URL → guaranteed cache miss
//    every session → Vite always serves the module fresh → consistent dep-chunk
//    hashes across all source files → exactly one React instance.
//    Dep-chunk URLs (/base/node_modules/.vite/deps/pkg.js?v=HASH) are left
//    completely unmodified: they are identical across all source files so the
//    browser loads exactly ONE copy regardless of caching.
//
// 2. PATH-EMBEDDED SESSION TOKEN ON ENTRY SCRIPT
//    index.html's <script src="main.tsx"> is rewritten to
//    /<base>@td/SESSION_TOKEN/src/main.tsx for the same reason.
//
// 3. SERVER-RESTART RELOAD (belt-and-suspenders for connected browsers)
//    A /__td_startup_token__ endpoint returns a per-session random token.
//    The client (main.tsx) fetches this on every vite:ws:connect; if the token
//    changed, it reloads the page before any navigation can use mixed hashes.
//
// 4. IN-SESSION RE-OPTIMISATION RELOAD (closes the mid-session dep-hash gap)
//    When Vite fires a full-reload event (dep re-optimisation changed the
//    browserHash WITHIN the current server process), the plugin regenerates
//    sessionToken before the message reaches the browser.  The browser reloads,
//    main.tsx re-fetches /__td_startup_token__, finds the new token ≠ stored,
//    and reloads once more — fetching all @fs/ modules under new path-based
//    session URLs (proxy cache miss) with the new dep-chunk hashes.
//
// MIDDLEWARE RESPONSIBILITY:
//    Incoming requests for /<base>@td/TOKEN/@fs/path are rewritten to
//    /<base>@fs/path before Vite sees them, so the module graph tracks modules
//    by their clean file path.  Legacy ?td= query params are also stripped for
//    any remaining entry-point cases.
function reconnectReloadPlugin(sessionBase: string) {
  let sessionToken =
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);

  const escapedBase = sessionBase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Matches @fs/ source-file URL strings inside compiled JS.
  // Group 1 captures the clean URL (BASE + @fs/ + path, no query string).
  const fsUrlRe = new RegExp(
    `"(${escapedBase}@fs/[^"?#]+)(?:\\?[^"]*)?"`, "g",
  );

  // Matches absolute dep-chunk URLs embedded in compiled JS source files,
  // including the filename and any ?v=HASH query param.
  // Example match: "/test-dashboard/node_modules/.vite/deps/react.js?v=60f50dc8"
  // Group 1 captures the bare filename (e.g. "react.js") WITHOUT the ?v= hash.
  //
  // ROOT CAUSE OF DUAL-REACT: previously only the path PREFIX was replaced,
  // leaving "?v=HASH" in the rewritten dep URL:
  //   "/test-dashboard/@td/TOKEN/deps/react.js?v=aeaed54b"
  // Dep chunks use RELATIVE imports WITHOUT ?v=, so they load at:
  //   "/test-dashboard/@td/TOKEN/deps/react.js"
  // The browser's ES module registry treats these as TWO DIFFERENT MODULES →
  // two separate React instances → "Invalid hook call".
  //
  // FIX: capture and discard the ?v= hash so source-file imports land on
  // the same URL as relative dep-chunk imports:
  //   "/test-dashboard/@td/TOKEN/deps/react.js"  (no ?v=)
  // Both source files and dep chunks now share the same module identity. ✓
  const depsUrlRe = new RegExp(
    `"${escapedBase}node_modules/\\.vite/deps/([^"?#]+)(?:\\?[^"]*)?"`
    , "g",
  );

  // Matches the <script type="module" src="…"> entry point in HTML responses.
  const scriptSrcRe = /(<script\b[^>]*type="module"[^>]*src=")([^"?#]+)(")/g;

  // Strips /<base>@td/<token>/deps/ from incoming dep-chunk request URLs,
  // remapping them to the real Vite-served path.
  // Example: /test-dashboard/@td/TOKEN/deps/react.js?v=60f50dc8
  //        → /test-dashboard/node_modules/.vite/deps/react.js?v=60f50dc8
  // NOTE: dep chunks use only RELATIVE imports to other chunks, so once the
  // first chunk is served at /@td/TOKEN/deps/, the browser resolves all its
  // relative siblings to the same token sub-path, and each sibling request
  // is remapped here too — no body rewriting is needed inside dep chunks.
  const tdDepsRe = new RegExp(`^${escapedBase}@td/[^/]+/deps/`);
  const depsBase = `${sessionBase}node_modules/.vite/deps/`;

  // Strips /<base>@td/<token>/ from the start of an incoming request URL,
  // rewriting e.g. /test-dashboard/@td/TOKEN/@fs/path → /test-dashboard/@fs/path
  const tdPathRe = new RegExp(`^${escapedBase}@td/[^/]+/`);

  function interceptText(res: any, transform: (body: string) => string) {
    const chunks: Buffer[] = [];
    const _end: typeof res.end = res.end.bind(res);

    res.write = (chunk: any, enc?: any, cb?: any) => {
      if (chunk != null) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      if (typeof enc === "function") enc();
      else if (typeof cb === "function") cb();
      return true;
    };

    res.end = (chunk?: any, enc?: any, cb?: any) => {
      if (chunk != null) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      // If headers are already committed (e.g. Vite's proxy middleware wrote
      // directly to the socket), skip the transformation.
      if (res.headersSent) {
        const done = typeof enc === "function" ? enc : typeof cb === "function" ? cb : undefined;
        return _end(Buffer.concat(chunks), done);
      }
      const body = transform(Buffer.concat(chunks).toString("utf-8"));
      res.removeHeader("content-length");
      const done = typeof enc === "function" ? enc : typeof cb === "function" ? cb : undefined;
      return _end(body, "utf-8", done);
    };
  }

  return {
    name: "reconnect-reload",
    apply: "serve" as const,

    configureServer(server: any) {
      // ── Layer 4: Regenerate token on every Vite-triggered full-reload ──────
      //
      // When Vite re-optimises deps mid-session the browserHash changes.
      // Vite's in-memory transform cache still holds compiled source files
      // with the OLD ?v=HASH baked into every dep-chunk import URL.  When
      // the browser reloads after the full-reload event, Vite serves the
      // STALE transforms (old hash) alongside freshly-compiled dep chunks
      // (new hash) → two different React module instances → "Invalid hook
      // call" on the next component that renders.
      //
      // FIX: before regenerating the session token, call
      // server.moduleGraph.invalidateAll() so Vite discards every cached
      // transform.  The reloading browser then fetches all source files
      // fresh, Vite re-transforms them and embeds the CURRENT browserHash
      // in every dep-chunk URL → single consistent React instance.
      const regenToken = () => {
        // Flush Vite's transform cache so stale dep-chunk URLs are not served.
        server.moduleGraph?.invalidateAll?.();
        sessionToken =
          Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
      };

      if (server.hot?.send) {
        const origHotSend = server.hot.send.bind(server.hot);
        server.hot.send = (event: any, data?: any) => {
          if (
            event === "vite:beforeFullReload" ||
            (typeof event === "object" && event?.type === "full-reload")
          ) {
            regenToken();
          }
          return origHotSend(event, data);
        };
      }
      if (server.ws?.send) {
        const origWsSend = server.ws.send.bind(server.ws);
        server.ws.send = (payload: any, ...rest: any[]) => {
          if (
            typeof payload === "object" &&
            payload?.type === "full-reload"
          ) {
            regenToken();
          }
          return origWsSend(payload, ...rest);
        };
      }

      server.middlewares.use((req: any, res: any, next: any) => {
        // ── 0. Force Cache-Control: no-store on ALL JavaScript/module responses
        //
        // ROOT CAUSE: Replit's preview proxy caches responses keyed on the URL
        // PATH only — it strips (ignores) query-string parameters.  Vite's
        // dep-serving middleware sets "Cache-Control: max-age=31536000,immutable"
        // on pre-bundled dep chunks.  The proxy then caches these chunks forever
        // (path key = "node_modules/.vite/deps/react.js", ignoring "?v=HASH").
        //
        // When the browserHash changes between restarts (triggered by any new
        // dep discovery in a prior session), Vite embeds NEW hash references
        // in freshly-served source files, but the proxy serves OLD cached dep
        // chunks from the previous hash.  For a brief window two different React
        // module instances exist in the same tab → "Invalid hook call" on the
        // first component that renders (typically whichever tab the user just
        // clicked).
        //
        // FIX: intercept res.setHeader BEFORE any of Vite's own middleware runs.
        // Any attempt by Vite (or sirv) to set "Cache-Control: max-age=..." is
        // silently replaced with "no-store".  The proxy therefore never caches
        // dep chunks and always fetches the current version from Vite.
        //
        // We target all "module-like" URLs:
        //   /.vite/deps/  — pre-bundled dep chunks (root cause of this bug)
        //   /@fs/         — source file transforms
        //   /@td/         — path-token'd source files (our Layer 1 URLs)
        //   /node_modules/ — any other package URL Vite might serve directly
        //   /src/         — entry-point source files
        const rawUrl = (req.url as string) ?? "";
        const isModuleUrl =
          rawUrl.includes("/.vite/deps/") ||
          rawUrl.includes("/@fs/") ||
          rawUrl.includes("/@td/") ||
          rawUrl.includes("/node_modules/") ||
          /\/src\/[^?]+\.(tsx?|jsx?|js)/.test(rawUrl);

        if (isModuleUrl) {
          const origSet = (res.setHeader as Function).bind(res);
          res.setHeader = (name: string, value: any) => {
            if (typeof name === "string" && name.toLowerCase() === "cache-control") {
              return origSet("Cache-Control", "no-store");
            }
            return origSet(name, value);
          };
          // Set proactively so any header inspection before Vite runs sees no-store.
          (res.setHeader as Function)("Cache-Control", "no-store");
        }

        // ── 1. Strip session token from incoming request URLs ──────────────
        if (rawUrl.includes("/@td/")) {
          if (tdDepsRe.test(rawUrl)) {
            // Dep-chunk URL: /base/@td/TOKEN/deps/chunk.js?v=HASH
            //              → /base/node_modules/.vite/deps/chunk.js?v=HASH
            // The dep chunk uses only RELATIVE imports; the browser resolves
            // those relative to the /@td/TOKEN/deps/ base, so each sibling
            // request also hits this branch and is remapped correctly.
            req.url = rawUrl.replace(tdDepsRe, depsBase);
          } else {
            // Source-file URL: /base/@td/TOKEN/@fs/path → /base/@fs/path
            req.url = rawUrl.replace(tdPathRe, sessionBase);
          }
        }
        // Query-based (legacy fallback): strip ?td=TOKEN
        if ((req.url as string)?.includes("td=")) {
          req.url = (req.url as string)
            .replace(/[?&]td=[^&]*/g, "")
            .replace(/\?&/g, "?")
            .replace(/[?&]$/g, "") || "/";
        }

        // ── 2. Startup-token endpoint (server-restart detection) ───────────
        if ((req.url as string)?.endsWith("/__td_startup_token__")) {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify({ token: sessionToken }));
          return;
        }

        // ── 3. Intercept JS module and HTML responses ──────────────────────
        const url = req.url as string;
        const isJsModule =
          url.includes("/.vite/deps/") ||
          url.includes("@fs/") ||
          /\/src\/[^?]+\.(tsx?|jsx?|js)(\?|$)/.test(url);
        const isHtml =
          url === "/" || url.endsWith("/") || /\.html?(\?|$)/.test(url);

        if (!isJsModule && !isHtml) {
          next();
          return;
        }

        interceptText(res, (body) => {
          const ct = ((res.getHeader?.("content-type") as string) ?? "").toLowerCase();

          if (ct.includes("javascript") || ct.includes("typescript")) {
            // Rewrite dep-chunk URLs to embed the session token AND strip ?v=HASH.
            //   "/base/node_modules/.vite/deps/react.js?v=HASH"
            //   → "/base/@td/TOKEN/deps/react.js"  (no ?v=)
            //
            // WHY strip ?v=HASH: dep chunks use relative imports without ?v= so
            // they load at "…/@td/TOKEN/deps/react.js" (no ?v=). If the source
            // file kept "…/@td/TOKEN/deps/react.js?v=HASH", the browser's ES
            // module registry would see two DIFFERENT module identities for the
            // same file — one with ?v=, one without — loading React twice and
            // triggering "Invalid hook call" on the first hook in any component.
            // Stripping ?v= makes source-file imports land on the same URL as
            // relative dep-chunk imports → single React instance. ✓
            //
            // Session-unique path (/base/@td/TOKEN/deps/) still prevents Replit's
            // proxy (which caches by URL path) from serving a stale dep chunk.
            let result = body.replace(
              depsUrlRe,
              (_m: string, filename: string) =>
                `"${sessionBase}@td/${sessionToken}/deps/${filename}"`,
            );
            // Rewrite every @fs/ source-file URL to embed the session token
            // in the path: BASE@fs/path → BASE@td/TOKEN/@fs/path.
            result = result.replace(fsUrlRe, (_match, p1: string) => {
              // p1 = "/<base>@fs/home/runner/.../File.tsx"
              const pathAfterBase = p1.slice(sessionBase.length); // "@fs/..."
              return `"${sessionBase}@td/${sessionToken}/${pathAfterBase}"`;
            });
            return result;
          }
          if (ct.includes("text/html")) {
            // Rewrite the entry-script src with a path-based session token.
            return body.replace(
              scriptSrcRe,
              (_m, pre, src: string, post) => {
                const pathAfterBase = src.startsWith(sessionBase)
                  ? src.slice(sessionBase.length)
                  : src.replace(/^\.\//, "");
                return `${pre}${sessionBase}@td/${sessionToken}/${pathAfterBase}${post}`;
              },
            );
          }
          return body;
        });

        next();
      });
    },
  };
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
    reconnectReloadPlugin(basePath),
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

      // ── @uppy/* ───────────────────────────────────────────────────────────
      // Uppy lives only in dashboard/node_modules (via @workspace/object-storage-web).
      // Without explicit aliases + optimizeDeps entries, Vite discovers these
      // packages mid-render (first visit to PoultryProductionPage), triggers a
      // forced re-optimisation, rehashes ALL chunks including React, and briefly
      // creates two React instances — causing "Invalid hook call" on FlocksTab.
      // Same mechanism as the lucide-react / Radix UI fix above.
      { find: "@uppy/core",      replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/@uppy/core") },
      { find: "@uppy/react",     replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/@uppy/react") },
      { find: "@uppy/aws-s3",    replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/@uppy/aws-s3") },
      { find: "@uppy/dashboard", replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/@uppy/dashboard") },

      // ── shadcn/ui peer dependencies ──────────────────────────────────────
      // These packages are used by @/components/ui/* (calendar, carousel,
      // drawer, input-otp, resizable, sonner) and are NOT in the Radix UI
      // list above.  Without explicit aliases + optimizeDeps entries, Vite
      // discovers them on the first page load, triggers a forced mid-render
      // re-optimisation, rehashes ALL chunks including React, and briefly
      // creates two React instances — the same mechanism documented above for
      // lucide-react, Radix UI, and @uppy/*.
      { find: "vaul",                   replacement: td("vaul") },
      { find: "sonner",                 replacement: td("sonner") },
      { find: "next-themes",            replacement: td("next-themes") },
      { find: "input-otp",              replacement: td("input-otp") },
      { find: "embla-carousel-react",   replacement: td("embla-carousel-react") },
      { find: "react-day-picker",       replacement: td("react-day-picker") },
      { find: "react-resizable-panels", replacement: td("react-resizable-panels") },

      // ── Other React-aware packages ───────────────────────────────────────
      { find: "@tanstack/react-query", replacement: td("@tanstack/react-query") },
      { find: "react-hook-form",       replacement: td("react-hook-form") },
      { find: "wouter",                replacement: td("wouter") },

      // ── Runtime-discovered packages — must ALL be pre-bundled at startup ────
      //
      // HOW THE CRASH WORKS: when Vite discovers any new dep mid-render it
      // increments the global `browserHash`.  Every pre-bundled chunk URL
      // carries that hash (e.g. react.js?v=<browserHash>).  Modules already in
      // memory hold references to the OLD hash; newly-loaded modules fetch the
      // NEW hash.  For a brief window there are two distinct React instances in
      // the same tab → "Invalid hook call" on whichever component was rendering.
      //
      // FIX: every package that Vite has previously discovered at runtime
      // (visible in node_modules/.vite/deps/_metadata.json under "optimized"
      // but absent from the explicit `include` list) must be added here AND to
      // `optimizeDeps.include` below so Vite bundles them during startup before
      // any component renders.
      //
      // Packages that live only in dashboard/node_modules need an alias so that
      // the `include` entry can resolve them (otherwise Vite searches from
      // test-dashboard's own node_modules and silently skips the entry).
      // Packages that exist in test-dashboard/node_modules use `td()` as usual.

      // leaflet — only in dashboard/node_modules; dynamically imported by
      // StorageLocationMapPicker.tsx (visible to Vite's static analyser).
      { find: "leaflet", replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/leaflet") },

      // recharts — React-aware charting lib; exists in test-dashboard's own
      // node_modules so td() works.  Used by chart.tsx → many report pages.
      { find: "recharts", replacement: td("recharts") },

      // cmdk — React-aware command-menu lib; exists in test-dashboard's own
      // node_modules.  Used by @/components/ui/command.tsx.
      { find: "cmdk", replacement: td("cmdk") },

      // qrcode.react — React component; only in dashboard/node_modules.
      // Used by Fields, Equipment, Storage Locations pages.
      { find: "qrcode.react", replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/qrcode.react") },

      // jspdf + jspdf-autotable — PDF generation, not React-aware but only
      // in dashboard/node_modules.  Late discovery still triggers a browserHash
      // change that can produce two React instances.
      { find: "jspdf",          replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/jspdf") },
      { find: "jspdf-autotable", replacement: path.resolve(import.meta.dirname, "../dashboard/node_modules/jspdf-autotable") },

      // class-variance-authority / clsx / tailwind-merge — pure utility libs
      // with no React; exist in test-dashboard's own node_modules.  Adding
      // them to include (below) prevents late discovery from changing the hash.
      { find: "class-variance-authority", replacement: td("class-variance-authority") },
      { find: "clsx",           replacement: td("clsx") },
      { find: "tailwind-merge", replacement: td("tailwind-merge") },

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
      "@uppy/core",
      "@uppy/react",
      "@uppy/aws-s3",
      "@uppy/dashboard",
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
      // shadcn/ui peer deps — must be deduped for the same reason as above
      "vaul",
      "sonner",
      "next-themes",
      "input-otp",
      "embla-carousel-react",
      "react-day-picker",
      "react-resizable-panels",
      // React-aware runtime-discovered packages — deduped to ensure only one
      // copy of React is used regardless of which node_modules copy is loaded.
      "recharts",
      "cmdk",
      "qrcode.react",
    ],
  },
  optimizeDeps: {
    // NOTE: force:true intentionally removed. It re-hashes all pre-bundled
    // chunks on every server restart. Replit's preview proxy caches the old
    // hashes; the browser then loads mixed old/new chunks → two React
    // instances → "Invalid hook call" on FlocksTab and others.
    // All packages that would trigger mid-render discovery are listed in
    // `include` below, so stable hashes between restarts are safe.
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
      // lucide-react must be pre-bundled — it is used by BeefProductionPage,
      // SheepProductionPage and many other pages, and if Vite discovers it mid-render
      // it triggers a forced re-optimisation that briefly creates two React instances,
      // causing "Invalid hook call" errors (same mechanism as the Radix issue below).
      "lucide-react",
      // @uppy/* must be pre-bundled for the same reason: ObjectUploader.tsx (loaded
      // via @workspace/object-storage-web) imports these packages, and discovering
      // them mid-render on PoultryProductionPage causes a second optimisation run
      // that rehashes all chunks including React, producing two React instances and
      // "Invalid hook call" on FlocksTab.  Primary fix: index.ts no longer re-exports
      // ObjectUploader (belt-and-suspenders in case any future code path loads it).
      "@uppy/core",
      "@uppy/react",
      "@uppy/aws-s3",
      "@uppy/dashboard",
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
      // shadcn/ui peer deps — same mid-render re-optimisation risk as above.
      // Used by @/components/ui/{calendar,carousel,drawer,input-otp,resizable,sonner}.
      // Without these entries Vite discovers them on the first SPA page load,
      // rehashes ALL chunks including React, and briefly creates two React
      // instances — causing "Invalid hook call" on FlocksTab and other tabs.
      "vaul",
      "sonner",
      "next-themes",
      "input-otp",
      "embla-carousel-react",
      "react-day-picker",
      "react-resizable-panels",
      // leaflet — only in dashboard/node_modules; alias in resolve.alias lets
      // Vite find it.  Without pre-bundling, StorageLocationMapPicker's dynamic
      // import() triggers discovery mid-render → browserHash change → two React
      // instances → "Invalid hook call" on SlurryTab.
      "leaflet",
      // The packages below were previously discovered at runtime (visible in
      // _metadata.json but absent from this list).  Any late discovery changes
      // the global browserHash, re-keying every pre-bundled chunk URL.  Modules
      // already loaded keep the old URL; newly loaded modules get the new URL →
      // two React instances → "Invalid hook call" on whichever tab renders next.
      // Adding them here forces Vite to pre-bundle all of them at startup so the
      // browserHash never changes after the server is ready.
      "recharts",
      "cmdk",
      "qrcode.react",
      "jspdf",
      "jspdf-autotable",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
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
