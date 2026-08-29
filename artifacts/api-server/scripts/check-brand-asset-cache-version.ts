#!/usr/bin/env tsx
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { resolveStableVersionedValue } from "../src/lib/versioned-cache";

const BRAND_KEYS = ["brand.adLogoDataUrl", "brand.adQrDataUrl"] as const;

function contentVersion(rows: Record<string, string>): string {
  const serialized = BRAND_KEYS
    .filter((key) => Object.hasOwn(rows, key))
    .sort()
    .map((key) => `${key}\0${rows[key]}`)
    .join("\x01");
  return crypto.createHash("md5").update(serialized).digest("hex");
}

// Both uploads deliberately have the same timestamp. The first render is
// interleaved between them and observes a mixed pair. A MAX(updated_at) key
// would accept it; the content digest changes and the production stability
// helper must force a second render.
const equalTimestamp = new Date("2026-08-29T12:00:00.000Z");
let rows: Record<string, string> = {
  "brand.adLogoDataUrl": "logo-old",
  "brand.adQrDataUrl": "qr-old",
};
const initialVersion = contentVersion(rows);

rows = { ...rows, "brand.adLogoDataUrl": "logo-new" };
const logoUpdatedAt = equalTimestamp;
const versionAfterLogo = contentVersion(rows);
let renders = 0;

const result = await resolveStableVersionedValue(
  versionAfterLogo,
  async () => {
    renders += 1;
    const snapshot = {
      logoUri: rows["brand.adLogoDataUrl"],
      qrUri: rows["brand.adQrDataUrl"],
    };
    if (renders === 1) {
      rows = { ...rows, "brand.adQrDataUrl": "qr-new" };
    }
    return snapshot;
  },
  async () => contentVersion(rows),
);
const qrUpdatedAt = equalTimestamp;

assert.equal(logoUpdatedAt.getTime(), qrUpdatedAt.getTime());
assert.notEqual(initialVersion, versionAfterLogo);
assert.equal(renders, 2, "a concurrent upload during refresh must force another render");
assert.deepEqual(result.value, { logoUri: "logo-new", qrUri: "qr-new" });
assert.equal(result.version, contentVersion(rows));

console.log("PASS brand-asset cache rejects an equal-timestamp mixed refresh");