#!/usr/bin/env node
/**
 * Regression tests for the Contact page's module-selection banner.
 *
 * The Pricing page writes the selected module IDs to ?modules=. These tests
 * mirror Contact.tsx's pure query-string and banner-display logic so the
 * banner remains useful as the pricing URL synchronisation changes.
 *
 * Run with: node artifacts/website/scripts/test-contact-modules-banner.mjs
 */

const AVAILABLE_MODULES = [
  { id: "red-tractor-compliance", label: "Red Tractor Compliance" },
  { id: "field-crop-management", label: "Field & Crop Management" },
  { id: "finance-business", label: "Finance & Business" },
  { id: "viticulture", label: "Viticulture" },
];

const SECTOR_DEFAULT_MODULES = {
  Arable: ["field-crop-management", "finance-business"],
};

const VALID_MODULE_IDS = new Set(AVAILABLE_MODULES.map(({ id }) => id));
const VALID_SECTOR_NAMES = new Set(Object.keys(SECTOR_DEFAULT_MODULES));

// Mirrors Contact.tsx's getModulesParam().
function getModulesParam(search) {
  const raw = new URLSearchParams(search).get("modules");
  if (!raw) return null;
  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => VALID_MODULE_IDS.has(id));
  return ids.length > 0 ? ids : null;
}

// Mirrors Contact.tsx's getSectorParam().
function getSectorParam(search) {
  const sector = new URLSearchParams(search).get("sector");
  return sector && VALID_SECTOR_NAMES.has(sector) ? sector : null;
}

// Represents the content the Contact banner renders from those parameters.
function getBanner(search) {
  const sector = getSectorParam(search);
  const modules = getModulesParam(search);
  if (!sector && !modules) return null;

  if (!modules) {
    return {
      heading: `Sector: ${sector}`,
      pills: [],
      usesSectorDefaults: true,
    };
  }

  return {
    heading: sector
      ? `Sector: ${sector} — from your Pricing calculator selection:`
      : "From your Pricing calculator selection:",
    pills: modules
      .map((id) => AVAILABLE_MODULES.find((module) => module.id === id)?.label)
      .filter(Boolean),
    usesSectorDefaults: false,
  };
}

let passed = 0;
let failed = 0;

function assert(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

console.log("\nKnown module IDs render the expected banner pills:");
{
  const banner = getBanner("?modules=field-crop-management,finance-business");
  assert("banner is visible", banner !== null);
  assert("selection heading is shown", banner?.heading === "From your Pricing calculator selection:");
  assert(
    "known module labels are rendered in URL order",
    JSON.stringify(banner?.pills) === JSON.stringify(["Field & Crop Management", "Finance & Business"]),
  );
}

console.log("\nUnknown module IDs are ignored:");
{
  const banner = getBanner("?modules=field-crop-management,unknown-module,ghost-module");
  assert("known module remains visible", banner?.pills?.includes("Field & Crop Management"));
  assert("unknown module is not rendered", !banner?.pills?.includes("unknown-module"));
  assert("unknown module is not rendered (second ID)", !banner?.pills?.includes("Ghost Module"));
  assert("only known module pill remains", banner?.pills?.length === 1);
  assert("unknown-only selection does not create an empty banner", getBanner("?modules=unknown-module") === null);
}

console.log("\nSector and explicit modules render together:");
{
  const banner = getBanner("?sector=Arable&modules=viticulture,finance-business");
  assert(
    "combined heading identifies the sector and pricing selection",
    banner?.heading === "Sector: Arable — from your Pricing calculator selection:",
  );
  assert(
    "explicit module pills are rendered",
    JSON.stringify(banner?.pills) === JSON.stringify(["Viticulture", "Finance & Business"]),
  );
  assert("explicit modules take priority over sector defaults", !banner?.pills?.includes("Field & Crop Management"));
  assert("sector defaults are not used for explicit selections", banner?.usesSectorDefaults === false);
}

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);