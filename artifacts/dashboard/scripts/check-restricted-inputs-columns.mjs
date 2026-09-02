#!/usr/bin/env node
/**
 * Ensures the Restricted Inputs CSV and print report stay wired to the shared
 * column definitions. The companion Vitest test compares the resulting
 * headers; this guard prevents either UI path from quietly reintroducing its
 * own manual header list.
 */

import fs from "node:fs";
import path from "node:path";

const pagePath = path.resolve(import.meta.dirname, "../src/pages/OrganicPage.tsx");
const source = fs.readFileSync(pagePath, "utf8");

function functionBody(name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) return null;

  const openBrace = source.indexOf("{", start);
  if (openBrace < 0) return null;

  let depth = 0;
  let quote = null;
  for (let index = openBrace; index < source.length; index += 1) {
    const character = source[index];
    const previous = source[index - 1];

    if (quote) {
      if (character === quote && previous !== "\\") quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openBrace, index + 1);
    }
  }
  return null;
}

const checks = [
  ["exportRestrictedInputsCsv", ["getRestrictedInputCsvHeaders", "getRestrictedInputValues"]],
  ["printRestrictedInputsLog", ["getRestrictedInputPrintHeaderHtml", "getRestrictedInputValues"]],
];
const failures = [];

for (const [name, requiredReferences] of checks) {
  const body = functionBody(name);
  if (!body) {
    failures.push(`${name} could not be found or parsed`);
    continue;
  }
  for (const reference of requiredReferences) {
    if (!body.includes(reference)) {
      failures.push(`${name} must use ${reference}`);
    }
  }
}

if (failures.length > 0) {
  console.error("✗ Restricted Inputs CSV/print column guard failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("✓ Restricted Inputs CSV and print report use shared column definitions.");