import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { randomBytes } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "dist/public");
const port = Number(process.env.PORT) || 3000;
const base = (process.env.BASE_PATH || "/test-dashboard").replace(/\/$/, "");

const startupToken = Date.now().toString(36) + "-" + randomBytes(4).toString("hex");

// MIME types for static assets
const MIME = {
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

// Build the SPA HTML once at startup with token-redirect + non-compressible padding
const rawHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const assetHtml = rawHtml.replace(
  /(src|href)="([^"]+\.(js|css))"/g,
  `$1="$2?v=${startupToken}"`
);
const redirectScript = `<script>(function(){var t='_v=${startupToken}';if(window.location.search.indexOf(t)===-1){var sep=window.location.search?'&':'?';window.location.replace(window.location.pathname+window.location.search+sep+t+(window.location.hash||''));}})()</script>`;
const pad = randomBytes(350000).toString("hex"); // ~700 KB non-compressible
const html = assetHtml
  .replace("<head>", "<head>" + redirectScript)
  .replace("</body>", `<!-- pad:${pad} -->\n</body>`);

const NO_CACHE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

const server = http.createServer((req, res) => {
  // Strip base path prefix and query string for file lookup
  let urlPath = req.url || "/";
  const qIdx = urlPath.indexOf("?");
  if (qIdx !== -1) urlPath = urlPath.slice(0, qIdx);
  if (urlPath.startsWith(base + "/")) urlPath = urlPath.slice(base.length);
  else if (urlPath === base) urlPath = "/";

  // Try to serve a static file
  if (urlPath !== "/" && urlPath !== "") {
    const filePath = path.join(dist, urlPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = MIME[ext] || "application/octet-stream";
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { ...NO_CACHE, "Content-Type": mime });
      res.end(content);
      return;
    }
  }

  // SPA fallback — serve padded token-stamped HTML
  res.writeHead(200, { ...NO_CACHE, "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Test-dashboard serving on port ${port} at ${base} (token: ${startupToken})`);
});
