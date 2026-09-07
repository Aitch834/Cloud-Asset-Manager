/**
 * Generates the cover thumbnail aliases used by the sector page.
 *
 * The newest versioned leaflet for each sector is selected automatically, so
 * publishing a new `*-vN.html` file only requires running this script again.
 *
 * Run with:
 *   pnpm --filter @workspace/website run generate:leaflet-thumbnails
 */

import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import { loadLeafletBrowserRuntime } from "./leaflet-browser-runtime.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const leafletsDir = path.resolve(__dirname, "../public/leaflets");
const imagesDir = path.join(leafletsDir, "img");

function findLatestLeaflets() {
  const latestBySector = new Map();

  for (const filename of fs.readdirSync(leafletsDir)) {
    const match = filename.match(/^(.+)-v(\d+)\.html$/);
    if (!match) continue;

    const [, sector, versionText] = match;
    const version = Number(versionText);
    const current = latestBySector.get(sector);
    if (!current || version > current.version) {
      latestBySector.set(sector, { filename, version });
    }
  }

  return [...latestBySector.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sector, { filename, version }]) => ({ sector, filename, version }));
}

async function main() {
  const leaflets = findLatestLeaflets();
  if (leaflets.length === 0) {
    throw new Error(`No versioned leaflet HTML files found in ${leafletsDir}`);
  }

  const browserRuntime = await loadLeafletBrowserRuntime("thumbnail");
  if (!browserRuntime) return;

  fs.mkdirSync(imagesDir, { recursive: true });
  const browser = await browserRuntime.chromium.launch({
    executablePath: browserRuntime.executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const { sector, filename, version } of leaflets) {
      const htmlPath = path.join(leafletsDir, filename);
      const imagePath = path.join(imagesDir, `${sector}.jpg`);
      const page = await browser.newPage({
        viewport: { width: 559, height: 900 },
        deviceScaleFactor: 1,
      });

      try {
        await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts?.ready);

        const cover = page.locator(".page").first();
        if ((await page.locator(".page").count()) === 0) {
          throw new Error(`${filename} does not contain an element with class="page"`);
        }

        await cover.screenshot({
          path: imagePath,
          type: "jpeg",
          quality: 85,
        });
      } finally {
        await page.close();
      }

      const { size } = fs.statSync(imagePath);
      console.log(`  ✓ ${sector}.jpg from ${filename} (v${version}, ${(size / 1024).toFixed(0)} KB)`);
    }
  } finally {
    await browser.close();
  }

  console.log(`Generated ${leaflets.length} leaflet cover thumbnail${leaflets.length === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error("Leaflet thumbnail generation failed:", error);
  process.exit(1);
});