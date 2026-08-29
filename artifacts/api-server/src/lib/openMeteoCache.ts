export type OpenMeteoCacheEntry = {
  fetchedAt: number;
  forecastRainfall7dMm: number;
  forecastDailyMm: Array<{ date: string; mm: number }>;
};

const OPEN_METEO_CACHE_TTL_MS = 90 * 60 * 1000;
const OPEN_METEO_CACHE_MAX_SIZE = 500;

/** Minimal LRU cache backed by a Map (insertion-order → LRU). */
class LruCache<V> {
  private readonly max: number;
  private readonly map = new Map<string, V>();

  constructor(max: number) {
    this.max = max;
  }

  get(key: string): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.max) {
      this.map.delete(this.map.keys().next().value!);
    }
    this.map.set(key, value);
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  entries(): IterableIterator<[string, V]> {
    return this.map.entries();
  }
}

export function getOpenMeteoCacheKey(
  latitude: number,
  longitude: number,
  precision: number,
): string {
  return `${latitude.toFixed(precision)},${longitude.toFixed(precision)}`;
}

/**
 * Derive the read bucket from a stored precise key rather than comparing
 * incompatible string prefixes (for example, 51.12 is not a prefix of
 * 51.1234 followed by a comma).
 */
export function getOpenMeteoCacheBucketKey(
  preciseKey: string,
  precision = 2,
): string | undefined {
  const separator = preciseKey.indexOf(",");
  if (separator === -1) return undefined;

  const latitude = Number(preciseKey.slice(0, separator));
  const longitude = Number(preciseKey.slice(separator + 1));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;

  return getOpenMeteoCacheKey(latitude, longitude, precision);
}

export class OpenMeteoCache {
  private readonly cache: LruCache<OpenMeteoCacheEntry>;

  constructor(maxSize = OPEN_METEO_CACHE_MAX_SIZE) {
    this.cache = new LruCache(maxSize);
  }

  /**
   * Read the precise key first, then fall back to an existing entry in the
   * coarser ~1 km bucket. Writes remain at 4 dp while reads use 2 dp, so GPS
   * drift does not cause a new outbound request for every position.
   */
  get(preciseKey: string, lookupKey: string): OpenMeteoCacheEntry | undefined {
    const now = Date.now();
    const precise = this.cache.get(preciseKey);
    if (precise && now - precise.fetchedAt < OPEN_METEO_CACHE_TTL_MS) {
      return precise;
    }

    for (const [key] of this.cache.entries()) {
      if (getOpenMeteoCacheBucketKey(key) !== lookupKey) continue;
      const entry = this.cache.get(key);
      if (entry && now - entry.fetchedAt < OPEN_METEO_CACHE_TTL_MS) {
        return entry;
      }
    }

    return undefined;
  }

  set(key: string, entry: OpenMeteoCacheEntry): void {
    this.cache.set(key, entry);
    this.prune();
  }

  private prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.fetchedAt >= OPEN_METEO_CACHE_TTL_MS) {
        this.cache.delete(key);
      }
    }
  }
}