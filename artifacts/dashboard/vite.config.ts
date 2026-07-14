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

// Plugin: prevent stale cross-session module cache hits from Replit's proxy.
//
// ROOT CAUSE: Replit's preview proxy caches module responses keyed on URL PATH
// only — it ignores Cache-Control headers. This means source files and dep chunks
// served by Vite get cached by the proxy across server restarts, so browsers
// receive stale content even after a hard refresh or in a private window.
//
// FIX: embed a per-session token INSIDE the URL path for @fs/ source-file URLs.
// Each server restart generates a new token → new URL path → proxy cache miss →
// fresh content served every session.
function sessionCacheBustPlugin(sessionBase: string) {
  let sessionToken =
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);

  const escapedBase = sessionBase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Rewrite @fs/ source-file URLs inside compiled JS to embed session token.
  const fsUrlRe = new RegExp(
    `"(${escapedBase}@fs/[^"?#]+)(?:\\?[^"]*)?"`,
    "g",
  );

  // Rewrite /src/ source-file URLs (files inside the project root).
  // These use /dashboard/src/Foo.tsx?t=TIMESTAMP — proxy ignores the query
  // param and caches by path, so we embed the session token in the path instead.
  const srcUrlRe = new RegExp(
    `"(${escapedBase}src/[^"?#]+)(?:\\?[^"]*)?"`,
    "g",
  );

  // Rewrite dep-chunk URLs to embed session token so proxy always misses.
  const depsUrlRe = new RegExp(
    `"${escapedBase}node_modules/\\.vite/deps/([^"?#]+)(?:\\?[^"]*)?"`,
    "g",
  );

  // Rewrite the <script type="module" src="…"> entry in HTML.
  const scriptSrcRe = /(<script\b[^>]*type="module"[^>]*src=")([^"?#]+)(")/g;

  // Strip /<base>@td/<token>/ from incoming requests.
  const tdPathRe = new RegExp(`^${escapedBase}@td/[^/]+/`);
  // Strip tokenised dep-chunk URLs.
  const tdDepsNonceRe = new RegExp(`^${escapedBase}@td/[^/]+/@deps-[^/]+/`);
  const depsBase = `${sessionBase}node_modules/.vite/deps/`;

  function interceptText(res: any, transform: (body: string) => string) {
    const chunks: Buffer[] = [];
    const _end: typeof res.end = res.end.bind(res);
    res.write = (chunk: any, enc?: any, cb?: any) => {
      if (chunk != null)
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      if (typeof enc === "function") enc();
      else if (typeof cb === "function") cb();
      return true;
    };
    res.end = (chunk?: any, enc?: any, cb?: any) => {
      if (chunk != null)
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const body = transform(Buffer.concat(chunks).toString("utf-8"));
      if (!res.headersSent) res.removeHeader("content-length");
      const done =
        typeof enc === "function"
          ? enc
          : typeof cb === "function"
            ? cb
            : undefined;
      return _end(body, "utf-8", done);
    };
  }

  return {
    name: "session-cache-bust",
    apply: "serve" as const,

    configureServer(server: any) {
      // Regen token + invalidate module graph on full-reload (dep re-optimisation).
      const regenToken = () => {
        let count = 0;
        if (server.environments) {
          const envs: any[] =
            server.environments instanceof Map
              ? Array.from((server.environments as Map<string, any>).values())
              : Object.values(server.environments as Record<string, any>);
          for (const env of envs) {
            if (typeof env?.moduleGraph?.invalidateAll === "function") {
              env.moduleGraph.invalidateAll();
              count++;
            }
          }
        }
        const legacy = (server as any).moduleGraph?.invalidateAll;
        if (typeof legacy === "function") { legacy.call((server as any).moduleGraph); count++; }
        sessionToken =
          Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
        console.log(`[session-cache-bust] new token=${sessionToken} (invalidated ${count} graphs)`);
      };

      if (server.hot?.send) {
        const orig = server.hot.send.bind(server.hot);
        server.hot.send = (event: any, data?: any) => {
          if (
            event === "vite:beforeFullReload" ||
            (typeof event === "object" && event?.type === "full-reload")
          ) regenToken();
          return orig(event, data);
        };
      }
      if (server.ws?.send) {
        const orig = server.ws.send.bind(server.ws);
        server.ws.send = (payload: any, ...rest: any[]) => {
          if (typeof payload === "object" && payload?.type === "full-reload") regenToken();
          return orig(payload, ...rest);
        };
      }

      server.middlewares.use((req: any, res: any, next: any) => {
        const rawUrl = (req.url as string) ?? "";

        // Force Cache-Control: no-store on ALL responses — override Vite's
        // max-age=immutable on dep chunks before Vite's own middleware runs.
        const isModuleUrl =
          rawUrl.includes("/.vite/deps/") ||
          rawUrl.includes("/@fs/") ||
          rawUrl.includes("/@td/") ||
          rawUrl.includes("/node_modules/") ||
          rawUrl.includes("/@vite/") ||
          rawUrl.includes("/@react-refresh") ||
          /\/src\/[^?]+\.(tsx?|jsx?|js)/.test(rawUrl) ||
          rawUrl === "/" ||
          rawUrl.endsWith("/") ||
          /\.html?(\?|$)/.test(rawUrl) ||
          (basePath != null && rawUrl.startsWith(basePath));

        if (isModuleUrl) {
          const origSet = (res.setHeader as Function).bind(res);
          res.setHeader = (name: string, value: any) => {
            if (typeof name === "string" && name.toLowerCase() === "cache-control")
              return origSet("Cache-Control", "no-store");
            return origSet(name, value);
          };
          const origWriteHead = (res.writeHead as Function).bind(res);
          res.writeHead = (statusCode: number, statusMessage?: any, headers?: any) => {
            let hdrs: Record<string, any> | undefined;
            let msg: string | undefined;
            if (typeof statusMessage === "string") { msg = statusMessage; hdrs = headers; }
            else if (statusMessage != null) hdrs = statusMessage;
            if (hdrs) {
              for (const k of Object.keys(hdrs))
                if (k.toLowerCase() === "cache-control") hdrs[k] = "no-store";
            }
            return msg !== undefined
              ? origWriteHead(statusCode, msg, hdrs)
              : origWriteHead(statusCode, hdrs);
          };
          (res.setHeader as Function)("Cache-Control", "no-store");
        }

        // Strip session token from incoming request URLs.
        if (rawUrl.includes("/@td/")) {
          if (tdDepsNonceRe.test(rawUrl)) {
            req.url = rawUrl.replace(tdDepsNonceRe, depsBase);
          } else {
            const stripped = rawUrl.replace(tdPathRe, sessionBase);
            req.url = stripped.replace(/\/@xfs(?:-[^/]+)?\//, "/@fs/");
          }
        }

        // Time-keyed startup token endpoint: /<base>__startup_token__/<unix5s>/
        // The timestamp component changes every 5 seconds — even if the proxy
        // caches the response by URL path, the key changes before it matters.
        const tokenPathRe2 = new RegExp(
          `^${escapedBase}__startup_token__/\\d+/`,
        );
        if (tokenPathRe2.test(rawUrl)) {
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify({ token: sessionToken }));
          return;
        }

        // HTML redirect: for any SPA route that does NOT already carry a session
        // prefix, serve a tiny invariant redirect page. That page fetches the
        // time-keyed token endpoint (proxy-immune) and bounces to
        //   /<base>@v/<token>/<original-sub-path>
        // which is a URL the proxy has never cached → fresh app HTML served.
        // Even if the proxy caches this redirect page forever it still works,
        // because the token fetch URL is different every 5 seconds.
        const isHtmlRoute =
          !rawUrl.includes("/@v/") &&
          !rawUrl.includes("/@td/") &&
          !rawUrl.includes("/__startup_token__") &&
          (rawUrl === sessionBase ||
            rawUrl.endsWith("/") ||
            /\.html?(\?|$)/.test(rawUrl) ||
            (basePath != null &&
              rawUrl.startsWith(basePath) &&
              !rawUrl.includes(".")));

        if (isHtmlRoute) {
          // `here` = sub-path relative to the base (e.g. "sheep-dairy" at /dashboard-v2/sheep-dairy).
          // Slice the base prefix off the pathname — do NOT use a regex that only
          // strips the @v/TOKEN/ portion, which left the full path in `here` and
          // produced doubled paths like /dashboard-v2/@v/TOKEN//dashboard-v2/sheep-dairy.
          const redirectHtml =
            `<!DOCTYPE html><html><head><meta charset="utf-8">` +
            `<title>Loading…</title><script>` +
            `(function(){` +
            `var base=${JSON.stringify(sessionBase)};` +
            `var t5=Math.floor(Date.now()/5000);` +
            `fetch(base+'__startup_token__/'+t5+'/',{cache:'no-store'})` +
            `.then(function(r){return r.json();})` +
            `.then(function(d){` +
            `var tok=encodeURIComponent(d.token||String(t5));` +
            `var here=window.location.pathname.slice(base.length);` +
            `window.location.replace(base+'@v/'+tok+'/'+here+window.location.search);` +
            `}).catch(function(){` +
            `window.location.replace(base+'@v/'+t5+'/');` +
            `});` +
            `})();` +
            `</script></head><body></body></html>`;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(redirectHtml);
          return;
        }

        // Strip /@v/<token>/ prefix from session-routed HTML requests so Vite
        // sees the canonical path and its SPA fallback works normally.
        // Flag the request so the rewrite middleware below knows to tokenise the HTML.
        if (rawUrl.includes("/@v/")) {
          (req as any)._sessionHtmlRoute = true;
          req.url = rawUrl.replace(
            new RegExp(`^${escapedBase}@v/[^/]+/?`),
            sessionBase,
          );
        }

        next();
      });

      // Rewrite @fs/ URLs and dep-chunk URLs in compiled JS/HTML responses
      // to embed the session token in the PATH (not query string).
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = (req.url as string) ?? "";
        const isJs =
          url.includes("/@fs/") ||
          url.includes("/@vite/") ||
          url.includes("/@react-refresh") ||
          /\/src\/[^?]+\.(tsx?|jsx?)/.test(url) ||
          url.includes("node_modules/.vite/deps/");
        // Only intercept HTML for @v/ session routes (flagged by the first middleware
        // after stripping the prefix). Regular /dashboard/ is handled by the redirect.
        const isHtml =
          !!(req as any)._sessionHtmlRoute &&
          (url === "/" ||
            url.endsWith("/") ||
            /\.html?(\?|$)/.test(url) ||
            (basePath != null && url.startsWith(basePath) && !url.includes(".")));

        if (isJs) {
          interceptText(res, (body) => {
            const depsToken = `@deps-${sessionToken}`;
            body = body.replace(depsUrlRe, (_m, file) =>
              `"${sessionBase}@td/${sessionToken}/@${depsToken}/${file}"`,
            );
            body = body.replace(fsUrlRe, (_m, cleanUrl) =>
              `"${sessionBase}@td/${sessionToken}/@xfs-${sessionToken}/${cleanUrl.slice(sessionBase.length + "@fs/".length)}"`,
            );
            // Rewrite /src/ URLs: /dashboard/src/Foo.tsx → /dashboard/@td/TOKEN/src/Foo.tsx
            // The proxy caches by path and ignores ?t= query params, so embedding
            // the token in the path guarantees a cache miss on each session.
            body = body.replace(srcUrlRe, (_m, cleanUrl) =>
              `"${sessionBase}@td/${sessionToken}/${cleanUrl.slice(sessionBase.length)}"`,
            );
            return body;
          });
        } else if (isHtml) {
          interceptText(res, (body) =>
            body.replace(scriptSrcRe, (_m, pre, src, post) => {
              // Only session-tokenise src/ entry scripts — leave @vite/client etc. alone.
              const newSrc = src.startsWith(`${sessionBase}src/`)
                ? `${sessionBase}@td/${sessionToken}/${src.slice(sessionBase.length)}`
                : src;
              return `${pre}${newSrc}${post}`;
            }),
          );
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    sessionCacheBustPlugin(basePath),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-query", "react-hook-form"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    headers: {
      "Cache-Control": "no-store",
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
