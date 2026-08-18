#!/usr/bin/env node
/**
 * Round-trip tests for the farms URL parameter encoding/parsing used by
 * the Pricing page's "Copy link" feature.
 *
 * Run with: node artifacts/website/scripts/test-farms-param-roundtrip.mjs
 */

// ── Inline the pure logic (mirrors Pricing.tsx) ────────────────────────────

function encodeFarmsParam(farms) {
  return JSON.stringify(farms.map(f => [f.name, f.selectedModules]));
}

function parseFarmsParam(raw, validModuleIds) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.map((entry, i) => {
      if (!Array.isArray(entry) || entry.length < 2) {
        return { id: i + 1, name: `Farm ${i + 1}`, selectedModules: ["red-tractor-compliance"] };
      }
      const [rawName, rawModules] = entry;
      const name = typeof rawName === "string" && rawName.trim() ? rawName : `Farm ${i + 1}`;
      const moduleIds = Array.isArray(rawModules)
        ? rawModules.filter(m => typeof m === "string" && m !== "red-tractor-compliance" && validModuleIds.has(m))
        : [];
      return { id: i + 1, name, selectedModules: ["red-tractor-compliance", ...moduleIds] };
    });
  } catch {
    return null;
  }
}

// ── Test harness ────────────────────────────────────────────────────────────

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

function roundTrip(farms, validModuleIds) {
  const encoded = encodeFarmsParam(farms);
  // Simulate URLSearchParams encode → decode (set + get round-trip)
  const params = new URLSearchParams();
  params.set("farms", encoded);
  const decoded = params.get("farms");
  return parseFarmsParam(decoded, validModuleIds);
}

// A representative set of valid module IDs
const VALID = new Set([
  "red-tractor-compliance",
  "field-crop-management",
  "livestock-management",
  "sheep-production",
  "viticulture",
  "organic-viticulture",
  "finance-business",
]);

// ── Test cases ──────────────────────────────────────────────────────────────

console.log("\nBasic single-farm round-trip:");
{
  const farms = [{ id: 1, name: "Farm 1", selectedModules: ["red-tractor-compliance", "field-crop-management"] }];
  const result = roundTrip(farms, VALID);
  assert("result is non-null", result !== null);
  assert("name preserved", result?.[0]?.name === "Farm 1");
  assert("modules preserved", JSON.stringify(result?.[0]?.selectedModules) === JSON.stringify(["red-tractor-compliance", "field-crop-management"]));
}

console.log("\nMultiple farms round-trip:");
{
  const farms = [
    { id: 1, name: "Arable Block", selectedModules: ["red-tractor-compliance", "field-crop-management"] },
    { id: 2, name: "Livestock Unit", selectedModules: ["red-tractor-compliance", "livestock-management", "sheep-production"] },
  ];
  const result = roundTrip(farms, VALID);
  assert("two farms returned", result?.length === 2);
  assert("farm 1 name", result?.[0]?.name === "Arable Block");
  assert("farm 2 name", result?.[1]?.name === "Livestock Unit");
  assert("farm 1 modules", result?.[0]?.selectedModules?.includes("field-crop-management"));
  assert("farm 2 modules", result?.[1]?.selectedModules?.includes("sheep-production"));
}

console.log("\nFarm name with colon:");
{
  const farms = [{ id: 1, name: "North Farm: Dairy", selectedModules: ["red-tractor-compliance", "livestock-management"] }];
  const result = roundTrip(farms, VALID);
  assert("name with colon preserved", result?.[0]?.name === "North Farm: Dairy");
}

console.log("\nFarm name with pipe character:");
{
  const farms = [{ id: 1, name: "East|West Farm", selectedModules: ["red-tractor-compliance"] }];
  const result = roundTrip(farms, VALID);
  assert("name with pipe preserved", result?.[0]?.name === "East|West Farm");
}

console.log("\nFarm name with comma:");
{
  const farms = [{ id: 1, name: "Smith, Jones & Sons", selectedModules: ["red-tractor-compliance", "field-crop-management"] }];
  const result = roundTrip(farms, VALID);
  assert("name with comma preserved", result?.[0]?.name === "Smith, Jones & Sons");
  assert("modules still intact after comma-name", result?.[0]?.selectedModules?.includes("field-crop-management"));
}

console.log("\nFarm name with spaces and unicode:");
{
  const farms = [{ id: 1, name: "Fferm Ddraig 🐉", selectedModules: ["red-tractor-compliance"] }];
  const result = roundTrip(farms, VALID);
  assert("unicode name preserved", result?.[0]?.name === "Fferm Ddraig 🐉");
}

console.log("\nInvalid/unknown module IDs are stripped:");
{
  const farms = [{ id: 1, name: "Test Farm", selectedModules: ["red-tractor-compliance", "ghost-module", "field-crop-management", "another-unknown"] }];
  const result = roundTrip(farms, VALID);
  assert("unknown modules stripped", !result?.[0]?.selectedModules?.includes("ghost-module"));
  assert("unknown modules stripped (2)", !result?.[0]?.selectedModules?.includes("another-unknown"));
  assert("known modules kept", result?.[0]?.selectedModules?.includes("field-crop-management"));
  assert("required module always present", result?.[0]?.selectedModules?.includes("red-tractor-compliance"));
}

console.log("\nred-tractor-compliance not duplicated:");
{
  const farms = [{ id: 1, name: "Test Farm", selectedModules: ["red-tractor-compliance", "field-crop-management"] }];
  const result = roundTrip(farms, VALID);
  const count = result?.[0]?.selectedModules?.filter(m => m === "red-tractor-compliance").length ?? 0;
  assert("red-tractor-compliance appears exactly once", count === 1);
}

console.log("\nNull/empty/garbage input:");
{
  assert("null returns null", parseFarmsParam(null, VALID) === null);
  assert("empty string returns null", parseFarmsParam("", VALID) === null);
  assert("invalid JSON returns null", parseFarmsParam("not-json!!!", VALID) === null);
  assert("non-array JSON returns null", parseFarmsParam('"hello"', VALID) === null);
  assert("empty array returns null", parseFarmsParam("[]", VALID) === null);
}

console.log("\nMalformed entries degrade gracefully:");
{
  // Entry with no name or modules
  const result = parseFarmsParam(JSON.stringify([["", ["field-crop-management"]]]), VALID);
  assert("blank name gets default", result?.[0]?.name === "Farm 1");
  assert("modules still parsed", result?.[0]?.selectedModules?.includes("field-crop-management"));
}

// ── Summary ─────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
