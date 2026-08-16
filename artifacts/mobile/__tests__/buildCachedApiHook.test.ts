/**
 * Unit tests for buildCachedApiHook — cacheTransform path.
 *
 * We avoid @testing-library/react-native (which pulls in ESM expo modules that
 * break the node Jest environment) and instead drive the hook by mocking React's
 * useState/useEffect to run synchronously and capturing state updates directly.
 *
 * Assertions:
 *   (a) Fresh API response → kvSet is called with the cacheTransformed value
 *       (presigned URL nulled in cache, not the original URL).
 *   (b) Stale cache read → cacheTransform is re-applied on load so the item
 *       returned has the field nulled (old cache entries sanitised on every read).
 *   (c) Live state after an API response → items contain the real URL, not null.
 *   (d) useApiVineBlocks: coverPhotoUrl is null in cache, real URL in live state.
 */

// ---------------------------------------------------------------------------
// Minimal synchronous hook runner
// ---------------------------------------------------------------------------

/**
 * A very small state-slot tracker that replaces useState.
 * Each slot stores the current value and provides a setter.
 * Slots are assigned in the order useState is first called within one run.
 */
class StateStore {
  private slots: unknown[] = [];
  private initialized = false;

  /** Reset to initial values (next run re-uses same slots). */
  reset(initialValues: unknown[]) {
    this.slots = [...initialValues];
    this.initialized = true;
  }

  /** Get all current values. */
  get values() { return this.slots; }

  /**
   * Return a [getter, setter] pair for the nth slot.
   * In real React, useState(init) only uses init on the first call.
   * We replicate that: first call per slot index sets the initial value,
   * subsequent calls return the current (possibly updated) value.
   */
  useState(slotIdx: number, init: unknown): [unknown, (v: unknown) => void] {
    if (!this.initialized || this.slots.length <= slotIdx) {
      // First call for this slot — use the initializer
      while (this.slots.length <= slotIdx) this.slots.push(undefined);
      this.slots[slotIdx] = typeof init === 'function' ? (init as () => unknown)() : init;
    }
    const setter = (v: unknown) => {
      this.slots[slotIdx] = typeof v === 'function'
        ? (v as (prev: unknown) => unknown)(this.slots[slotIdx])
        : v;
    };
    return [this.slots[slotIdx], setter];
  }
}

const mockStore = new StateStore();
let mockSlotCounter = 0;
/** Captures the useEffect async callback so tests can await it. */
let mockCapturedEffect: (() => unknown) | null = null;

// ---------------------------------------------------------------------------
// Mocks — must be declared before any import that triggers module evaluation
// ---------------------------------------------------------------------------

const mockKvGet = jest.fn<Promise<string | null>, [string]>();
const mockKvSet = jest.fn<Promise<void>, [string, string]>().mockResolvedValue(undefined);

jest.mock('@/lib/database', () => ({
  kvGet: (...args: [string]) => mockKvGet(...args),
  kvSet: (...args: [string, string]) => mockKvSet(...args),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
}));

jest.mock('react', () => ({
  useState: (init: unknown) => {
    const idx = mockSlotCounter++;
    return mockStore.useState(idx, init);
  },
  useEffect: (fn: () => unknown, _deps?: unknown[]) => {
    // Only capture the FIRST useEffect call — that's the one from
    // buildCachedApiHook that drives the cache/fetch flow.
    // Subsequent calls (e.g. the URL-caching side-effect in useApiVineBlocks)
    // are intentionally skipped; they don't affect the cache-transform assertions.
    if (!mockCapturedEffect) {
      mockCapturedEffect = fn;
    }
  },
  // useMemo: evaluate immediately — no dependency tracking needed in tests.
  useMemo: (fn: () => unknown, _deps?: unknown[]) => fn(),
}));

// ---------------------------------------------------------------------------
// Imports under test (after mocks are registered)
// ---------------------------------------------------------------------------

import { buildCachedApiHook, CachedHookResult } from '../lib/hooks/buildCachedApiHook';
import { useApiVineBlocks, VineBlock } from '../lib/hooks/useApiVineBlocks';

// ---------------------------------------------------------------------------
// Helper types and constants
// ---------------------------------------------------------------------------

interface TestItem {
  id: number;
  name: string;
  photoUrl: string | null;
}

const FARM_ID = '42';
const API_DOMAIN = 'api.example.com';

const RAW_ITEM: TestItem = {
  id: 1,
  name: 'Block A',
  photoUrl: 'https://s3.example.com/photo?X-Amz-Expires=300',
};

const cacheTransformFn = (item: TestItem): TestItem => ({ ...item, photoUrl: null });

const useTestHook = buildCachedApiHook<TestItem>(
  (farmId) => `test_cache_${farmId}`,
  (farmId, domain) => `${domain}/api/farms/${farmId}/items`,
  (json) => (json as { records: TestItem[] }).records,
  cacheTransformFn,
);

// ---------------------------------------------------------------------------
// Per-test setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  mockKvSet.mockResolvedValue(undefined);
  mockKvGet.mockResolvedValue(null);
  mockCapturedEffect = null;
  mockSlotCounter = 0;

  // babel-preset-expo injects __DEV__ references; define it for the node env.
  (global as unknown as Record<string, unknown>).__DEV__ = false;

  // Default fresh-fetch response
  process.env.EXPO_PUBLIC_DOMAIN = API_DOMAIN;
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ records: [RAW_ITEM] }),
  } as unknown as Response);
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_DOMAIN;
});

/**
 * Drain all pending promises/microtasks by yielding to the event loop
 * several times.  The hook's useEffect body is a fire-and-forget async IIFE
 * so we cannot await it directly — instead we flush until all settled.
 */
const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

async function drainAsync(rounds = 8): Promise<void> {
  for (let i = 0; i < rounds; i++) await flushPromises();
}

/**
 * Run the hook once (captures the effect callback), fire the effect, drain
 * all async work, then return the final state slots.
 */
async function runHook<T>(
  hookFn: (farmId: string | undefined) => CachedHookResult<T>,
  farmId: string,
  initialSlots = [[], true, false, null],
): Promise<CachedHookResult<T>> {
  mockSlotCounter = 0;
  mockStore.reset(initialSlots);
  hookFn(farmId);

  // Fire the captured useEffect callback (synchronous wrapper that starts
  // the internal async IIFE fire-and-forget).
  if (mockCapturedEffect) mockCapturedEffect();

  // Drain until all pending promises have settled.
  await drainAsync();

  const [items, loading, fromCache, lastError] = mockStore.values as [T[], boolean, boolean, string | null];
  return { items, loading, fromCache, lastError };
}

// ---------------------------------------------------------------------------
// (a) kvSet is called with the cacheTransformed value after a fresh API fetch
// ---------------------------------------------------------------------------

describe('buildCachedApiHook — cacheTransform on cache write', () => {
  it('stores the transformed item (photoUrl: null) to kvSet, not the raw URL', async () => {
    await runHook(useTestHook, FARM_ID);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [calledKey, calledValue] = mockKvSet.mock.calls[0];
    expect(calledKey).toBe(`test_cache_${FARM_ID}`);

    const stored: TestItem[] = JSON.parse(calledValue);
    expect(stored).toHaveLength(1);
    expect(stored[0].photoUrl).toBeNull();          // URL must NOT be persisted
    expect(stored[0].id).toBe(RAW_ITEM.id);         // other fields survive
    expect(stored[0].name).toBe(RAW_ITEM.name);
  });

  it('stores the raw item unchanged when no cacheTransform is provided', async () => {
    const useNoTransform = buildCachedApiHook<TestItem>(
      (farmId) => `no_transform_${farmId}`,
      (farmId, domain) => `${domain}/api/farms/${farmId}/items`,
      (json) => (json as { records: TestItem[] }).records,
      // no cacheTransform
    );

    await runHook(useNoTransform, FARM_ID);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [, calledValue] = mockKvSet.mock.calls[0];
    const stored: TestItem[] = JSON.parse(calledValue);
    expect(stored[0].photoUrl).toBe(RAW_ITEM.photoUrl);   // URL preserved without transform
  });

  it('does not call kvSet when the API call fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    await runHook(useTestHook, FARM_ID);

    expect(mockKvSet).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// (b) cacheTransform is re-applied when reading from stale cache
// ---------------------------------------------------------------------------

describe('buildCachedApiHook — cacheTransform on cache read', () => {
  it('strips stale presigned URL from cache (even if old cache entry contains the URL)', async () => {
    // Simulate pre-fix cache that still stores the raw URL
    const staleCache: TestItem[] = [{ ...RAW_ITEM }];
    mockKvGet.mockResolvedValue(JSON.stringify(staleCache));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook(useTestHook, FARM_ID);

    // Must have loaded something from cache
    expect(result.items).toHaveLength(1);
    // URL must be nulled by cacheTransform applied on read
    expect(result.items[0].photoUrl).toBeNull();
    // Other fields unaffected
    expect(result.items[0].id).toBe(RAW_ITEM.id);
  });

  it('returns untransformed cached items when no cacheTransform is provided', async () => {
    const staleCache: TestItem[] = [{ ...RAW_ITEM }];
    mockKvGet.mockResolvedValue(JSON.stringify(staleCache));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const useNoTransform = buildCachedApiHook<TestItem>(
      (farmId) => `test_cache_${farmId}`,
      (farmId, domain) => `${domain}/api/farms/${farmId}/items`,
      (json) => (json as { records: TestItem[] }).records,
    );

    const result = await runHook(useNoTransform, FARM_ID);

    expect(result.items[0].photoUrl).toBe(RAW_ITEM.photoUrl);
  });

  it('records lastError when API fails and cache is empty', async () => {
    mockKvGet.mockResolvedValue(null);
    global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

    const result = await runHook(useTestHook, FARM_ID);

    expect(result.items).toHaveLength(0);
    expect(result.lastError).toBe('Network request failed');
  });
});

// ---------------------------------------------------------------------------
// (c) Live state after API response has the real (non-null) field value
// ---------------------------------------------------------------------------

describe('buildCachedApiHook — live state after API response', () => {
  it('exposes the real presigned URL in items after a successful API fetch', async () => {
    const result = await runHook(useTestHook, FARM_ID);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].photoUrl).toBe(RAW_ITEM.photoUrl);   // real URL in live state
    expect(result.fromCache).toBe(false);
  });

  it('overwrites stale cached (null) URL with real URL after fetch', async () => {
    // Cache has null URL (written by the post-fix app)
    const cachedWithNull: TestItem[] = [{ ...RAW_ITEM, photoUrl: null }];
    mockKvGet.mockResolvedValue(JSON.stringify(cachedWithNull));

    // API returns fresh item with a real URL
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records: [RAW_ITEM] }),
    } as unknown as Response);

    const result = await runHook(useTestHook, FARM_ID);

    // Final state should have the real URL from the API
    expect(result.items[0].photoUrl).toBe(RAW_ITEM.photoUrl);
    expect(result.fromCache).toBe(false);
  });

  it('does not load anything and skips API when farmId is undefined', async () => {
    mockSlotCounter = 0;
    mockStore.reset([[], true, false, null]);
    useTestHook(undefined);

    if (mockCapturedEffect) {
      const cleanup = mockCapturedEffect();
      if (cleanup instanceof Promise) await cleanup;
    }

    const [items, , , lastError] = mockStore.values as [TestItem[], boolean, boolean, string | null];
    expect(items).toHaveLength(0);
    expect(lastError).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockKvSet).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// (d) useApiVineBlocks — coverPhotoUrl specifically
// ---------------------------------------------------------------------------

describe('useApiVineBlocks — coverPhotoUrl cacheTransform', () => {
  const VINE_BLOCK: VineBlock = {
    id: 7,
    blockName: 'Merlot South',
    blockRef: 'MS-01',
    variety: 'Merlot',
    rootstock: 'SO4',
    areaHa: 1.2,
    numberOfVines: 800,
    plantingStatus: 'established',
    isActive: true,
    isOrganicBlock: false,
    coverPhotoUrl: 'https://s3.example.com/cover.jpg?X-Amz-Expires=300&X-Amz-Signature=abc123',
  };

  function runVineHook(): ReturnType<typeof useApiVineBlocks> {
    mockSlotCounter = 0;
    mockStore.reset([[], true, false, null]);
    return useApiVineBlocks(FARM_ID);
  }

  async function runVineHookToCompletion(): Promise<{ blocks: VineBlock[]; loading: boolean; fromCache: boolean; error: string | null }> {
    runVineHook();
    if (mockCapturedEffect) mockCapturedEffect();
    await drainAsync();
    const [items, loading, fromCache, lastError] = mockStore.values as [VineBlock[], boolean, boolean, string | null];
    const error = items.length === 0 && lastError ? lastError : null;
    return { blocks: items, loading, fromCache, error };
  }

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records: [VINE_BLOCK] }),
    } as unknown as Response);
  });

  it('stores coverPhotoUrl as null in kvSet — presigned URL never persisted', async () => {
    mockKvGet.mockResolvedValue(null);

    await runVineHookToCompletion();

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [, raw] = mockKvSet.mock.calls[0];
    const stored: VineBlock[] = JSON.parse(raw);
    expect(stored[0].coverPhotoUrl).toBeNull();
  });

  it('exposes the real coverPhotoUrl in live state after API response', async () => {
    mockKvGet.mockResolvedValue(null);

    const { blocks } = await runVineHookToCompletion();

    expect(blocks).toHaveLength(1);
    expect(blocks[0].coverPhotoUrl).toBe(VINE_BLOCK.coverPhotoUrl);
  });

  it('sanitises stale cache entries that contain an old coverPhotoUrl', async () => {
    const staleBlocks: VineBlock[] = [{ ...VINE_BLOCK }];   // URL present in old cache
    mockKvGet.mockResolvedValue(JSON.stringify(staleBlocks));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const { blocks, fromCache } = await runVineHookToCompletion();

    expect(fromCache).toBe(true);
    expect(blocks[0].coverPhotoUrl).toBeNull();
  });

  it('filters out removed and no_planting blocks via the transform', async () => {
    const blocks: VineBlock[] = [
      { ...VINE_BLOCK, id: 1, plantingStatus: 'established' },
      { ...VINE_BLOCK, id: 2, plantingStatus: 'removed' },
      { ...VINE_BLOCK, id: 3, plantingStatus: 'no_planting' },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records: blocks }),
    } as unknown as Response);

    const { blocks: result } = await runVineHookToCompletion();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });
});
