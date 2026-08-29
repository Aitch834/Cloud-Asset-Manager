import assert from "node:assert/strict";
import {
  OpenMeteoCache,
  getOpenMeteoCacheKey,
} from "../src/lib/openMeteoCache";

const cache = new OpenMeteoCache();
const entry = {
  fetchedAt: Date.now(),
  forecastRainfall7dMm: 12.3,
  forecastDailyMm: [{ date: "2026-08-29", mm: 1.8 }],
};

const firstPreciseKey = getOpenMeteoCacheKey(51.1234, -0.1234, 4);
const bucketKey = getOpenMeteoCacheKey(51.1234, -0.1234, 2);
cache.set(firstPreciseKey, entry);

// A different four-decimal coordinate in the same two-decimal bucket reuses
// the first forecast instead of causing another fetch.
const nearbyPreciseKey = getOpenMeteoCacheKey(51.1235, -0.1235, 4);
assert.deepEqual(cache.get(nearbyPreciseKey, bucketKey), entry);

// A coordinate in another two-decimal bucket must not reuse the forecast.
const distantPreciseKey = getOpenMeteoCacheKey(51.1335, -0.1335, 4);
const distantBucketKey = getOpenMeteoCacheKey(51.1335, -0.1335, 2);
assert.equal(cache.get(distantPreciseKey, distantBucketKey), undefined);

console.log("Open-Meteo cache bucket checks passed.");