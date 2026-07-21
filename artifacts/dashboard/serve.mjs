import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "dist/public");
const port = Number(process.env.PORT) || 3000;
const base = (process.env.BASE_PATH || "/dashboard/").replace(/\/$/, "");

// A new token every restart → proxy sees new asset URLs → guaranteed cache miss
const startupToken = Date.now().toString(36);

const app = express();

// No-cache headers on every response (belt-and-braces)
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("Expires", "0");
  next();
});

// Serve hashed static assets — Express strips the query string automatically,
// so requests for index-abc.js?v=<token> still resolve to index-abc.js on disk.
app.use(base, express.static(dist, { etag: false, lastModified: false, index: false }));

// Build the SPA HTML once on startup.
// Rewrite every .js and .css asset URL to include the startup token so the
// proxy is forced to fetch fresh on every server restart.
const rawHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const html = rawHtml
  .replace(/(src|href)="([^"]+\.(js|css))"/g, `$1="$2?v=${startupToken}"`)
  // pad to >500 KB as a secondary defence against proxy size-based caching
  .replace("</body>", `<!-- v:${startupToken} ${"x".repeat(520000)} -->\n</body>`);

// SPA fallback — all routes serve the token-stamped HTML
app.use((_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Dashboard serving on port ${port} at ${base} (token: ${startupToken})`);
});
