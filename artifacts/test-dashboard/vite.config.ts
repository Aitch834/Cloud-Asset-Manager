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
      // Point @ to the main dashboard's src so all its imports resolve correctly
      "@": path.resolve(import.meta.dirname, "../dashboard/src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      // Force all React ecosystem packages to resolve from this package's root,
      // preventing duplicate React instances when dashboard source files are loaded
      "react": path.resolve(import.meta.dirname, "node_modules/react"),
      "react/jsx-runtime": path.resolve(import.meta.dirname, "node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(import.meta.dirname, "node_modules/react/jsx-dev-runtime"),
      "react-dom": path.resolve(import.meta.dirname, "node_modules/react-dom"),
      "react-dom/client": path.resolve(import.meta.dirname, "node_modules/react-dom/client"),
      "@tanstack/react-query": path.resolve(import.meta.dirname, "node_modules/@tanstack/react-query"),
      "react-hook-form": path.resolve(import.meta.dirname, "node_modules/react-hook-form"),
      "wouter": path.resolve(import.meta.dirname, "node_modules/wouter"),
      // Zustand: alias each sub-path to its ESM file so Vite can pre-bundle it
      // without needing zustand in test-dashboard's node_modules. All sub-paths
      // must be covered because esm/index.mjs imports 'zustand/vanilla' etc.
      "zustand/vanilla": path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/vanilla.mjs"),
      "zustand/react": path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/react.mjs"),
      "zustand/middleware": path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/middleware.mjs"),
      "zustand/traditional": path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/traditional.mjs"),
      "zustand/shallow": path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/shallow.mjs"),
      "zustand": path.resolve(import.meta.dirname, "../dashboard/node_modules/zustand/esm/index.mjs"),
    },
    dedupe: [
      "react",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-dom/client",
      "@tanstack/react-query",
      "react-hook-form",
      "wouter",
      "zustand",
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
    ],
  },
  root: path.resolve(import.meta.dirname),
  // Serve static assets (images, favicon) from the main dashboard's public directory
  publicDir: path.resolve(import.meta.dirname, "../dashboard/public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      // Allow serving files from the monorepo root so dashboard src files are accessible
      allow: [path.resolve(import.meta.dirname, "../..")],
      strict: true,
      deny: ["**/.*"],
    },
  },
  // Bake bypass vars in at build time — always active in the test dashboard
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
