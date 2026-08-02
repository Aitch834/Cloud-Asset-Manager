import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { randomBytes } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "dist/public");
const port = Number(process.env.PORT) || 3000;
const base = (process.env.BASE_PATH || "/dashboard/").replace(/\/$/, "");

// New token every restart — guaranteed-unique URL the proxy has never cached
const startupToken = Date.now().toString(36) + "-" + randomBytes(4).toString("hex");

const app = express();

app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("Expires", "0");
  next();
});

// Static hashed assets — query string ignored by express.static, so
// index-abc.js?v=<token> resolves to index-abc.js on disk
app.use(base, express.static(dist, { etag: false, lastModified: false, index: false }));

// Build the SPA HTML once at startup.
// Cache-busting strategy:
//   • JS/CSS assets are content-hashed by Vite (index-<hash>.js), so every
//     rebuild already produces proxy-fresh URLs. Do NOT append ?v=<token> to
//     them: lazy chunks import the shared bundle by its plain filename, so a
//     tokenised entry URL makes the browser load the SAME file twice as two
//     different modules → two React instances → React error #321 (invalid
//     hook call) on every page load.
//   • A tiny inline redirect script makes the browser itself request
//     the page at ?_v=<token>.  Even if the proxy serves stale HTML,
//     that old HTML still contains a redirect script (with its own old
//     token) that sends the browser to a fresh URL the proxy never cached.
const rawHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const assetHtml = rawHtml;

// Inline redirect script — placed as the very first thing in <head>
// so it fires before any module script and before React loads.
// • If the URL already has the current token → do nothing.
// • Otherwise → hard-redirect to the same path with current token,
//   which is a fresh (uncached) URL on the proxy.
const redirectScript = `<script>
(function(){
  var t='_v=${startupToken}';
  if(window.location.search.indexOf(t)===-1){
    var sep=window.location.search?'&':'?';
    window.location.replace(window.location.pathname+window.location.search+sep+t+(window.location.hash||''));
  }
})();
</script>`;

// Non-compressible random padding — random bytes in hex have high entropy
// and don't compress well, keeping the response above 500 KB even gzipped
const pad = randomBytes(350000).toString("hex"); // ~700 KB hex
const html = assetHtml
  .replace("<head>", "<head>" + redirectScript)
  .replace("</body>", `<!-- pad:${pad} -->\n</body>`);

// SPA fallback
app.use((_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Dashboard serving on port ${port} at ${base} (token: ${startupToken})`);
});
