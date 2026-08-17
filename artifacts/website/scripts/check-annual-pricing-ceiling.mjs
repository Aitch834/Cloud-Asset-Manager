#!/usr/bin/env node
/**
 * check-annual-pricing-ceiling.mjs
 *
 * Asserts that the entry-level annual cost
 *   (BASE_FEE + red-tractor-compliance price) × 12
 * stays STRICTLY below the marketing ceiling used in the "Under £X a year"
 * copy on the Pricing page.
 *
 * ── MARKETING RATIONALE FOR THE CEILING ────────────────────────────────────
 * The Pricing page reads:
 *   "Base platform + Red Tractor Compliance.
 *    Under £500 a year for a fully compliant farm."
 *
 * The displayed figure is computed dynamically via:
 *   Math.ceil((BASE_FEE + modulePrice("red-tractor-compliance")) * 12 / 100) * 100
 *
 * At current prices (£15 base + £25 RTC = £40/mo → £480/yr) the copy reads
 * "Under £500 a year".  If prices rise so that the annual total reaches £500,
 * the rounded claim silently jumps to "Under £600" — a 20% increase that must
 * be reviewed and approved by marketing before it goes live.
 *
 * CEILING: £500 / year  ← update here (and in pricing-data.ts comments) after
 *                          marketing approves new copy.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * ── ARITHMETIC NOTE ─────────────────────────────────────────────────────────
 * All monetary comparisons use integer pence (minor units) to avoid IEEE 754
 * floating-point boundary errors.  Input prices (which may be integers or
 * decimals in pricing-data.ts) are rounded to 2 decimal places then converted
 * to pence before any arithmetic, so e.g. £26.666… is treated as £26.67
 * (2667p) — not as the irrational exact value — for a deterministic result.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Usage:
 *   node artifacts/website/scripts/check-annual-pricing-ceiling.mjs
 *   node artifacts/website/scripts/check-annual-pricing-ceiling.mjs --self-test
 *
 * Exit codes:
 *   0 — annual cost is below the ceiling; copy is safe to ship.
 *   1 — annual cost has reached or exceeded the ceiling; needs copy review.
 *   2 — pricing-data.ts could not be parsed (file moved / format changed).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRICING_DATA_PATH = path.resolve(__dirname, "../src/lib/pricing-data.ts");

// ── Ceiling ──────────────────────────────────────────────────────────────────
//
// Marketing rationale: the Pricing page claims entry-level farming costs
// "Under £500 a year".  This script enforces that the actual annual cost
// (BASE_FEE + red-tractor-compliance) × 12 stays strictly below this value,
// so the dynamically rounded figure on the page never silently exceeds it.
//
// When prices are raised intentionally and the copy is updated, bump this
// constant to the new approved ceiling (e.g. 600) and commit the change
// alongside the pricing-data.ts edit so the CI check passes again.
const ANNUAL_CEILING_GBP = 500; // £/year
const ANNUAL_CEILING_PENCE = ANNUAL_CEILING_GBP * 100; // 50000p — integer comparison target

// ── Pence conversion ─────────────────────────────────────────────────────────

/**
 * Convert a price string (e.g. "25", "26.75", "26.666666666666665") to an
 * integer number of pence, rounded to the nearest penny.
 *
 * Rounding to 2 dp before multiplying eliminates IEEE 754 drift at boundary
 * values: e.g. "26.666…" → £26.67 → 2667p, not the irrational exact value.
 *
 * @param {string} raw — the numeric string captured from the source file.
 * @returns {number} integer pence value.
 */
function toPence(raw) {
  // Round to 2 dp first to get a canonical price, then scale to pence.
  const pounds = Math.round(parseFloat(raw) * 100) / 100;
  return Math.round(pounds * 100);
}

// ── Parsing ──────────────────────────────────────────────────────────────────

/**
 * Parse BASE_FEE and the red-tractor-compliance price from a pricing-data.ts
 * source string.  Returns raw matched strings so the caller can convert to
 * pence independently.
 *
 * @param {string} src — full text of pricing-data.ts.
 * @returns {{ baseFeeRaw: string, rtcPriceRaw: string }}
 * @throws {Error} with a descriptive message if parsing fails.
 */
function parsePricingData(src) {
  // Match: export const BASE_FEE = <number>;
  // Captures integers and decimals (e.g. 15, 15.5).
  const baseFeeMatch = src.match(/^export const BASE_FEE\s*=\s*(\d+(?:\.\d+)?)\s*;/m);
  if (!baseFeeMatch) {
    throw new Error(
      "Could not parse BASE_FEE from pricing-data.ts.\n" +
      "  Expected a line like: export const BASE_FEE = 15;"
    );
  }

  // Match the red-tractor-compliance module entry.
  // Entry form: { id: "red-tractor-compliance", ..., price: 25, ... }
  // Uses a dotall match from the id to the first price: field that follows.
  // Captures integers and decimals.
  const rtcMatch = src.match(
    /id:\s*["']red-tractor-compliance["'][^}]*?price:\s*(\d+(?:\.\d+)?)/s
  );
  if (!rtcMatch) {
    throw new Error(
      "Could not parse red-tractor-compliance price from pricing-data.ts.\n" +
      '  Expected an entry with id: "red-tractor-compliance" and a price: field.'
    );
  }

  return { baseFeeRaw: baseFeeMatch[1], rtcPriceRaw: rtcMatch[1] };
}

// ── Evaluation ───────────────────────────────────────────────────────────────

/**
 * Evaluate the annual pricing claim against the ceiling.
 * All arithmetic is performed in integer pence to avoid float drift.
 *
 * @param {number} baseFeeP   — monthly base fee in pence (integer).
 * @param {number} rtcPriceP  — monthly RTC price in pence (integer).
 * @param {number} ceilingP   — annual ceiling in pence (integer).
 * @returns {{ monthlyP, annualP, roundedClaimGBP, passes }}
 */
function evaluate(baseFeeP, rtcPriceP, ceilingP) {
  const monthlyP = baseFeeP + rtcPriceP;
  const annualP  = monthlyP * 12;
  // Mirror the Pricing.tsx rounding: Math.ceil(annual / 100) * 100
  // but work in pence: ceil to next £100 boundary = ceil(annualP / 10000) * 100
  const roundedClaimGBP = Math.ceil(annualP / 10000) * 100;
  const passes = annualP < ceilingP;
  return { monthlyP, annualP, roundedClaimGBP, passes };
}

// ── Self-test mode ───────────────────────────────────────────────────────────
//
// Run: node check-annual-pricing-ceiling.mjs --self-test
//
// Verifies that the pence-arithmetic evaluation correctly detects when a price
// pushes the annual total past the ceiling, including decimal and boundary cases.

if (process.argv.includes("--self-test")) {
  let failures = 0;

  function assert(description, condition) {
    if (condition) {
      console.log(`  ✓ ${description}`);
    } else {
      console.error(`  ✗ FAIL: ${description}`);
      failures++;
    }
  }

  console.log("Self-test: check-annual-pricing-ceiling.mjs pence arithmetic\n");

  const CEILING_P = ANNUAL_CEILING_PENCE; // 50000p

  // Case 1 — current integer prices £15 + £25 → 1500p + 2500p = 4000p/mo → 48000p/yr < 50000p
  {
    const r = evaluate(1500, 2500, CEILING_P);
    assert("integer £15+£25 → 48000p/yr → passes",        r.passes === true);
    assert("monthlyP is 4000p",                            r.monthlyP === 4000);
    assert("annualP is 48000p",                            r.annualP  === 48000);
    assert("rounded claim is £500",                        r.roundedClaimGBP === 500);
  }

  // Case 2 — decimal RTC £26.75 → 2675p; annual = (1500+2675)*12 = 50100p → FAILS
  {
    const rtcP = toPence("26.75"); // 2675
    const r = evaluate(1500, rtcP, CEILING_P);
    assert("toPence('26.75') = 2675p",                     rtcP === 2675);
    assert("decimal RTC £26.75 → 50100p/yr → fails",       r.passes === false);
    assert("annualP is 50100p",                            r.annualP  === 50100);
    assert("rounded claim jumps to £600",                  r.roundedClaimGBP === 600);
  }

  // Case 3 — decimal £26.666… → rounds to £26.67 → 2667p; annual = (1500+2667)*12 = 50004p → FAILS
  // (Reviewer example: float "26.666666666666665" must not produce a false pass.)
  {
    const rtcP = toPence("26.666666666666665"); // rounds to 2667p
    const r = evaluate(1500, rtcP, CEILING_P);
    assert("toPence('26.666666666666665') rounds to 2667p", rtcP === 2667);
    assert("£26.67 RTC → 50004p/yr → fails (no false pass)", r.passes === false);
  }

  // Case 4 — exactly at ceiling: (1500 + 2667)*12 = 50004 ≥ 50000 → FAILS (strict <)
  {
    const r = evaluate(2500, 1666, CEILING_P); // (2500+1666)*12 = 49992 < 50000
    assert("49992p < 50000p → passes",                     r.passes === true);
    const r2 = evaluate(2500, 1667, CEILING_P); // (2500+1667)*12 = 50004 ≥ 50000
    assert("50004p ≥ 50000p → fails",                      r2.passes === false);
  }

  // Case 5 — exactly 50000p: 50000/12 = 4166.666…p/mo → ceil to boundary
  //   e.g. baseFeeP=2084, rtcP=2083 → monthly=4167, annual=50004 → FAILS
  {
    const r = evaluate(2084, 2083, CEILING_P); // 50004p → FAILS
    assert("annual 50004p (≥ ceiling) → fails",            r.passes === false);
    const r3 = evaluate(2083, 2083, CEILING_P); // 49992p → passes
    assert("annual 49992p (< ceiling) → passes",           r3.passes === true);
  }

  // Case 6 — parsePricingData: decimal prices in source
  {
    const fakeSrc = [
      'export const BASE_FEE = 16.5;',
      'export const MODULES = [',
      '  { id: "red-tractor-compliance", name: "RT", price: 26.75, required: true },',
      '];',
    ].join("\n");
    try {
      const { baseFeeRaw, rtcPriceRaw } = parsePricingData(fakeSrc);
      assert("parsePricingData: baseFeeRaw = '16.5'",   baseFeeRaw  === "16.5");
      assert("parsePricingData: rtcPriceRaw = '26.75'", rtcPriceRaw === "26.75");
      assert("toPence(baseFeeRaw) = 1650p",              toPence(baseFeeRaw)  === 1650);
      assert("toPence(rtcPriceRaw) = 2675p",             toPence(rtcPriceRaw) === 2675);
    } catch (e) {
      console.error(`  ✗ FAIL: parsePricingData threw: ${e.message}`);
      failures++;
    }
  }

  // Case 7 — parsePricingData: integer prices (regression guard)
  {
    const fakeSrc = [
      'export const BASE_FEE = 15;',
      'export const MODULES = [',
      '  { id: "red-tractor-compliance", name: "RT", price: 25, required: true },',
      '];',
    ].join("\n");
    try {
      const { baseFeeRaw, rtcPriceRaw } = parsePricingData(fakeSrc);
      assert("parsePricingData: baseFeeRaw = '15'",    baseFeeRaw  === "15");
      assert("parsePricingData: rtcPriceRaw = '25'",   rtcPriceRaw === "25");
      assert("toPence('15') = 1500p",                  toPence("15")  === 1500);
      assert("toPence('25') = 2500p",                  toPence("25")  === 2500);
    } catch (e) {
      console.error(`  ✗ FAIL: parsePricingData threw: ${e.message}`);
      failures++;
    }
  }

  console.log();
  if (failures === 0) {
    console.log("✓ All self-tests passed.");
    process.exit(0);
  } else {
    console.error(`✗ ${failures} self-test(s) failed.`);
    process.exit(1);
  }
}

// ── Normal mode ───────────────────────────────────────────────────────────────

let src;
try {
  src = fs.readFileSync(PRICING_DATA_PATH, "utf8");
} catch (err) {
  console.error(`✗ Could not read pricing-data.ts: ${err.message}`);
  console.error(`  Expected path: ${PRICING_DATA_PATH}`);
  process.exit(2);
}

let baseFeeRaw, rtcPriceRaw;
try {
  ({ baseFeeRaw, rtcPriceRaw } = parsePricingData(src));
} catch (err) {
  console.error(`✗ ${err.message}`);
  process.exit(2);
}

const baseFeeP  = toPence(baseFeeRaw);
const rtcPriceP = toPence(rtcPriceRaw);

const { monthlyP, annualP, roundedClaimGBP, passes } = evaluate(
  baseFeeP,
  rtcPriceP,
  ANNUAL_CEILING_PENCE
);

// Human-readable display values (divide pence back to £)
const baseFeeGBP  = baseFeeP  / 100;
const rtcPriceGBP = rtcPriceP / 100;
const monthlyGBP  = monthlyP  / 100;
const annualGBP   = annualP   / 100;

console.log("Annual pricing ceiling check");
console.log("─".repeat(44));
console.log(`  BASE_FEE                  £${baseFeeGBP}/mo  (${baseFeeP}p)`);
console.log(`  red-tractor-compliance    £${rtcPriceGBP}/mo  (${rtcPriceP}p)`);
console.log(`  Entry-level monthly       £${monthlyGBP}/mo  (${monthlyP}p)`);
console.log(`  Entry-level annual        £${annualGBP}/yr  (${annualP}p)`);
console.log(`  Pricing page copy reads:  "Under £${roundedClaimGBP} a year"`);
console.log(`  Ceiling (must be below):  £${ANNUAL_CEILING_GBP}/yr  (${ANNUAL_CEILING_PENCE}p)`);
console.log();

if (!passes) {
  console.error(
    `✗ FAIL — Annual entry-level cost (${annualP}p = £${annualGBP}) has reached or\n` +
    `  exceeded the ${ANNUAL_CEILING_PENCE}p (£${ANNUAL_CEILING_GBP}) ceiling.\n` +
    `\n` +
    `  The Pricing page "Under £${roundedClaimGBP} a year" claim now reflects a price\n` +
    `  that was not reviewed for marketing copy accuracy.\n` +
    `\n` +
    `  Action required:\n` +
    `    1. Review and update the copy in artifacts/website/src/pages/Pricing.tsx\n` +
    `       (the "Under £X a year" text near the Small Farm Reassurance Strip).\n` +
    `    2. Update ANNUAL_CEILING_GBP in this script to the new approved ceiling\n` +
    `       (e.g. ${Math.ceil(annualGBP / 100) * 100}) once copy is approved.\n` +
    `    3. Update the PRICE CHANGE CHECKLIST comment in pricing-data.ts.\n`
  );
  process.exit(1);
}

console.log(
  `✓ PASS — Annual entry-level cost (${annualP}p = £${annualGBP}) is below the\n` +
  `  ${ANNUAL_CEILING_PENCE}p (£${ANNUAL_CEILING_GBP}) ceiling.\n` +
  `  Pricing page claim "Under £${roundedClaimGBP} a year" is accurate.`
);
process.exit(0);
