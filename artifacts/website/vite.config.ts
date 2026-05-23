import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import http from "http";

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

// Port where the Expo Metro dev server listens (artifacts/mobile localPort).
const MOBILE_PORT = 18115;

// Vite proxy configure helper: rewrites the Origin header to localhost before
// the request reaches Metro. Metro's CorsMiddleware rejects any origin that
// isn't localhost, so requests proxied from the external Replit domain would
// otherwise fail with 401/500.
function metroOriginFix(proxy: import("http-proxy").Server) {
  proxy.on("proxyReq", (proxyReq) => {
    proxyReq.setHeader("origin", `http://localhost:${MOBILE_PORT}`);
  });
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    // Expo-subdomain proxy plugin.
    //
    // Replit routes ALL traffic — including the *.expo.* subdomain — to the
    // app sitting at "/".  When a request arrives with a Host header that
    // contains ".expo.", it came from the Expo preview iframe and must be
    // forwarded to Metro rather than served as the website.  This middleware
    // runs before Vite's own router so it takes full priority.
    {
      name: "expo-subdomain-proxy",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const host = req.headers.host ?? "";
          if (!host.includes(".expo.")) {
            return next();
          }

          const upstream = http.request(
            {
              hostname: "127.0.0.1",
              port: MOBILE_PORT,
              path: req.url,
              method: req.method,
              headers: {
                ...req.headers,
                host: `localhost:${MOBILE_PORT}`,
                // Metro's CorsMiddleware only trusts localhost origins.
                // Rewrite origin so Metro accepts the proxied request.
                origin: `http://localhost:${MOBILE_PORT}`,
              },
            },
            (proxyRes) => {
              res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
              proxyRes.pipe(res, { end: true });
            },
          );

          upstream.on("error", () => {
            if (!res.headersSent) {
              res.writeHead(502);
              res.end("Mobile dev server unavailable");
            }
          });

          req.pipe(upstream, { end: true });
        });
      },
    },
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
    dedupe: ["react", "react-dom"],
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
    // Gateway proxy: the external Replit preview proxy only reliably routes
    // traffic to the app sitting at "/". All other apps' paths are forwarded
    // here by the platform and then proxied on to the correct local port.
    //
    // Metro (mobile) also needs entries for its asset paths because the HTML
    // it serves at /mobile/ references root-relative paths like
    // /node_modules/.pnpm/... and /_expo/... that must reach Metro, not Vite.
    proxy: {
      // Expo static assets (fonts, media) served by Metro under /_expo/.
      "/_expo": {
        target: `http://localhost:${MOBILE_PORT}`,
        changeOrigin: true,
        configure: metroOriginFix,
      },
      // Metro JS bundles — pnpm serves them at long /node_modules/.pnpm/...
      // paths. Vite's fs.deny blocks .pnpm (hidden dir) anyway, so this is
      // safe and cannot conflict with Vite's own module serving.
      "/node_modules/.pnpm": {
        target: `http://localhost:${MOBILE_PORT}`,
        changeOrigin: true,
        configure: metroOriginFix,
      },
      // Metro asset serving (fonts, vector-icon .ttf files, images).
      // Metro uses /assets/?unstable_path=... for all font/asset requests.
      // Vite dev mode never serves anything at /assets/ itself (that is only
      // a production-build output path), so this proxy is safe.
      "/assets": {
        target: `http://localhost:${MOBILE_PORT}`,
        changeOrigin: true,
        configure: metroOriginFix,
      },
      // Mobile app HTML entry point.
      "/mobile": {
        target: `http://localhost:${MOBILE_PORT}`,
        changeOrigin: true,
        ws: true,
        configure: metroOriginFix,
      },
      "/test-dashboard": {
        target: "http://localhost:18652",
        changeOrigin: true,
        ws: true,
      },
      "/dashboard": {
        target: "http://localhost:23183",
        changeOrigin: true,
        ws: true,
      },
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
