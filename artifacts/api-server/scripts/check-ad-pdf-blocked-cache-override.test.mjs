import assert from "node:assert/strict";
import test from "node:test";
import {
  BLOCKED_CACHE_OVERRIDE_MESSAGE,
  overrideAdBrandAssetCache,
} from "./lib/ad-brand-asset-cache-override.mjs";

test("a blocked cache override reports the production endpoint message and stops render checks", async () => {
  const requests = [];
  let renderAssertionsRun = false;

  const call = async (method, path, body) => {
    requests.push({ method, path, body });
    return { status: 404, json: { error: "Not found" } };
  };

  await assert.rejects(
    async () => {
      await overrideAdBrandAssetCache(call, "logo-data-uri", "qr-data-uri");
      renderAssertionsRun = true;
    },
    (error) => {
      assert.equal(error.message, BLOCKED_CACHE_OVERRIDE_MESSAGE);
      return true;
    },
  );

  assert.deepEqual(requests, [
    {
      method: "PUT",
      path: "/admin/ad-brand-assets/cache",
      body: { logoUri: "logo-data-uri", qrUri: "qr-data-uri" },
    },
  ]);
  assert.equal(renderAssertionsRun, false);
});