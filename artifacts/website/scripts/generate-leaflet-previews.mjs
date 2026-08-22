/**
 * Generates preview images for every page in the current sector leaflets.
 *
 * The leaflet HTML is the source of truth. Each element with class="page" is
 * rendered independently so the lightbox always stays in sync when a leaflet
 * gains or loses pages.
 */

import pkg from "/home/runner/workspace/node_modules/.pnpm/playwright-core@1.62.1/node_modules/playwright-core/index.js";
const { chromium } = pkg;
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const leafletsDir = path.resolve(__dirname, "../public/leaflets");
const imagesDir = path.join(leafletsDir, "img");
const manifestPath = path.join(imagesDir, "manifest.json");

const LEAFLETS = [
  "beef-dairy-v7",
  "sheep-goat-v7",
  "arable-v7",
  "viticulture-v7",
  "mixed-v7",
  "contracting-v7",
];

const CHROMIUM_PATH =
  "/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome";

async function main() {
  if (!fs.existsSync(CHROMIUM_PATH)) {
    console.warn(
      `⚠  Leaflet preview generation skipped: Chromium not found at ${CHROMIUM_PATH}.\n` +
        "   Existing preview images remain in place.",
    );
    return;
  }

  fs.mkdirSync(imagesDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const manifest = {};

  try {
    for (const leaflet of LEAFLETS) {
      const htmlPath = path.join(leafletsDir, `${leaflet}.html`);
      if (!fs.existsSync(htmlPath)) {
        console.warn(`  SKIP: ${htmlPath} not found`);
        continue;
      }

      const page = await browser.newPage({
        viewport: { width: 559, height: 900 },
        deviceScaleFactor: 1,
      });
      await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });

      const leafletPages = page.locator(".page");
      const pageCount = await leafletPages.count();
      if (pageCount === 0) {
        await page.close();
        throw new Error(`${leaflet}.html does not contain an element with class="page"`);
      }

      const id = leaflet.replace(/-v7$/, "");
      const pageUrls = [];
      for (let index = 0; index < pageCount; index += 1) {
        const imageName = `${id}-${index + 1}.jpg`;
        const imagePath = path.join(imagesDir, imageName);
        await leafletPages.nth(index).screenshot({
          path: imagePath,
          type: "jpeg",
          quality: 85,
        });
        pageUrls.push(`/leaflets/img/${imageName}`);
      }

      manifest[id] = pageUrls;
      await page.close();
      console.log(`  ✓ ${id}: ${pageCount} page${pageCount === 1 ? "" : "s"}`);
    }
  } finally {
    await browser.close();
  }

  // Remove generated page images that belonged to a previous page count.
  for (const filename of fs.readdirSync(imagesDir)) {
    if (!/^[a-z-]+-\d+\.jpg$/.test(filename)) continue;
    const id = filename.replace(/-\d+\.jpg$/, "");
    const isCurrentImage = manifest[id]?.some((url) => url.endsWith(`/${filename}`));
    if (!isCurrentImage) fs.rmSync(path.join(imagesDir, filename));
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify({ version: 1, pages: manifest }, null, 2)}\n`);
  console.log(`Wrote ${manifestPath}`);
}

main().catch((error) => {
  console.error("Leaflet preview generation failed:", error);
  process.exit(1);
});