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

// Concurrent misses in the same coarse bucket share one request.
let resolveRequest!: (value: typeof entry) => void;
let requestCount = 0;
const createRequest = () => {
  requestCount += 1;
  return new Promise<typeof entry>((resolve) => {
    resolveRequest = resolve;
  });
};
const firstRequest = cache.getOrCreateInFlight(bucketKey, createRequest);
const nearbyRequest = cache.getOrCreateInFlight(bucketKey, createRequest);
assert.equal(firstRequest, nearbyRequest);
assert.equal(requestCount, 1);
resolveRequest(entry);
assert.deepEqual(await Promise.all([firstRequest, nearbyRequest]), [entry, entry]);
const requestAfterSuccess = cache.getOrCreateInFlight(bucketKey, async () => {
  requestCount += 1;
  return entry;
});
assert.deepEqual(await requestAfterSuccess, entry);
assert.equal(requestCount, 2);

// Settled requests are always cleared, including failures/timeouts represented
// by rejection, so the next call can retry.
let failedRequestCount = 0;
const rejectRequest = async () => {
  failedRequestCount += 1;
  throw new Error("timed out");
};
await assert.rejects(cache.getOrCreateInFlight(distantBucketKey, rejectRequest), /timed out/);
await assert.rejects(cache.getOrCreateInFlight(distantBucketKey, rejectRequest), /timed out/);
assert.equal(failedRequestCount, 2);

console.log("Open-Meteo cache bucket and in-flight checks passed.");