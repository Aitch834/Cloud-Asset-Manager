import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "dist/public");
const port = Number(process.env.PORT) || 3000;
const base = (process.env.BASE_PATH || "/dashboard/").replace(/\/$/, "");

const app = express();

// Read index.html and pad it to >500KB so the Replit proxy never caches it
const rawHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const pad = "<!-- replit-no-cache: " + "x".repeat(600000) + " -->";
const html = rawHtml.replace("</body>", pad + "\n</body>");

// No-cache headers on every response
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("Expires", "0");
  next();
});

// Hashed static assets
app.use(base, express.static(dist, { etag: false, lastModified: false, index: false }));

// SPA fallback — all routes serve padded index.html
app.use((req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Dashboard serving on port ${port} at ${base}`);
});
