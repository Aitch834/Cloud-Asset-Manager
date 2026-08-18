/**
 * Unit tests for alertAppliesForCounty — the county-filter function used by all
 * sector alert endpoints (/api/beef-alert, /api/dairy-alert, etc.).
 *
 * Run with:  pnpm --filter @workspace/api-server run test:alert
 *
 * Uses Node's built-in assert module (no jest required).  Exit code 0 = pass,
 * non-zero = fail.
 *
 * These tests guard against the resolveFarmCounty bug where farmsTable.country
 * ("england") was selected instead of farmsTable.county ("Kent"), which caused
 * regional/county-targeted alerts to never match and always return active:false.
 */

import assert from "node:assert/strict";
import { alertAppliesForCounty } from "../src/lib/alertUtils.js";

let passed = 0;
let failed = 0;

function test(description: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓  ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${description}`);
    console.error(`     ${(err as Error).message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// National alerts — no county filter → applies everywhere
// ---------------------------------------------------------------------------
console.log("\nNational alerts (no county filter):");

test("empty alertCounties → applies to any farm", () => {
  assert.equal(alertAppliesForCounty("", "Kent"), true);
});

test("whitespace-only alertCounties → applies to any farm", () => {
  assert.equal(alertAppliesForCounty("   ", "Kent"), true);
});

// ---------------------------------------------------------------------------
// County-targeted alerts — farm IN the county
// ---------------------------------------------------------------------------
console.log("\nCounty-targeted alerts — farm in county:");

test("exact case match", () => {
  assert.equal(alertAppliesForCounty("Kent", "Kent"), true);
});

test("alertCounties lowercase, farmCounty mixed case", () => {
  assert.equal(alertAppliesForCounty("kent", "Kent"), true);
});

test("alertCounties mixed case, farmCounty lowercase", () => {
  assert.equal(alertAppliesForCounty("Kent", "kent"), true);
});

test("multi-county list — farm is in first county", () => {
  assert.equal(alertAppliesForCounty("Kent, Devon, Cornwall", "Kent"), true);
});

test("multi-county list — farm is in middle county", () => {
  assert.equal(alertAppliesForCounty("Kent, Devon, Cornwall", "Devon"), true);
});

test("multi-county list — farm is in last county", () => {
  assert.equal(alertAppliesForCounty("Kent, Devon, Cornwall", "Cornwall"), true);
});

test("county name with surrounding spaces in the list", () => {
  assert.equal(alertAppliesForCounty("  Kent  ,  Devon  ", "Kent"), true);
});

// ---------------------------------------------------------------------------
// County-targeted alerts — farm NOT in the county
// ---------------------------------------------------------------------------
console.log("\nCounty-targeted alerts — farm outside county:");

test("single-county alert, farm in different county → inactive", () => {
  assert.equal(alertAppliesForCounty("Kent", "Devon"), false);
});

test("multi-county alert, farm not in any listed county → inactive", () => {
  assert.equal(alertAppliesForCounty("Kent, Devon", "Cornwall"), false);
});

test("alert for 'england' string does NOT match county 'Kent' (the key regression)", () => {
  // This is the bug that resolveFarmCounty introduced: country='england' was
  // returned instead of county='Kent', so this comparison must return false
  // (the county filter "Kent" does not match the country string "england").
  assert.equal(alertAppliesForCounty("Kent", "england"), false);
});

// ---------------------------------------------------------------------------
// Fail-open when farm has no county stored
// ---------------------------------------------------------------------------
console.log("\nFail-open — farm with no stored county:");

test("farm county empty string → fail-open (show alert)", () => {
  assert.equal(alertAppliesForCounty("Kent", ""), true);
});

test("farm county whitespace only → fail-open (show alert)", () => {
  assert.equal(alertAppliesForCounty("Kent", "   "), true);
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
