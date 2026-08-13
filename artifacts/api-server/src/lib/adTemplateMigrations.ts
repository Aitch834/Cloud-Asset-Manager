import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname is not defined in ESM (tsx dev) — derive it from import.meta.url instead.
// In production esbuild CJS bundles __dirname is injected by bundler, so this shim
// is only active in the dev tsx path.
const __esmDirname = (() => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    // Fallback: production CJS bundle where __dirname is available globally
    return typeof __dirname !== "undefined" ? __dirname : process.cwd();
  }
})();

/** Extract the first base64 data-URI src from an img tag matching the given alt text */
function extractAdB64ByAlt(html: string, altText: string): string {
  const escaped = altText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = html.match(
    new RegExp(
      `<img[^>]*alt="${escaped}"[^>]*src="(data:[^"]+)"|<img[^>]*src="(data:[^"]+)"[^>]*alt="${escaped}"`,
    ),
  );
  return m ? (m[1] ?? m[2] ?? "") : "";
}

/** Extract the first base64 data-URI src from an img tag matching the given CSS class */
function extractAdB64ByClass(html: string, className: string): string {
  // Match <img class="logo" src="data:..."> or where class appears among others
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = html.match(
    new RegExp(`<img[^>]*class="[^"]*\\b${escaped}\\b[^"]*"[^>]*src="(data:[^"]+)"|<img[^>]*src="(data:[^"]+)"[^>]*class="[^"]*\\b${escaped}\\b[^"]*"`),
  );
  return m ? (m[1] ?? m[2] ?? "") : "";
}

/**
 * Idempotent migrations for the ad_templates table.
 * Safe to run on every startup — uses CREATE TABLE IF NOT EXISTS.
 * Seeds the two default viticulture templates if the table is empty,
 * and upgrades any already-seeded templates that pre-date placeholder support.
 * Also seeds the BDE logo and QR code into platform_config from the legacy
 * on-disk HTML files so templates render correctly after those files are removed.
 */
export async function runAdTemplateMigrations(): Promise<void> {
  // ad_copy_presets — named reusable copy+colour sets for the Ad PDF Generator
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ad_copy_presets (
      id          serial PRIMARY KEY,
      name        text NOT NULL,
      headline    text NOT NULL DEFAULT '',
      body        text NOT NULL DEFAULT '',
      accent_color text NOT NULL DEFAULT '',
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS ad_templates (
      id          serial PRIMARY KEY,
      name        text NOT NULL,
      slug        text NOT NULL,
      width_mm    integer NOT NULL,
      height_mm   integer NOT NULL,
      html_body   text NOT NULL,
      is_default  boolean NOT NULL DEFAULT false,
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    )
  `);

  // Soft-delete support: non-null archived_at means the template is retired
  await db.execute(sql`ALTER TABLE ad_templates ADD COLUMN IF NOT EXISTS archived_at timestamptz`);

  // Replace any unconditional UNIQUE constraint on slug with a partial unique index
  // so that only non-archived (active) templates must have unique slugs. This allows
  // an archived template's slug to be reused by a newly created template.
  // Two possible constraint names to cover:
  //   - ad_templates_slug_key   — PostgreSQL's auto-generated name from `slug text NOT NULL UNIQUE`
  //   - ad_templates_slug_unique — Drizzle ORM's generated name from .unique()
  await db.execute(sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ad_templates_slug_key'
          AND conrelid = 'ad_templates'::regclass
      ) THEN
        ALTER TABLE ad_templates DROP CONSTRAINT ad_templates_slug_key;
      END IF;
      IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'ad_templates_slug_unique'
          AND conrelid = 'ad_templates'::regclass
      ) THEN
        ALTER TABLE ad_templates DROP CONSTRAINT ad_templates_slug_unique;
      END IF;
    END $$
  `);
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS ad_templates_slug_active_unique
      ON ad_templates (slug)
      WHERE archived_at IS NULL
  `);

  // Seed default templates only if none exist
  const existing = await db.execute(sql`SELECT id FROM ad_templates LIMIT 1`);
  if ((existing as { rows: unknown[] }).rows.length === 0) {
    await db.execute(sql`
      INSERT INTO ad_templates (name, slug, width_mm, height_mm, html_body, is_default)
      VALUES
        (${VITICULTURE_HORIZONTAL_NAME}, 'viticulture-horizontal', 190, 133, ${VITICULTURE_HORIZONTAL_HTML}, true),
        (${VITICULTURE_PORTRAIT_NAME},   'viticulture-portrait',   90,  267, ${VITICULTURE_PORTRAIT_HTML},   false)
    `);
    console.log("[AD-TEMPLATE-MIGRATE] Seeded default viticulture templates");
    // Fall through — still need to seed brand assets into platform_config
  }

  // Upgrade pre-placeholder templates: if html_body still contains the old
  // hardcoded accent colour it has never been migrated — replace with the
  // current placeholder-aware version.
  const hRow = await db.execute(sql`
    SELECT id FROM ad_templates
    WHERE slug = 'viticulture-horizontal'
      AND html_body LIKE '%#C49A6C%'
    LIMIT 1
  `);
  if ((hRow as { rows: unknown[] }).rows.length > 0) {
    await db.execute(sql`
      UPDATE ad_templates
      SET html_body = ${VITICULTURE_HORIZONTAL_HTML}, updated_at = now()
      WHERE slug = 'viticulture-horizontal'
    `);
    console.log("[AD-TEMPLATE-MIGRATE] Upgraded viticulture-horizontal to placeholder version");
  }

  const pRow = await db.execute(sql`
    SELECT id FROM ad_templates
    WHERE slug = 'viticulture-portrait'
      AND html_body LIKE '%#C49A6C%'
    LIMIT 1
  `);
  if ((pRow as { rows: unknown[] }).rows.length > 0) {
    await db.execute(sql`
      UPDATE ad_templates
      SET html_body = ${VITICULTURE_PORTRAIT_HTML}, updated_at = now()
      WHERE slug = 'viticulture-portrait'
    `);
    console.log("[AD-TEMPLATE-MIGRATE] Upgraded viticulture-portrait to placeholder version");
  }

  // ── Seed brand assets (logo + QR) into platform_config ────────────────────
  // Only writes if the key is missing or empty — never overwrites an admin upload.
  await seedAdBrandAssets();
}

/**
 * Extract the BDE logo and QR code data-URIs from the legacy on-disk ad-template
 * HTML files and persist them into platform_config so they survive file removal.
 * Idempotent: skips any key that already has a non-empty value in the DB.
 */
/**
 * Resolve the legacy ad-templates directory, trying multiple candidate paths so
 * the migration works regardless of whether the process CWD is the api-server
 * package root or the monorepo root, and regardless of __dirname in dev (src/lib)
 * vs the production bundle (dist/).
 */
function resolveAdTemplatesDir(): string | null {
  const candidates = [
    // CWD = artifacts/api-server/ (pnpm script context)
    path.resolve(process.cwd(), "scripts/ad-templates"),
    // CWD = monorepo root (some deployment contexts)
    path.resolve(process.cwd(), "artifacts/api-server/scripts/ad-templates"),
    // __esmDirname = artifacts/api-server/dist/ (production esbuild bundle)
    path.resolve(__esmDirname, "../scripts/ad-templates"),
    // __esmDirname = artifacts/api-server/src/lib/ (dev tsx)
    path.resolve(__esmDirname, "../../scripts/ad-templates"),
  ];
  return candidates.find((d) => fs.existsSync(d)) ?? null;
}

async function seedAdBrandAssets(): Promise<void> {
  const srcDir = resolveAdTemplatesDir();
  if (!srcDir) {
    // Files already removed or not found — nothing to seed from; DB values (if any) remain
    console.log("[AD-TEMPLATE-MIGRATE] Legacy ad-templates directory not found — skipping brand asset seed");
    return;
  }

  const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".html"));
  if (files.length === 0) return;

  // Extract logo (class="logo") and QR (alt text) from whichever file has them.
  // The legacy HTML files use class="logo" on the logo img (no alt attribute)
  // and alt="QR — bdefarmtrac.co.uk" on the QR img.
  let logoUri = "";
  let qrUri   = "";
  for (const f of files) {
    const html = fs.readFileSync(path.join(srcDir, f), "utf-8");
    if (!logoUri) logoUri = extractAdB64ByClass(html, "logo");
    if (!qrUri)   qrUri   = extractAdB64ByAlt(html, "QR \u2014 bdefarmtrac.co.uk");
    if (logoUri && qrUri) break;
  }

  // Upsert each asset only when the DB row is missing or blank
  const LOGO_KEY = "brand.adLogoDataUrl";
  const QR_KEY   = "brand.adQrDataUrl";

  if (logoUri) {
    await db.execute(sql`
      INSERT INTO platform_config (key, value, label, description, updated_at)
      VALUES (
        ${LOGO_KEY},
        ${logoUri},
        ${"Ad Template — BDE Logo (Data URL)"},
        ${"Base64-encoded BDE Farm Trac logo used in ad PDF templates. Upload a PNG or SVG via the Ad PDF Generator page."},
        now()
      )
      ON CONFLICT (key) DO UPDATE
        SET value      = EXCLUDED.value,
            updated_at = now()
        WHERE platform_config.value = ''
    `);
    console.log("[AD-TEMPLATE-MIGRATE] Seeded brand.adLogoDataUrl into platform_config");
  }

  if (qrUri) {
    await db.execute(sql`
      INSERT INTO platform_config (key, value, label, description, updated_at)
      VALUES (
        ${QR_KEY},
        ${qrUri},
        ${"Ad Template — QR Code (Data URL)"},
        ${"Base64-encoded QR code pointing to bdefarmtrac.co.uk used in ad PDF templates. Upload a PNG via the Ad PDF Generator page."},
        now()
      )
      ON CONFLICT (key) DO UPDATE
        SET value      = EXCLUDED.value,
            updated_at = now()
        WHERE platform_config.value = ''
    `);
    console.log("[AD-TEMPLATE-MIGRATE] Seeded brand.adQrDataUrl into platform_config");
  }

  if (!logoUri && !qrUri) {
    console.warn("[AD-TEMPLATE-MIGRATE] No logo or QR found in legacy ad-template files — platform_config not updated");
  }
}

const VITICULTURE_HORIZONTAL_NAME = "Viticulture — Half Page Horizontal (190×133 mm)";
const VITICULTURE_PORTRAIT_NAME   = "Viticulture — Half Page Vertical (90×267 mm)";

// ── Horizontal template (190 × 133 mm) ────────────────────────────────────────
// Placeholders: {{font_css}}, {{bg}}, {{logo}}, {{qr}},
//               {{headline}}, {{body}}, {{accent_color}}
//
// Defaults applied by renderAdTemplate when placeholders are not overridden:
//   {{headline}}     → "Your vineyard.<br><em>Audit-ready.</em>"
//   {{body}}         → "Vine register … all in one place, accessible anywhere."
//   {{accent_color}} → "#C49A6C"

const VITICULTURE_HORIZONTAL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>BDE Farm Trac — Half Page Horizontal — CMYK</title>
<style>
{{font_css}}

@page { size: 190mm 133mm; margin: 0; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 190mm; height: 133mm; overflow: hidden;
  font-family: 'Inter', sans-serif; }

.ad { position: relative; width: 190mm; height: 133mm; overflow: hidden; }

.bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('{{bg}}');
  background-size: cover; background-position: center 38%; }

.overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(105deg,
    rgba(10,7,5,0.88) 0%, rgba(12,9,6,0.70) 48%, rgba(10,7,5,0.28) 100%); }

.top-bar { position: absolute; top: 0; left: 0; right: 0; height: 0.7mm;
  background: linear-gradient(90deg, {{accent_color}} 0%, {{accent_color}} 50%, {{accent_color}} 100%);
  z-index: 4; }

.left-rule { position: absolute; left: 0; top: 0; bottom: 0; width: 1.2mm;
  background: #2D6A2E; z-index: 4; }

.inner { position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  display: flex; padding: 9mm 10mm 8.4mm 11mm; gap: 6mm; z-index: 3; }

.left { width: 105mm; flex-shrink: 0; display: flex;
  flex-direction: column; justify-content: space-between; }

.logo { display: block; height: 8mm; width: auto; max-width: 44mm; }

.copy { display: flex; flex-direction: column; gap: 2.2mm;
  flex: 1; justify-content: center; }

.eyebrow { font-size: 2.2mm; font-weight: 600; color: {{accent_color}};
  letter-spacing: 0.16em; text-transform: uppercase; }

.headline { font-family: 'Playfair Display', serif; font-size: 11.6mm;
  font-weight: 700; line-height: 1.0; color: #ffffff; }
.headline em { font-style: italic; color: {{accent_color}}; }

.subline { font-size: 3mm; color: rgba(255,255,255,0.68);
  line-height: 1.5; font-weight: 400; max-width: 92mm; }

.features { display: flex; flex-wrap: wrap; gap: 1.6mm 5.2mm; margin-top: auto; }
.feat { display: flex; align-items: center; gap: 1.4mm;
  font-size: 2.4mm; font-weight: 500; color: rgba(255,255,255,0.78);
  white-space: nowrap; }
.feat::before { content: ''; display: inline-block;
  width: 0.8mm; height: 0.8mm; border-radius: 50%;
  background: {{accent_color}}; flex-shrink: 0; }

.right { flex: 1; display: flex; flex-direction: column;
  justify-content: space-between; }

.glass-card { background: rgba(255,255,255,0.10);
  border: 0.1mm solid rgba(196,154,108,0.35); border-radius: 1.4mm;
  padding: 4.6mm 5.2mm; display: flex; flex-direction: column; }

.card-title { font-family: 'Playfair Display', serif; font-style: italic;
  font-size: 2.8mm; color: {{accent_color}}; font-weight: 700;
  line-height: 1.2; margin-bottom: 2.4mm; }

.card-item { padding: 2mm 0;
  border-bottom: 0.1mm solid rgba(255,255,255,0.09); }
.card-item:last-child { border-bottom: none; padding-bottom: 0; }

.card-item-title { font-size: 2.4mm; font-weight: 700;
  color: rgba(255,255,255,0.90); margin-bottom: 0.6mm; }
.card-item-desc { font-size: 1.9mm; color: rgba(255,255,255,0.50);
  line-height: 1.35; }

.cta-row { display: flex; align-items: flex-end; gap: 3.2mm; }
.cta-block { flex: 1; display: flex; flex-direction: column; gap: 1mm; }

.cta { display: block; background: transparent; color: {{accent_color}};
  font-weight: 800; font-size: 2.6mm; padding: 2.2mm 0;
  border-radius: 0.8mm; border: 0.2mm solid {{accent_color}};
  text-decoration: none; text-align: center; letter-spacing: 0.01em; }

.url { font-size: 1.8mm; color: rgba(255,255,255,0.28);
  letter-spacing: 0.05em; text-align: center; }

.qr-wrap { display: flex; flex-direction: column; align-items: center;
  gap: 1mm; flex-shrink: 0; }
.qr-wrap img { display: block; width: 13mm; height: 13mm;
  border-radius: 0.6mm; }
.qr-label { font-size: 1.6mm; color: rgba(255,255,255,0.30);
  letter-spacing: 0.04em; white-space: nowrap; }
</style>
</head>
<body>
<div class="ad">
  <div class="bg"></div>
  <div class="overlay"></div>
  <div class="top-bar"></div>
  <div class="left-rule"></div>
  <div class="inner">
    <div class="left">
      <img class="logo" src="{{logo}}" alt="BDE Farm Trac"/>
      <div class="copy">
        <div class="eyebrow">Viticulture · Cloud-based · UK vineyards</div>
        <div class="headline">{{headline}}</div>
        <div class="subline">{{body}}</div>
      </div>
      <div class="features">
        <span class="feat">Vine register &amp; phenology</span>
        <span class="feat">PDO &amp; PGI compliance</span>
        <span class="feat">Spray &amp; scouting logs</span>
        <span class="feat">Harvest &amp; must chemistry</span>
        <span class="feat">Organic viticulture</span>
        <span class="feat">Excise &amp; duty records</span>
      </div>
    </div>
    <div class="right">
      <div class="glass-card">
        <div class="card-title">Full farm platform included</div>
        <div class="card-item">
          <div class="card-item-title">Red Tractor</div>
          <div class="card-item-desc">Spray logs, staff certs &amp; inspection evidence</div>
        </div>
        <div class="card-item">
          <div class="card-item-title">Organic Certification</div>
          <div class="card-item-desc">Input register &amp; derogation records</div>
        </div>
        <div class="card-item">
          <div class="card-item-title">Cloud Security</div>
          <div class="card-item-desc">Encrypted, auto-backed-up, disaster-recovery ready</div>
        </div>
      </div>
      <div class="cta-row">
        <div class="cta-block">
          <div class="cta">Register your interest</div>
          <div class="url">bdefarmtrac.co.uk</div>
        </div>
        <div class="qr-wrap">
          <img src="{{qr}}" alt="QR"/>
          <span class="qr-label">Scan to visit</span>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

// ── Portrait template (90 × 267 mm) ───────────────────────────────────────────
// Placeholders: {{font_css}}, {{bg}}, {{logo}}, {{qr}},
//               {{headline}}, {{body}}, {{accent_color}}
//
// Defaults applied by renderAdTemplate when placeholders are not overridden:
//   {{headline}}     → "Your<br>vineyard.<br><em>Audit-<br>ready.</em>"
//   {{body}}         → "Vine register … all in one place."
//   {{accent_color}} → "#C49A6C"

const VITICULTURE_PORTRAIT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>BDE Farm Trac — Half Page Vertical — CMYK</title>
<style>
{{font_css}}

@page { size: 90mm 267mm; margin: 0; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 90mm; height: 267mm; overflow: hidden;
  font-family: 'Inter', sans-serif; }

.ad { position: relative; width: 90mm; height: 267mm; overflow: hidden; }

.bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('{{bg}}');
  background-size: cover; background-position: center 30%; }

.overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(180deg,
    rgba(8,6,4,0.42) 0%, rgba(8,6,4,0.55) 35%,
    rgba(8,6,4,0.82) 65%, rgba(8,6,4,0.96) 100%); }

.top-bar { position: absolute; top: 0; left: 0; right: 0; height: 1.4mm;
  background: linear-gradient(90deg, {{accent_color}} 0%, {{accent_color}} 50%, {{accent_color}} 100%);
  z-index: 4; }

.left-rule { position: absolute; left: 0; top: 0; bottom: 0; width: 1.6mm;
  background: #2D6A2E; z-index: 4; }

.inner { position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  display: flex; flex-direction: column;
  padding: 7.2mm 7.2mm 7.2mm 10mm; z-index: 3; }

.logo { display: block; height: 12mm; width: auto; max-width: 44mm; }

.eyebrow { margin-top: 16mm; font-size: 2.6mm; font-weight: 600; color: {{accent_color}};
  letter-spacing: 0.16em; text-transform: uppercase; line-height: 1.3; }

.headline { font-family: 'Playfair Display', serif; font-size: 14.8mm;
  font-weight: 700; line-height: 0.98; color: #ffffff; margin-top: 3.6mm; }
.headline em { font-style: italic; color: {{accent_color}}; display: block; }

.subline { font-size: 3.4mm; color: rgba(255,255,255,0.68);
  line-height: 1.5; font-weight: 400; margin-top: 5.2mm; max-width: 82mm; }

.divider { width: 8mm; height: 0.3mm; background: {{accent_color}}; margin: 6mm 0; }

.features { display: flex; flex-direction: column; gap: 2.8mm; }
.feat { display: flex; align-items: center; gap: 2.4mm;
  font-size: 3.2mm; font-weight: 500; color: rgba(255,255,255,0.78); }
.feat::before { content: ''; display: inline-block;
  width: 1.2mm; height: 1.2mm; border-radius: 50%;
  background: {{accent_color}}; flex-shrink: 0; }

.platform-strip { margin-top: auto;
  border-top: 0.1mm solid rgba(196,154,108,0.35);
  padding-top: 4.4mm; display: flex; flex-direction: column; gap: 1.8mm; }
.platform-label { font-size: 2.2mm; font-weight: 600; color: {{accent_color}};
  letter-spacing: 0.12em; text-transform: uppercase; }
.platform-items { display: flex; flex-direction: column; gap: 1.4mm; }
.platform-item { font-size: 2.6mm; color: rgba(255,255,255,0.60); }
.platform-item strong { color: rgba(255,255,255,0.88); font-weight: 600;
  margin-right: 0.6mm; }

.cta-row { display: flex; align-items: center; gap: 4mm; margin-top: 5.6mm; }

.cta { flex: 1; display: block; background: transparent; color: {{accent_color}};
  font-weight: 800; font-size: 3mm; padding: 3.2mm 0;
  border-radius: 1mm; border: 0.25mm solid {{accent_color}};
  text-align: center; letter-spacing: 0.01em; }

.qr-wrap { display: flex; flex-direction: column; align-items: center;
  gap: 1.4mm; flex-shrink: 0; }
.qr-wrap img { display: block; width: 18mm; height: 18mm;
  border-radius: 0.8mm; }
.qr-label { font-size: 2mm; color: rgba(255,255,255,0.30);
  letter-spacing: 0.04em; }

.url { font-size: 2.2mm; color: rgba(255,255,255,0.25);
  letter-spacing: 0.05em; text-align: center; margin-top: 1.6mm; }
</style>
</head>
<body>
<div class="ad">
  <div class="bg"></div>
  <div class="overlay"></div>
  <div class="top-bar"></div>
  <div class="left-rule"></div>
  <div class="inner">
    <img class="logo" src="{{logo}}" alt="BDE Farm Trac"/>
    <div class="eyebrow">Viticulture · UK Vineyards</div>
    <div class="headline">{{headline}}</div>
    <div class="subline">{{body}}</div>
    <div class="divider"></div>
    <div class="features">
      <span class="feat">Vine register &amp; phenology</span>
      <span class="feat">PDO &amp; PGI compliance</span>
      <span class="feat">Spray &amp; scouting logs</span>
      <span class="feat">Harvest &amp; must chemistry</span>
      <span class="feat">Organic viticulture</span>
      <span class="feat">Excise &amp; duty records</span>
    </div>
    <div class="platform-strip">
      <div class="platform-label">Full farm platform included</div>
      <div class="platform-items">
        <div class="platform-item"><strong>Red Tractor</strong> Spray logs &amp; inspection evidence</div>
        <div class="platform-item"><strong>Organic Cert</strong> Input register &amp; derogation records</div>
        <div class="platform-item"><strong>Cloud Security</strong> Encrypted, auto-backed-up</div>
      </div>
    </div>
    <div class="cta-row">
      <div class="cta">Register your interest</div>
      <div class="qr-wrap">
        <img src="{{qr}}" alt="QR"/>
        <span class="qr-label">Scan to visit</span>
      </div>
    </div>
    <div class="url">bdefarmtrac.co.uk</div>
  </div>
</div>
</body>
</html>`;
