import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
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
  // ROOT CAUSE OF DUAL-REACT (v1): previously only the path PREFIX was replaced,
  // leaving "?v=HASH" in the rewritten dep URL:
  //   "/test-dashboard/@td/TOKEN/deps/react.js?v=aeaed54b"
  // Dep chunks use RELATIVE imports WITHOUT ?v=, so they load at:
  //   "/test-dashboard/@td/TOKEN/deps/react.js"
  // The browser's ES module registry treats these as TWO DIFFERENT MODULES →
  // two separate React instances → "Invalid hook call".
  //
  // ROOT CAUSE OF DUAL-REACT (v2 — the persistent crash after v1 fix):
  // Replit's EXTERNAL proxy (*.replit.dev) normalises the session-token path
  // segment out of URLs when building its cache key:
  //   "/test-dashboard/@td/SESSION1/@fs/.../SeedStorePage.tsx"
  //   → cache key: "/test-dashboard/@fs/.../SeedStorePage.tsx"
  // A cached source file from SESSION1 embeds "@td/SESSION1/deps/react.js".
  // Other source files (too large to be cached, served fresh) embed
  // "@td/SESSION2/deps/react.js".  Two different module URLs → two React
  // instances → "Invalid hook call" on the first hook in SeedStorePage.
  //
  // FIX: do NOT embed the session token in dep-chunk URLs at all.  All source
  // files (cached or fresh) embed the same FIXED dep-chunk URL:
  //   "/test-dashboard/@td/deps/react.js"  (no token, no ?v=)
  // Regardless of whether a source file is served from proxy cache or fresh,
  // it always references the same dep-chunk URL → one React instance. ✓
  const depsUrlRe = new RegExp(
    `"${escapedBase}node_modules/\\.vite/deps/([^"?#]+)(?:\\?[^"]*)?"`
    , "g",
  );

  // Matches the <script type="module" src="…"> entry point in HTML responses.
  const scriptSrcRe = /(<script\b[^>]*type="module"[^>]*src=")([^"?#]+)(")/g;

  // Strips /@td/deps/ from fixed dep-chunk URLs (new approach, no session token).
  // Example: /test-dashboard/@td/deps/react.js
  //        → /test-dashboard/node_modules/.vite/deps/react.js
  const tdDepsFixedRe = new RegExp(`^${escapedBase}@td/deps/`);

  // Strips /<base>@td/<token>/deps/ from incoming tokenised dep-chunk URLs.
  // Legacy fallback: handles any old-token dep URLs that may still arrive
  // (e.g. from a browser tab that has a pre-fix source file in its cache).
  // Example: /test-dashboard/@td/TOKEN/deps/react.js
  //        → /test-dashboard/node_modules/.vite/deps/react.js
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
      // Always apply the transformation regardless of res.headersSent.
      // Skipping it when headers are already committed would serve raw dep URLs
      // (without the session token) → second React instance → "Invalid hook call".
      // In Vite's dev server the response is typically chunked (no Content-Length),
      // so sending a differently-sized transformed body is safe even if headers
      // were already flushed by an earlier res.flushHeaders() call.
      const body = transform(Buffer.concat(chunks).toString("utf-8"));
      if (!res.headersSent) {
        res.removeHeader("content-length");
      }
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
        // Flush Vite's in-memory transform cache before rotating the session
        // token. Must run BEFORE token change so that the reloading browser
        // fetches all source files fresh (no stale dep-chunk URLs baked in).
        //
        // Vite 7: per-environment module graph. server.environments may be
        // a plain object OR a Map depending on the Vite version/config.
        // Object.values() is a no-op on a Map, so we handle both forms.
        let invalidatedCount = 0;
        if (server.environments) {
          const envIterable: any[] =
            server.environments instanceof Map
              ? Array.from((server.environments as Map<string, any>).values())
              : Object.values(server.environments as Record<string, any>);
          for (const env of envIterable) {
            const invalidate = env?.moduleGraph?.invalidateAll;
            if (typeof invalidate === "function") {
              invalidate.call(env.moduleGraph);
              invalidatedCount++;
            }
          }
        }
        // Vite 6 / compatibility shim fallback — runs even when environments
        // is present, to cover any shim that does real work.
        const legacyInvalidate = (server as any).moduleGraph?.invalidateAll;
        if (typeof legacyInvalidate === "function") {
          legacyInvalidate.call((server as any).moduleGraph);
          invalidatedCount++;
        }
        console.log(
          `[td] regenToken: invalidated ${invalidatedCount} module graph(s)`,
        );
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
          rawUrl.includes("/@react-refresh") ||
          rawUrl.includes("/@vite/") ||
          /\/src\/[^?]+\.(tsx?|jsx?|js)/.test(rawUrl) ||
          rawUrl === "/" ||
          rawUrl.endsWith("/") ||
          /\.html?(\?|$)/.test(rawUrl);

        if (isModuleUrl) {
          const origSet = (res.setHeader as Function).bind(res);
          res.setHeader = (name: string, value: any) => {
            if (typeof name === "string" && name.toLowerCase() === "cache-control") {
              return origSet("Cache-Control", "no-store");
            }
            return origSet(name, value);
          };
          // Also intercept res.writeHead() — some middleware (sirv, Vite's send helper)
          // calls writeHead() instead of setHeader(), which bypasses the interception
          // above and lets "max-age=immutable" slip through to the Replit proxy.
          const origWriteHead = (res.writeHead as Function).bind(res);
          res.writeHead = (statusCode: number, statusMessage?: any, headers?: any) => {
            // Normalise the two overload shapes:
            //   writeHead(status, headers)
            //   writeHead(status, message, headers)
            let hdrs: Record<string, any> | undefined;
            let msg: string | undefined;
            if (typeof statusMessage === "string") {
              msg = statusMessage;
              hdrs = headers as Record<string, any> | undefined;
            } else if (statusMessage != null) {
              hdrs = statusMessage as Record<string, any>;
            }
            if (hdrs) {
              for (const k of Object.keys(hdrs)) {
                if (k.toLowerCase() === "cache-control") {
                  hdrs[k] = "no-store";
                }
              }
            }
            return msg !== undefined
              ? origWriteHead(statusCode, msg, hdrs)
              : origWriteHead(statusCode, hdrs);
          };
          // Set proactively so any header inspection before Vite runs sees no-store.
          (res.setHeader as Function)("Cache-Control", "no-store");
        }

        // ── 1. Strip session token from incoming request URLs ──────────────
        if (rawUrl.includes("/@td/")) {
          if (tdDepsFixedRe.test(rawUrl)) {
            // Fixed dep-chunk URL (new): /base/@td/deps/chunk.js
            //                         → /base/node_modules/.vite/deps/chunk.js
            req.url = rawUrl.replace(tdDepsFixedRe, depsBase);
          } else if (tdDepsRe.test(rawUrl)) {
            // Tokenised dep-chunk URL (legacy): /base/@td/TOKEN/deps/chunk.js
            //                                → /base/node_modules/.vite/deps/chunk.js
            req.url = rawUrl.replace(tdDepsRe, depsBase);
          } else {
            // Source-file URL: /base/@td/TOKEN/@xfs/path → /base/@fs/path
            // (also handles legacy @fs/ scheme from old proxy-cached content)
            const stripped = rawUrl.replace(tdPathRe, sessionBase);
            req.url = stripped.replace("/@xfs/", "/@fs/");
          }
        }
        // Strip ?_t=NONCE (added by SW Case 3 to bust proxy cache).
        // Must happen BEFORE Vite sees the URL so the warmed-up module in
        // Vite's transform cache is reused — not recompiled as a new module.
        // Recompiling a large page (LivestockPage 500KB+) mid-session causes
        // @react-refresh to call performReactRefresh() while another component
        // is rendering → "Invalid hook call".
        if ((req.url as string)?.includes("_t=")) {
          req.url = (req.url as string)
            .replace(/[?&]_t=[^&]*/g, "")
            .replace(/\?&/g, "?")
            .replace(/[?&]$/g, "") || "/";
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

        // ── 3. Service Worker static file ──────────────────────────────────
        // sw-v*.js files are NOT JS module URLs (no /@fs/, /.vite/deps/, etc.)
        // and NOT HTML, so they fall through to Vite's SPA fallback and get
        // served as text/html.  Serve them explicitly here before that check.
        const swMatch = rawUrl.match(/^.+\/(sw(?:-v\d+)?\.js)(?:\?.*)?$/);
        if (swMatch) {
          const swFilePath = path.resolve(__dirname, "public", swMatch[1]);
          try {
            const swContent = fs.readFileSync(swFilePath, "utf-8");
            res.setHeader("Content-Type", "application/javascript; charset=utf-8");
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Service-Worker-Allowed", sessionBase);
            res.end(swContent);
          } catch {
            res.statusCode = 404;
            res.end("Not found");
          }
          return;
        }

        // ── 4. Intercept JS module and HTML responses ──────────────────────
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
            // Rewrite dep-chunk URLs to use a FIXED shared path (no session token)
            // AND strip the ?v=HASH query param.
            //   "/base/node_modules/.vite/deps/react.js?v=HASH"
            //   → "/base/@td/deps/react.js"  (no token, no ?v=)
            //
            // WHY no ?v=HASH: dep chunks use relative imports without ?v= so
            // they load at "…/@td/deps/react.js" (no ?v=). Keeping ?v= would
            // create two different module identities for the same file.
            //
            // WHY no session token: Replit's external proxy (*.replit.dev)
            // normalises the @td/TOKEN/ path segment away when building its
            // cache key, so @fs/ source files can be served from proxy cache
            // with a DIFFERENT token's dep-chunk URLs.  By using a token-free
            // fixed path (/base/@td/deps/), both stale-cached and fresh source
            // files always reference the same dep-chunk URL → one React
            // instance regardless of which session the proxy cached. ✓
            let result = body.replace(
              depsUrlRe,
              (_m: string, filename: string) =>
                `"${sessionBase}@td/deps/${filename}"`,
            );
            // When the body IS a dep chunk (url contains /.vite/deps/), also
            // rewrite RELATIVE cross-chunk imports to absolute fixed-path URLs.
            //
            // WHY: Vite pre-bundled dep chunks reference sibling chunks with
            // bare relative paths, e.g. `import { x } from "./chunk-KC53NVYV.js"`.
            // The browser resolves relative imports relative to the SERVING URL:
            //   @td/deps/react.js           → @td/deps/chunk-KC53NVYV.js  ✓ (fixed)
            //   @td/OLD_TOKEN/deps/react.js → @td/OLD_TOKEN/deps/chunk-KC53NVYV.js  ✗
            // Old-token dep chains remain fully token-specific because relative
            // imports propagate the base throughout the entire chain.  Two
            // separate chunk-KC53NVYV.js URLs → two separate require_react_development
            // factories → two React objects → "Invalid hook call".
            //
            // FIX: when serving any dep chunk (stripped URL has /.vite/deps/),
            // rewrite every `"./CHUNK.js"` to `"/base/@td/deps/CHUNK.js"` so that
            // dep chunks served at ANY prefix (fixed or old-token) all reference
            // the same absolute chunk URLs → single dep chain → one React. ✓
            if (url.includes("/.vite/deps/")) {
              // Matches relative sibling dep-chunk imports (with or without ?v=).
              // Example: "./chunk-KC53NVYV.js" → "/base/@td/deps/chunk-KC53NVYV.js"
              result = result.replace(
                /"\.\/([^"?#]+\.js)(?:\?[^"]*)?"/g,
                (_m: string, filename: string) =>
                  `"${sessionBase}@td/deps/${filename}"`,
              );
            }
            // Rewrite every @fs/ source-file URL to embed the session token
            // in the path: BASE@fs/path → BASE@td/TOKEN/@xfs/path.
            //
            // WHY @xfs/ instead of @fs/:
            // The proxy had old content cached at key "@fs/path".  By changing
            // the marker to "@xfs/" we guarantee a proxy cache MISS for every
            // source file URL (the proxy has never seen "@xfs/" keys), so the
            // server always serves the fresh padded version.  SeedStorePage at
            // 512 KB exceeds the proxy cache threshold → never cached going
            // forward → correct session token every time → one module identity
            // per file → no React Refresh family conflict → no hook crash. ✓
            result = result.replace(fsUrlRe, (_match, p1: string) => {
              // p1 = "/<base>@fs/home/runner/.../File.tsx"
              const pathAfterBase = p1.slice(sessionBase.length); // "@fs/..."
              // Change "@fs/" → "@xfs/" so the browser requests the new-scheme
              // URL (proxy cache miss) while the server middleware maps it back
              // to Vite's native @fs/ path for serving.
              const xfsPath = pathAfterBase.replace("@fs/", "@xfs/");
              return `"${sessionBase}@td/${sessionToken}/${xfsPath}"`;
            });
            // Anti-proxy-cache padding for source files in the 256KB–490KB
            // compiled-size range.
            //
            // WHY: Replit's external proxy caches source files ignoring
            // Cache-Control headers, using the URL path (minus the @td/TOKEN/
            // segment) as the cache key.  A cached response from session A is
            // served to session B with session-A's @td/TOKEN/ embedded in all
            // @fs/ import paths.  When the same file is also loaded at
            // session-B's @td/TOKEN/ URL, the browser's ES module registry
            // creates TWO separate module identities for the same file.
            // React Refresh detects two registrations of the same component
            // family key and calls performReactRefresh() while the component
            // is still being rendered for the first time → the React dispatcher
            // is in the wrong state → "Invalid hook call".
            //
            // SOLUTION: files that exceed ~500 KB are NOT cached by the proxy
            // (confirmed empirically — CompliancePage at 500 KB+ never crashes).
            // For source files in the dangerous 256 KB–490 KB range we append a
            // JS comment large enough to push the total past the threshold.
            // Dep chunks (which use fixed canonical URLs) are exempt.
            if (!url.includes("/.vite/deps/") && !url.includes("/@td/deps/")) {
              const PROXY_CACHE_THRESHOLD = 512 * 1024; // 512 KB
              const LOW_WATER = 256 * 1024;             // 256 KB (skip tiny files)
              const byteLen = Buffer.byteLength(result, "utf-8");
              if (byteLen >= LOW_WATER && byteLen < PROXY_CACHE_THRESHOLD) {
                const needed = PROXY_CACHE_THRESHOLD - byteLen;
                // Use a valid JS comment so the padding is invisible to the
                // engine.  The 4 bytes are for "/*" and "*/" delimiters.
                result += "\n/*" + " ".repeat(Math.max(0, needed - 4)) + "*/";
              }
            }
            return result;
          }
          if (ct.includes("text/html")) {
            // Rewrite the entry-script src with a path-based session token.
            let htmlResult = body.replace(
              scriptSrcRe,
              (_m, pre, src: string, post) => {
                const pathAfterBase = src.startsWith(sessionBase)
                  ? src.slice(sessionBase.length)
                  : src.replace(/^\.\//, "");
                return `${pre}${sessionBase}@td/${sessionToken}/${pathAfterBase}${post}`;
              },
            );
            // Append the session token as a query param to the SW registration
            // URL so the proxy sees a fresh URL each session (proxy caches by
            // URL; different ?v= value = cache miss = correct JS served).
            htmlResult = htmlResult.replace(
              /(register\s*\(\s*['"](?:[^'"]*\/))(sw[^'"]*\.js)(['"])/g,
              (_m: string, pre: string, file: string, post: string) =>
                `${pre}${file}?v=${sessionToken}${post}`,
            );
            return htmlResult;
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

// Helper: resolve use-sync-external-store from zustand's pnpm virtual-store
// sibling.  The package lives only as a peer dep of zustand; pnpm places it
// alongside zustand in the same node_modules/ directory inside the store.
// We follow the zustand symlink to find its real pnpm-store path, then
// navigate to the sibling use-sync-external-store entry.
//
// WHY an alias is necessary: use-sync-external-store is not hoisted to
// test-dashboard/node_modules or dashboard/node_modules.  Without an alias
// Vite cannot resolve it at all, so adding it to optimizeDeps.include would
// fail silently, and the first runtime import would trigger a mid-render
// dep-discovery cycle that changes the global browserHash and creates two
// React instances → "Invalid hook call".
const _zustandReal = fs.realpathSync(
  path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand")
);
const _sesRoot = path.resolve(_zustandReal, "../use-sync-external-store");
const ses = (sub: string) => path.resolve(_sesRoot, sub);

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

      // ── @workspace/object-storage-web ────────────────────────────────────
      // MUST be aliased to point directly at the compiled entry file (use-upload.ts),
      // NOT at the package root. When Vite resolves the package root it scans
      // every file in the package directory, including ObjectUploader.tsx.
      // ObjectUploader.tsx imports @uppy/core directly (not as a type), which
      // resolves from lib/object-storage-web/node_modules/@uppy/core — a separate
      // copy from the dashboard/node_modules one. Vite then discovers a "new"
      // dep mid-render, increments browserHash, re-hashes ALL chunk URLs, and
      // for a brief window two different React module instances exist in the tab
      // → "Invalid hook call" on JohnesTab and any other tab that first renders
      // DocAttach or RecordAttachments.
      // Fix: alias the package to the single source file that is actually used,
      // bypassing the scanner's traversal of ObjectUploader.tsx entirely.
      { find: "@workspace/object-storage-web", replacement: path.resolve(import.meta.dirname, "../../lib/object-storage-web/src/use-upload.ts") },

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

      // ── use-sync-external-store (peer dep of zustand/traditional + @uppy/react) ──
      // zustand/traditional.mjs imports use-sync-external-store/shim/with-selector.
      // @uppy/react imports use-sync-external-store/with-selector.js (with .js ext).
      // The package is NOT hoisted to test-dashboard or dashboard node_modules.
      //
      // IMPORTANT: must use REGEX find (not string) for all entries.
      // String aliases use startsWith() matching, so `"use-sync-external-store"`
      // would incorrectly match `"use-sync-external-store/with-selector.js"` and
      // produce `.../index.js/with-selector.js` (a bad path).  Regex aliases use
      // id.replace(regex, replacement) and match the full import string only.
      //
      // Most specific sub-paths first; the bare-name regex is last.
      { find: /^use-sync-external-store\/shim\/with-selector(?:\.js)?$/, replacement: ses("shim/with-selector.js") },
      { find: /^use-sync-external-store\/shim(?:\/index(?:\.js)?)?$/,    replacement: ses("shim/index.js") },
      { find: /^use-sync-external-store\/with-selector(?:\.js)?$/,       replacement: ses("with-selector.js") },
      { find: /^use-sync-external-store(?:\/index(?:\.js)?)?$/,          replacement: ses("index.js") },
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
      // use-sync-external-store: peer dep of zustand/traditional; deduped so
      // its internal React import shares the single canonical React instance.
      "use-sync-external-store",
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
      // use-sync-external-store is imported by zustand/traditional.mjs.
      // Without pre-bundling, a stale proxy-cached source file can trigger
      // discovery mid-render → Vite re-optimises ALL deps → browserHash changes
      // → old proxy-cached files reference chunk names that no longer exist →
      // React fails to load → "Invalid hook call" on every hard refresh.
      // Pre-bundling here ensures the file always exists in .vite/deps/ and
      // the browserHash stays stable throughout the session.
      "use-sync-external-store",
      "use-sync-external-store/shim",
      "use-sync-external-store/with-selector",
      "use-sync-external-store/shim/with-selector",
      // zustand/traditional is the only zustand sub-path that imports
      // use-sync-external-store; pre-bundling it here keeps it out of the
      // lazy-discovery pool and prevents the same mid-render rehash.
      "zustand/traditional",
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
    // Pre-compile ALL dashboard page files at server startup (before any browser
    // request arrives).  Without this, large pages (LivestockPage 500KB+) are
    // compiled lazily on first browser fetch — typically 40–60 seconds after
    // load.  When Vite finishes compiling a file mid-session, @react-refresh
    // calls performReactRefresh(), which interrupts any component that is
    // currently executing its first render (including calling hooks).  If
    // SeedStorePage is mid-render at that moment the React dispatcher is in
    // the wrong state → "Invalid hook call".  Warming up all pages at startup
    // eliminates all mid-session compilations → no spurious performReactRefresh
    // → hooks always run in a stable dispatcher context. ✓
    warmup: {
      clientFiles: [
        "../../artifacts/dashboard/src/pages/AccidentBookPage.tsx",
        "../../artifacts/dashboard/src/pages/AccountSettings.tsx",
        "../../artifacts/dashboard/src/pages/AdvisorsAccessPage.tsx",
        "../../artifacts/dashboard/src/pages/BeefProductionPage.tsx",
        "../../artifacts/dashboard/src/pages/BiofuelPage.tsx",
        "../../artifacts/dashboard/src/pages/BiosecurityPage.tsx",
        "../../artifacts/dashboard/src/pages/BusinessReportsPage.tsx",
        "../../artifacts/dashboard/src/pages/CarbonPage.tsx",
        "../../artifacts/dashboard/src/pages/CompliancePage.tsx",
        "../../artifacts/dashboard/src/pages/ContractorsPage.tsx",
        "../../artifacts/dashboard/src/pages/CropStockPage.tsx",
        "../../artifacts/dashboard/src/pages/CropTrialsPage.tsx",
        "../../artifacts/dashboard/src/pages/DairyPage.tsx",
        "../../artifacts/dashboard/src/pages/Dashboard.tsx",
        "../../artifacts/dashboard/src/pages/DepartmentsPage.tsx",
        "../../artifacts/dashboard/src/pages/DiversificationPage.tsx",
        "../../artifacts/dashboard/src/pages/DocumentsPage.tsx",
        "../../artifacts/dashboard/src/pages/EncampmentPage.tsx",
        "../../artifacts/dashboard/src/pages/EnvironmentalPageFull.tsx",
        "../../artifacts/dashboard/src/pages/Equipment.tsx",
        "../../artifacts/dashboard/src/pages/FarmLocationsPage.tsx",
        "../../artifacts/dashboard/src/pages/FarmMapPage.tsx",
        "../../artifacts/dashboard/src/pages/FarmServicesPage.tsx",
        "../../artifacts/dashboard/src/pages/FarmSettings.tsx",
        "../../artifacts/dashboard/src/pages/FeedManagementPage.tsx",
        "../../artifacts/dashboard/src/pages/FieldInspectionsPage.tsx",
        "../../artifacts/dashboard/src/pages/FieldOperationsPage.tsx",
        "../../artifacts/dashboard/src/pages/Fields.tsx",
        "../../artifacts/dashboard/src/pages/FinancialPage.tsx",
        "../../artifacts/dashboard/src/pages/FleetDashboard.tsx",
        "../../artifacts/dashboard/src/pages/FlyTippingPage.tsx",
        "../../artifacts/dashboard/src/pages/FreshProducePage.tsx",
        "../../artifacts/dashboard/src/pages/FuelEnergyPage.tsx",
        "../../artifacts/dashboard/src/pages/GoatDairyPage.tsx",
        "../../artifacts/dashboard/src/pages/GoatProductionPage.tsx",
        "../../artifacts/dashboard/src/pages/GrantsPage.tsx",
        "../../artifacts/dashboard/src/pages/HarvestDashboard.tsx",
        "../../artifacts/dashboard/src/pages/HarvestPage.tsx",
        "../../artifacts/dashboard/src/pages/HaulagePageFull.tsx",
        "../../artifacts/dashboard/src/pages/HelpCentre.tsx",
        "../../artifacts/dashboard/src/pages/HerdHealthRegisterPage.tsx",
        "../../artifacts/dashboard/src/pages/InspectionsPageFull.tsx",
        "../../artifacts/dashboard/src/pages/InspectionViewPage.tsx",
        "../../artifacts/dashboard/src/pages/InsurancePage.tsx",
        "../../artifacts/dashboard/src/pages/LabourPage.tsx",
        "../../artifacts/dashboard/src/pages/LivestockHealthDashboard.tsx",
        "../../artifacts/dashboard/src/pages/LivestockPage.tsx",
        "../../artifacts/dashboard/src/pages/Login.tsx",
        "../../artifacts/dashboard/src/pages/LookupListsPage.tsx",
        "../../artifacts/dashboard/src/pages/MedicinePage.tsx",
        "../../artifacts/dashboard/src/pages/ModulePage.tsx",
        "../../artifacts/dashboard/src/pages/Movements.tsx",
        "../../artifacts/dashboard/src/pages/MultiFarmGroupPage.tsx",
        "../../artifacts/dashboard/src/pages/NMPPage.tsx",
        "../../artifacts/dashboard/src/pages/not-found.tsx",
        "../../artifacts/dashboard/src/pages/NVZDashboard.tsx",
        "../../artifacts/dashboard/src/pages/NVZPage.tsx",
        "../../artifacts/dashboard/src/pages/OnboardingPage.tsx",
        "../../artifacts/dashboard/src/pages/OrganicArablePage.tsx",
        "../../artifacts/dashboard/src/pages/OrganicDairyPage.tsx",
        "../../artifacts/dashboard/src/pages/OrganicFreshProducePage.tsx",
        "../../artifacts/dashboard/src/pages/OrganicGoatDairyPage.tsx",
        "../../artifacts/dashboard/src/pages/OrganicJohnesTab.tsx",
        "../../artifacts/dashboard/src/pages/OrganicLivestockPage.tsx",
        "../../artifacts/dashboard/src/pages/OrganicPage.tsx",
        "../../artifacts/dashboard/src/pages/OrganicSheepDairyPage.tsx",
        "../../artifacts/dashboard/src/pages/OrganicVenisonPage.tsx",
        "../../artifacts/dashboard/src/pages/OrganicViticulturePage.tsx",
        "../../artifacts/dashboard/src/pages/PigProductionPage.tsx",
        "../../artifacts/dashboard/src/pages/PoultryProductionPage.tsx",
        "../../artifacts/dashboard/src/pages/RiskAssessmentsPage.tsx",
        "../../artifacts/dashboard/src/pages/SalesTradingPage.tsx",
        "../../artifacts/dashboard/src/pages/SeasonReportsPage.tsx",
        "../../artifacts/dashboard/src/pages/SeedStorePage.tsx",
        "../../artifacts/dashboard/src/pages/SelectContext.tsx",
        "../../artifacts/dashboard/src/pages/SettingsPage.tsx",
        "../../artifacts/dashboard/src/pages/SFIPage.tsx",
        "../../artifacts/dashboard/src/pages/SheepDairyPage.tsx",
        "../../artifacts/dashboard/src/pages/SheepProductionPage.tsx",
        "../../artifacts/dashboard/src/pages/SoilDashboard.tsx",
        "../../artifacts/dashboard/src/pages/SoilSensorsTab.tsx",
        "../../artifacts/dashboard/src/pages/SoilTestsPage.tsx",
        "../../artifacts/dashboard/src/pages/SprayPage.tsx",
        "../../artifacts/dashboard/src/pages/StaffTrainingPage.tsx",
        "../../artifacts/dashboard/src/pages/Staff.tsx",
        "../../artifacts/dashboard/src/pages/StorageLocationsPage.tsx",
        "../../artifacts/dashboard/src/pages/SuppliersStock.tsx",
        "../../artifacts/dashboard/src/pages/SupportPage.tsx",
        "../../artifacts/dashboard/src/pages/TaskBoardPage.tsx",
        "../../artifacts/dashboard/src/pages/TradeHistory.tsx",
        "../../artifacts/dashboard/src/pages/VenisonProductionPage.tsx",
        "../../artifacts/dashboard/src/pages/VetLedgerPage.tsx",
        "../../artifacts/dashboard/src/pages/ViticulturePage.tsx",
        "../../artifacts/dashboard/src/pages/WasteDisposalPage.tsx",
        "../../artifacts/dashboard/src/pages/WaterIrrigationPage.tsx",
        "../../artifacts/dashboard/src/pages/WeatherPageFull.tsx",
        "../../artifacts/dashboard/src/pages/WeekAheadPage.tsx",
        "../../artifacts/dashboard/src/pages/WorkshopPage.tsx",
      ],
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
