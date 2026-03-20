import { chromium } from "@playwright/test";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../public/help-images");

const DOMAIN = process.env.REPLIT_DEV_DOMAIN || "230073b1-276c-4091-bba8-105b69977d73-00-1ccw49869lfsj.kirk.replit.dev";
const BASE = `https://${DOMAIN}/test-dashboard`;

const PAGES = [
  { path: "/dashboard",        file: "dashboard-overview.png",  label: "Dashboard Overview" },
  { path: "/sprays",           file: "spray-records.png",       label: "Spray Records" },
  { path: "/fields",           file: "field-register.png",      label: "Field Register" },
  { path: "/movements",        file: "livestock-movements.png", label: "Livestock Movements" },
  { path: "/financial",        file: "financial-records.png",   label: "Financial Records" },
  { path: "/business-reports", file: "business-reports.png",    label: "Business Reports" },
  { path: "/medicine",         file: "medicine-records.png",    label: "Medicine Records" },
  { path: "/help",             file: "help-centre.png",         label: "Help Centre" },
];

const CHROMIUM_PATH = "/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROMIUM_PATH,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();

for (const { path: pagePath, file, label } of PAGES) {
  const url = `${BASE}${pagePath}`;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 25000 });
    await page.waitForTimeout(2000);
    const outPath = path.join(OUT, file);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✓ ${label} → ${outPath}`);
  } catch (err) {
    console.error(`✗ ${label}: ${err.message}`);
  }
}

await browser.close();
console.log("Done. Screenshots saved to:", OUT);
