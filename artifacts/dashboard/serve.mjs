import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "dist/public");
const port = Number(process.env.PORT) || 3000;
const base = (process.env.BASE_PATH || "/dashboard/").replace(/\/$/, "");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader("Expires", "0");
  next();
});

app.use(base, express.static(dist, { etag: false, lastModified: false, index: false }));

app.use(`${base}/{*path}`, (_req, res) => {
  res.send(fs.readFileSync(path.join(dist, "index.html"), "utf8"));
});

app.use("/", (_req, res) => {
  res.send(fs.readFileSync(path.join(dist, "index.html"), "utf8"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Dashboard serving on port ${port} at ${base}`);
});
