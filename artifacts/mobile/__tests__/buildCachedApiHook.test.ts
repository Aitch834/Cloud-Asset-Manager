/**
 * Unit tests for buildCachedApiHook — cacheTransform path.
 *
 * We avoid @testing-library/react-native (which pulls in ESM expo modules that
 * break the node Jest environment) and instead drive the hook via the shared
 * cachedHookHarness utility.  See that file for a full explanation of the
 * approach.
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
// Harness — shared test infrastructure for buildCachedApiHook-based hooks
// ---------------------------------------------------------------------------

import {
  StateStore,
  drainAsync,
  rerenderHook,
  runHook,
  type HarnessContext,
} from './helpers/cachedHookHarness';

/**
 * Module-level harness.  A single const object is used so that the
 * jest.mock('react', ...) factory closures below and the runHook calls later
 * share the same object references throughout the test file's lifetime.
 *
 * IMPORTANT: The variable MUST be prefixed with `mock` (case-insensitive).
 * babel-jest's hoist plugin rejects any other name referenced inside a
 * jest.mock() factory with "not allowed to reference any out-of-scope
 * variables".  See cachedHookHarness.ts for the full explanation of why the
 * factory-closure pattern is safe despite hoisting.
 */
const mockHarness: HarnessContext = {
  store: new StateStore(),
  slotCounter: { value: 0 },
  capturedEffect: { value: null },
};

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
    const idx = mockHarness.slotCounter.value++;
    return mockHarness.store.useState(idx, init);
  },
  useEffect: (fn: () => unknown, _deps?: unknown[]) => {
    // Only capture the FIRST useEffect call — that's the one from
    // buildCachedApiHook that drives the cache/fetch flow.
    // Subsequent calls (e.g. the URL-caching side-effect in useApiVineBlocks)
    // are intentionally skipped; they don't affect the cache-transform assertions.
    if (!mockHarness.capturedEffect.value) {
      mockHarness.capturedEffect.value = fn;
    }
  },
  // useMemo: evaluate immediately — no dependency tracking needed in tests.
  useMemo: (fn: () => unknown, _deps?: unknown[]) => fn(),
  // useCallback: return the callback unchanged; dependency tracking is not
  // needed by this synchronous hook harness.
  useCallback: (fn: (...args: never[]) => unknown, _deps?: unknown[]) => fn,
  useRef: (initial: unknown) => ({ current: initial }),
}));

// ---------------------------------------------------------------------------
// Imports under test (after mocks are registered)
// ---------------------------------------------------------------------------

import { buildCachedApiHook } from '../lib/hooks/buildCachedApiHook';
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
  mockHarness.capturedEffect.value = null;
  mockHarness.slotCounter.value = 0;

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

// ---------------------------------------------------------------------------
// (a) kvSet is called with the cacheTransformed value after a fresh API fetch
// ---------------------------------------------------------------------------

describe('buildCachedApiHook — cacheTransform on cache write', () => {
  it('stores the transformed item (photoUrl: null) to kvSet, not the raw URL', async () => {
    await runHook(useTestHook, FARM_ID, mockHarness);

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

    await runHook(useNoTransform, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [, calledValue] = mockKvSet.mock.calls[0];
    const stored: TestItem[] = JSON.parse(calledValue);
    expect(stored[0].photoUrl).toBe(RAW_ITEM.photoUrl);   // URL preserved without transform
  });

  it('does not call kvSet when the API call fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    await runHook(useTestHook, FARM_ID, mockHarness);

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

    const result = await runHook<TestItem>(useTestHook, FARM_ID, mockHarness);

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

    const result = await runHook<TestItem>(useNoTransform, FARM_ID, mockHarness);

    expect(result.items[0].photoUrl).toBe(RAW_ITEM.photoUrl);
  });

  it('records lastError when API fails and cache is empty', async () => {
    mockKvGet.mockResolvedValue(null);
    global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

    const result = await runHook<TestItem>(useTestHook, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(0);
    expect(result.lastError).toBe('Network request failed');
  });
});

// ---------------------------------------------------------------------------
// (c) Live state after API response has the real (non-null) field value
// ---------------------------------------------------------------------------

describe('buildCachedApiHook — live state after API response', () => {
  it('exposes the real presigned URL in items after a successful API fetch', async () => {
    const result = await runHook<TestItem>(useTestHook, FARM_ID, mockHarness);

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

    const result = await runHook<TestItem>(useTestHook, FARM_ID, mockHarness);

    // Final state should have the real URL from the API
    expect(result.items[0].photoUrl).toBe(RAW_ITEM.photoUrl);
    expect(result.fromCache).toBe(false);
  });

  it('does not load anything and skips API when farmId is undefined', async () => {
    mockHarness.slotCounter.value = 0;
    mockHarness.store.reset([[], true, false, null]);
    useTestHook(undefined);

    if (mockHarness.capturedEffect.value) {
      const cleanup = mockHarness.capturedEffect.value();
      if (cleanup instanceof Promise) await cleanup;
    }

    const [items, , , lastError] = mockHarness.store.values as [TestItem[], boolean, boolean, string | null];
    expect(items).toHaveLength(0);
    expect(lastError).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('keeps current-farm items visible while a manual refresh starts', async () => {
    const refreshedItem = { ...RAW_ITEM, name: 'Block A (refreshed)' };
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ records: [RAW_ITEM] }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ records: [refreshedItem] }),
      } as unknown as Response);

    const first = await runHook<TestItem>(useTestHook, FARM_ID, mockHarness);
    expect(first.loadedForFarmId).toBe(FARM_ID);
    first.refresh();

    const transition: Array<{
      loadedForFarmId: string | undefined;
      items: TestItem[];
    }> = [];
    const refreshed = await rerenderHook<TestItem>(
      useTestHook,
      FARM_ID,
      mockHarness,
      () => {
        transition.push({
          loadedForFarmId: mockHarness.store.values[4] as string | undefined,
          items: mockHarness.store.values[0] as TestItem[],
        });
      },
    );

    expect(transition).toEqual([
      { loadedForFarmId: FARM_ID, items: [RAW_ITEM] },
    ]);
    expect(refreshed.loadedForFarmId).toBe(FARM_ID);
    expect(refreshed.items).toEqual([refreshedItem]);
  });
});

describe('buildCachedApiHook — local cache update', () => {
  it('updates state and cache without another fetch, then serves the update offline', async () => {
    const updatedItem = { ...RAW_ITEM, name: 'Block A (updated)' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records: [RAW_ITEM] }),
    } as unknown as Response);

    const result = await runHook<TestItem>(useTestHook, FARM_ID, mockHarness);
    expect(result.items[0].name).toBe(RAW_ITEM.name);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    result.updateItems((items) => items.map((item) => item.id === RAW_ITEM.id ? updatedItem : item));

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockHarness.store.values[0]).toEqual([updatedItem]);
    const stored = JSON.parse(mockKvSet.mock.calls[1][1]) as TestItem[];
    expect(stored[0].name).toBe(updatedItem.name);

    mockKvGet.mockResolvedValue(JSON.stringify([updatedItem]));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    mockHarness.capturedEffect.value = null;
    const remounted = await runHook<TestItem>(useTestHook, FARM_ID, mockHarness);
    expect(remounted.items[0].name).toBe(updatedItem.name);
  });

  it('ignores an older in-flight fetch after a local update', async () => {
    let resolveCache!: (value: string | null) => void;
    mockKvGet.mockImplementation((key: string) => {
      if (key === `test_cache_${FARM_ID}`) {
        return new Promise<string | null>((resolve) => {
          resolveCache = resolve;
        });
      }
      return Promise.resolve(null);
    });
    const fetchHelper = makePendingFetch();
    global.fetch = fetchHelper.mock;
    const updatedItem = { ...RAW_ITEM, name: 'Block A (saved)' };

    mockHarness.slotCounter.value = 0;
    mockHarness.store.reset([[RAW_ITEM], true, false, null, FARM_ID]);
    mockHarness.capturedEffect.value = null;
    const hookResult = useTestHook(FARM_ID) as {
      updateItems: (updater: (items: TestItem[]) => TestItem[]) => void;
    };
    const effect = mockHarness.capturedEffect.value;
    expect(effect).toBeDefined();
    effect!();
    resolveCache(null);
    await drainAsync(4);
    expect(fetchHelper.mock).toHaveBeenCalledTimes(1);

    hookResult.updateItems((items) =>
      items.map((item) => item.id === RAW_ITEM.id ? updatedItem : item),
    );
    fetchHelper.resolve({
      ok: true,
      json: async () => ({ records: [RAW_ITEM] }),
    } as unknown as Response);
    await drainAsync();

    expect(mockHarness.store.values[0]).toEqual([updatedItem]);
    expect(mockKvSet).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mockKvSet.mock.calls[0][1])[0].name).toBe(updatedItem.name);
  });
});

// ---------------------------------------------------------------------------
// (e) Cancellation guard — no state updates after cleanup fires
// ---------------------------------------------------------------------------

/** Build a fetch mock that rejects with an AbortError when the signal fires. */
function makePendingFetch(): {
  mock: jest.Mock;
  resolve: (v: Response) => void;
} {
  let resolveOuter!: (v: Response) => void;
  const mock = jest.fn().mockImplementation((_url: string, opts?: { signal?: AbortSignal }) => {
    return new Promise<Response>((res, rej) => {
      resolveOuter = res;
      if (opts?.signal) {
        opts.signal.addEventListener('abort', () => {
          const err = new Error('The operation was aborted.');
          err.name = 'AbortError';
          rej(err);
        });
      }
    });
  });
  return { mock, get resolve() { return resolveOuter; } };
}

describe('buildCachedApiHook — cancellation guard', () => {
  it('does not call setItems or setFromCache when cleanup fires before fetch resolves', async () => {
    // Keep kvGet permanently pending so no cache hit fires before we cancel.
    let resolveKvGet!: (v: string | null) => void;
    mockKvGet.mockReturnValue(
      new Promise<string | null>((res) => { resolveKvGet = res; })
    );

    // Keep the fetch permanently pending and signal-aware.
    const fetchHelper = makePendingFetch();
    global.fetch = fetchHelper.mock;

    // Initialise the hook — captures the effect callback but does NOT run it.
    mockHarness.slotCounter.value = 0;
    mockHarness.store.reset([[], true, false, null]);
    useTestHook(FARM_ID);

    // Fire the effect synchronously.  The hook body runs up to the async IIFE
    // and then returns the cleanup function immediately.
    let cleanup: (() => void) | undefined;
    if (mockHarness.capturedEffect.value) {
      const result = mockHarness.capturedEffect.value();
      if (typeof result === 'function') cleanup = result as () => void;
    }

    expect(cleanup).toBeDefined(); // sanity — hook must return cleanup

    // Cancel before any async work has had a chance to settle.
    // This calls controller.abort() — the signal is now aborted.
    cleanup!();

    // Let the cache read complete (returns null — no cached data).
    // When the IIFE resumes it will see controller.signal.aborted === true
    // and skip the cache-hit branch, then call fetch with the aborted signal.
    // The already-aborted signal prevents any state updates; we do NOT need to
    // manually resolve the fetch — the hook guards do the job.
    resolveKvGet(null);

    // Drain all microtask queues so the async IIFE has every opportunity to
    // call the state setters — which it must NOT do after abort.
    await drainAsync();

    const [items, , fromCache, lastError] = mockHarness.store.values as [TestItem[], boolean, boolean, string | null];

    // State must remain at the initial values because the abort guard prevents
    // any setter from firing and the AbortError is swallowed, not surfaced.
    expect(items).toHaveLength(0);
    expect(fromCache).toBe(false);
    expect(lastError).toBeNull();
    // fetch was invoked (the IIFE started) but its result was discarded.
    expect(global.fetch).toHaveBeenCalledTimes(1);
    // The signal must have been passed to fetch.
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    expect(fetchCall[1]).toHaveProperty('signal');
    expect(fetchCall[1].signal).toBeInstanceOf(AbortSignal);
  });

  it('does not call setItems when cleanup fires between cache read and fetch resolve', async () => {
    // Cache returns data immediately so the fromCache branch runs first.
    const cachedItems: TestItem[] = [{ ...RAW_ITEM, photoUrl: null }];
    mockKvGet.mockResolvedValue(JSON.stringify(cachedItems));

    // Hold the fetch pending so we can cancel after the cache branch fires.
    // Use the object reference (not destructure) so .resolve reads resolveOuter
    // after the mock implementation has set it.
    const fetchHelper2 = makePendingFetch();
    global.fetch = fetchHelper2.mock;

    mockHarness.slotCounter.value = 0;
    mockHarness.store.reset([[], true, false, null]);
    useTestHook(FARM_ID);

    let cleanup: (() => void) | undefined;
    if (mockHarness.capturedEffect.value) {
      const result = mockHarness.capturedEffect.value();
      if (typeof result === 'function') cleanup = result as () => void;
    }

    // Let the cache read settle (sets fromCache to true via setFromCache).
    await drainAsync(4);

    // Now cancel — controller.abort() fires, rejecting the pending fetch with AbortError.
    cleanup!();

    // Let the fetch resolve with a different item (the abort rejection wins,
    // but resolving here unblocks any remaining promise chains in the test).
    const freshItem: TestItem = { id: 99, name: 'Should not appear', photoUrl: 'https://s3.example.com/new.jpg' };
    fetchHelper2.resolve({
      ok: true,
      json: async () => ({ records: [freshItem] }),
    } as unknown as Response);

    await drainAsync();

    const [items, , , lastError] = mockHarness.store.values as [TestItem[], boolean, boolean, string | null];

    // The fresh item from the API must NOT have overwritten the state
    // (or there must be no items with the fresh id).
    const hasFreshItem = items.some((i) => (i as TestItem).id === 99);
    expect(hasFreshItem).toBe(false);
    // AbortError must not be surfaced as lastError.
    expect(lastError).toBeNull();
  });

  it('does not set lastError when the fetch is aborted (AbortError is swallowed)', async () => {
    // Make fetch immediately reject with an AbortError to simulate a very fast abort.
    const abortErr = new Error('The operation was aborted.');
    abortErr.name = 'AbortError';
    global.fetch = jest.fn().mockRejectedValue(abortErr);

    mockHarness.slotCounter.value = 0;
    mockHarness.store.reset([[], true, false, null]);
    useTestHook(FARM_ID);

    let cleanup: (() => void) | undefined;
    if (mockHarness.capturedEffect.value) {
      const result = mockHarness.capturedEffect.value();
      if (typeof result === 'function') cleanup = result as () => void;
    }

    cleanup?.();
    await drainAsync();

    const [, , , lastError] = mockHarness.store.values as [TestItem[], boolean, boolean, string | null];
    expect(lastError).toBeNull();
  });

  it('passes an AbortSignal to fetch', async () => {
    // Default setup: fetch resolves normally after signal check.
    await runHook(useTestHook, FARM_ID, mockHarness);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchOptions = (global.fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    expect(fetchOptions).toHaveProperty('signal');
    expect(fetchOptions.signal).toBeInstanceOf(AbortSignal);
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

  async function runVineHookToCompletion(): Promise<{
    blocks: VineBlock[];
    loading: boolean;
    fromCache: boolean;
    error: string | null;
  }> {
    const result = await runHook<VineBlock>(useApiVineBlocks, FARM_ID, mockHarness);
    const error = result.items.length === 0 && result.lastError ? result.lastError : null;
    return { blocks: result.items, loading: result.loading, fromCache: result.fromCache, error };
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

  it('aborts the in-flight vineyard-blocks request when the grower navigates back', async () => {
    mockKvGet.mockResolvedValue(null);

    let abortEventCount = 0;
    global.fetch = jest.fn().mockImplementation(
      (_url: string, options?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            abortEventCount += 1;
            const abortError = new Error('The operation was aborted.');
            abortError.name = 'AbortError';
            reject(abortError);
          }, { once: true });
        }),
    );

    mockHarness.slotCounter.value = 0;
    mockHarness.store.reset([[], true, false, null]);
    useApiVineBlocks(FARM_ID);

    let cleanup: (() => void) | undefined;
    const effect = mockHarness.capturedEffect.value;
    expect(effect).toBeDefined();
    const effectResult = effect!();
    if (typeof effectResult === 'function') cleanup = effectResult as () => void;

    // Wait until the endpoint request is in flight, then simulate immediate
    // back-navigation by running the effect cleanup.
    await drainAsync(4);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      `https://${API_DOMAIN}/api/farms/${FARM_ID}/vineyard-blocks`,
    );
    expect(cleanup).toBeDefined();

    cleanup!();
    await drainAsync();

    expect(abortEventCount).toBe(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(mockKvSet).not.toHaveBeenCalled();
    expect(mockHarness.store.values[0]).toEqual([]);
    expect(mockHarness.store.values[3]).toBeNull();
  });
});
