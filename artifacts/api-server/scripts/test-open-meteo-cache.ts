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
assert.deepEqual(
  cache.get(nearbyPreciseKey, bucketKey),
  entry,
  "nearby coordinates in the same coarse bucket should reuse the cached forecast",
);

// A coordinate in another two-decimal bucket must not reuse the forecast.
const distantPreciseKey = getOpenMeteoCacheKey(51.1335, -0.1335, 4);
const distantBucketKey = getOpenMeteoCacheKey(51.1335, -0.1335, 2);
assert.equal(
  cache.get(distantPreciseKey, distantBucketKey),
  undefined,
  "coordinates in a different coarse bucket should not reuse the cached forecast",
);

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
assert.equal(
  firstRequest,
  nearbyRequest,
  "concurrent requests in the same coarse bucket should share one in-flight promise",
);
assert.equal(
  requestCount,
  1,
  "concurrent requests in the same coarse bucket should start only one fetch",
);
resolveRequest(entry);
assert.deepEqual(
  await Promise.all([firstRequest, nearbyRequest]),
  [entry, entry],
  "all deduplicated callers should receive the successful forecast",
);
const requestAfterSuccess = cache.getOrCreateInFlight(bucketKey, async () => {
  requestCount += 1;
  return entry;
});
assert.deepEqual(
  await requestAfterSuccess,
  entry,
  "a new request should succeed after the prior in-flight request settles",
);
assert.equal(
  requestCount,
  2,
  "successful in-flight requests should be removed so a later request can fetch again",
);

// Settled requests are always cleared, including failures/timeouts represented
// by rejection, so the next call can retry.
let failedRequestCount = 0;
const rejectRequest = async () => {
  failedRequestCount += 1;
  throw new Error("timed out");
};
await assert.rejects(
  cache.getOrCreateInFlight(distantBucketKey, rejectRequest),
  /timed out/,
  "the original in-flight failure should reach the caller",
);
await assert.rejects(
  cache.getOrCreateInFlight(distantBucketKey, rejectRequest),
  /timed out/,
  "a later request should retry rather than reuse the rejected promise",
);
assert.equal(
  failedRequestCount,
  2,
  "failed in-flight requests should be removed so the next call can retry",
);

console.log("Open-Meteo cache bucket and in-flight checks passed.");