/**
 * Unit tests for mobile hooks that implement their own offline cache instead
 * of using buildCachedApiHook.
 *
 * Covered cache readers:
 *   - useMobileLookup
 *   - useApiStockItems
 *
 * These hooks intentionally have different return shapes from the shared
 * cached-hook factory, so they use runEffectHook from the same harness.
 *
 * The assertions verify:
 *   (a) fresh API data is written under the hook's cache key in the exact
 *       shape that a later offline read expects;
 *   (b) a stale cache hit is applied as-is rather than being filtered,
 *       reshaped, or silently replaced when the API is unavailable.
 *
 * useApiModules is also a direct kvSet user, but it is write-only persistence
 * for sync/module gating: it never reads cached records or returns offline
 * data. Its fresh-write behavior is covered by useApiModules-foreground-refresh.
 */

import {
  StateStore,
  runEffectHook,
  type HarnessContext,
} from './helpers/cachedHookHarness';

const mockHarness: HarnessContext = {
  store: new StateStore(),
  slotCounter: { value: 0 },
  capturedEffect: { value: null },
};

const mockKvGet = jest.fn<Promise<string | null>, [string]>();
const mockKvSet = jest.fn<Promise<void>, [string, string]>().mockResolvedValue(undefined);

jest.mock('@/lib/database', () => ({
  kvGet: (...args: [string]) => mockKvGet(...args),
  kvSet: (...args: [string, string]) => mockKvSet(...args),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('react', () => ({
  useState: (init: unknown) => {
    const idx = mockHarness.slotCounter.value++;
    return mockHarness.store.useState(idx, init);
  },
  useEffect: (fn: () => unknown, _deps?: unknown[]) => {
    if (!mockHarness.capturedEffect.value) {
      mockHarness.capturedEffect.value = fn;
    }
  },
}));

import {
  useApiStockItems,
  type ApiStockItem,
} from '../lib/hooks/useApiStockItems';
import { useMobileLookup } from '../lib/hooks/useMobileLookup';

const FARM_ID = '42';
const API_DOMAIN = 'api.example.com';

const FARM_CACHE = JSON.stringify({ tenantSlug: 'test-farm' });

beforeEach(() => {
  jest.clearAllMocks();
  mockKvSet.mockResolvedValue(undefined);
  mockKvGet.mockImplementation(async (key) => {
    if (key === 'bde_current_farm') return FARM_CACHE;
    return null;
  });
  mockHarness.capturedEffect.value = null;
  mockHarness.slotCounter.value = 0;
  process.env.EXPO_PUBLIC_DOMAIN = API_DOMAIN;
});


afterEach(() => {
  delete process.env.EXPO_PUBLIC_DOMAIN;
});

describe('useMobileLookup custom offline cache', () => {
  it('writes the active API values in lookup cache shape after a fresh fetch', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          { value: 'BBCH 11', isActive: true },
          { value: 'BBCH 15', isActive: false },
          { value: 'BBCH 19' },
        ],
      }),
    }) as unknown as typeof fetch;

    await runEffectHook(
      () => useMobileLookup('spray_bbch_stages', ['fallback']),
      mockHarness,
      [['fallback']],
    );

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    expect(mockKvSet).toHaveBeenCalledWith(
      'lookup_spray_bbch_stages',
      JSON.stringify(['BBCH 11', 'BBCH 19']),
    );
  });

  it('returns a stale cached lookup unchanged when the API is unavailable', async () => {
    const staleValues = ['BBCH 11', 'legacy stage', 'BBCH 19'];
    mockKvGet.mockImplementation(async (key) => {
      if (key === 'lookup_spray_bbch_stages') return JSON.stringify(staleValues);
      if (key === 'bde_current_farm') return FARM_CACHE;
      return null;
    });
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    const { states } = await runEffectHook(
      () => useMobileLookup('spray_bbch_stages', ['fallback']),
      mockHarness,
      [['fallback']],
    );

    expect(states[0]).toEqual(staleValues);
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it.each([
    ['malformed JSON', '{"broken":'],
    ['a valid non-array payload', JSON.stringify({ values: ['legacy stage'] })],
  ])('ignores %s and still attempts a fresh lookup request', async (_label, cached) => {
    mockKvGet.mockImplementation(async (key) => {
      if (key === 'lookup_spray_bbch_stages') return cached;
      if (key === 'bde_current_farm') return FARM_CACHE;
      return null;
    });
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    const { states } = await runEffectHook(
      () => useMobileLookup('spray_bbch_stages', ['fallback']),
      mockHarness,
      [['fallback']],
    );

    expect(states[0]).toEqual(['fallback']);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://${API_DOMAIN}/api/lookups/spray_bbch_stages`,
      expect.any(Object),
    );
    expect(mockKvSet).not.toHaveBeenCalled();
  });
});

describe('useApiStockItems custom offline cache', () => {
  const freshItems: ApiStockItem[] = [
    {
      id: 1,
      name: 'Foam cleaner',
      category: 'cleaning',
      unit: 'L',
      stockType: 'chemical',
    },
    {
      id: 2,
      name: 'Hand soap',
      category: null,
      unit: 'L',
      stockType: null,
    },
  ];

  it('writes the API records in stock-items cache shape after a fresh fetch', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        records: freshItems,
        staleFieldThatMustNotBeCached: 'ignored',
      }),
    }) as unknown as typeof fetch;

    await runEffectHook(
      () => useApiStockItems(FARM_ID),
      mockHarness,
      [[], false],
    );

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    expect(mockKvSet).toHaveBeenCalledWith(
      `stock_items_${FARM_ID}`,
      JSON.stringify(freshItems),
    );
  });

  it('returns a stale cached stock-items array unchanged when the API is unavailable', async () => {
    const staleItems: ApiStockItem[] = [
      {
        id: 9,
        name: 'Legacy disinfectant',
        category: 'DISINFECTANT',
        unit: 'L',
        stockType: 'old',
      },
      {
        id: 10,
        name: 'Legacy item',
        category: 'retired-category',
        unit: null,
        stockType: null,
      },
    ];
    mockKvGet.mockImplementation(async (key) => {
      if (key === `stock_items_${FARM_ID}`) return JSON.stringify(staleItems);
      if (key === 'bde_current_farm') return FARM_CACHE;
      return null;
    });
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    const { states } = await runEffectHook(
      () => useApiStockItems(FARM_ID),
      mockHarness,
      [[], false],
    );

    expect(states[0]).toEqual(staleItems);
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it.each([
    ['malformed JSON', '{"broken":'],
    ['a valid non-array payload', JSON.stringify({ records: freshItems })],
  ])('ignores %s and still attempts a fresh stock-items request', async (_label, cached) => {
    mockKvGet.mockImplementation(async (key) => {
      if (key === `stock_items_${FARM_ID}`) return cached;
      if (key === 'bde_current_farm') return FARM_CACHE;
      return null;
    });
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    const { states } = await runEffectHook(
      () => useApiStockItems(FARM_ID),
      mockHarness,
      [[], false],
    );

    expect(states[0]).toEqual([]);
    expect(states[1]).toBe(false);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://${API_DOMAIN}/api/farms/${FARM_ID}/stock-items`,
      expect.any(Object),
    );
    expect(mockKvSet).not.toHaveBeenCalled();
  });
});