#!/usr/bin/env node
/**
 * check-hardcoded-prices.mjs
 *
 * Greps artifacts/website/src/ for bare £N/month price literals in .ts/.tsx
 * files.  Exits 1 (failing CI) if any are found so that stale hardcoded prices
 * cannot slip back into marketing copy.
 *
 * Excluded files (these are the canonical sources / intentional price lists):
 *   - pricing-data.ts
 *   - Pricing.tsx
 *   - Sectors.tsx
 *
 * Usage:
 *   node artifacts/website/scripts/check-hardcoded-prices.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, "../src");

// Files whose names are excluded from the check (they ARE the price sources).
const EXCLUDED_FILENAMES = new Set(["pricing-data.ts", "Pricing.tsx", "Sectors.tsx"]);

// Pattern: £ followed by one or more digits, followed by /month (case-insensitive).
// This catches things like "£15/month", "£15 /month", "£15/Month".
const PRICE_RE = /£\d+\s*\/\s*month/i;

function* walkTs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") continue;
      yield* walkTs(full);
    } else if (/\.tsx?$/.test(entry.name) && !EXCLUDED_FILENAMES.has(entry.name)) {
      yield full;
    }
  }
}

const hits = [];

for (const file of walkTs(SRC_DIR)) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (PRICE_RE.test(lines[i])) {
      hits.push({ file: path.relative(process.cwd(), file), line: i + 1, text: lines[i].trim() });
    }
  }
}

if (hits.length === 0) {
  console.log("✓ No hardcoded £N/month price literals found in website source.");
  process.exit(0);
} else {
  console.error(`✗ Found ${hits.length} hardcoded £N/month literal(s) in website source.\n`);
  console.error(
    "  Use modulePrice() or BASE_FEE from artifacts/website/src/lib/pricing-data.ts instead of\n" +
    "  embedding raw price numbers in marketing copy.\n"
  );
  for (const { file, line, text } of hits) {
    console.error(`  ${file}:${line}  ${text}`);
  }
  process.exit(1);
}
