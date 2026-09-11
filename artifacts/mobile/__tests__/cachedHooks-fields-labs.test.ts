/**
 * Unit tests for buildCachedApiHook-based hooks: fields and labs.
 *
 * Covered hooks:
 *   - useApiFields  (records key, filter: isActive !== false, demo-mode wrapper)
 *   - useApiLabs    (records key, filter: isActive !== false, demo-mode wrapper)
 *
 * Both hooks wrap the raw buildCachedApiHook hook with a demo-mode guard.
 * In tests, isDemoFarmId is mocked to always return false so the API path is
 * exercised normally.  Neither hook supplies a cacheTransform.
 *
 * The assertions verify:
 *   (a) kvSet is called with the correctly-filtered items after a fresh fetch.
 *   (b) Stale cache items are returned as-is (no re-transform on cache-read).
 *   (c) Live state holds the real API values after a successful fetch.
 *   (d) Inactive items are excluded from kvSet and from live state.
 */

import {
  StateStore,
  drainAsync,
  rerenderHook,
  runHook,
  type HarnessContext,
} from './helpers/cachedHookHarness';

// ---------------------------------------------------------------------------
// Module-level harness — MUST use the `mock` prefix (babel-jest hoist rule).
// ---------------------------------------------------------------------------
const mockHarness: HarnessContext = {
  store: new StateStore(),
  slotCounter: { value: 0 },
  capturedEffect: { value: null },
};

// ---------------------------------------------------------------------------
// Mocks
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

// Prevent demo-mode path from activating; we always test the real API flow.
jest.mock('@/lib/demo/demoData', () => ({
  isDemoFarmId: (_farmId: string | undefined) => false,
  getDemoFields: (_farmId: string) => [],
  getDemoLabs: (_farmId: string) => [],
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
  useMemo: (fn: () => unknown, _deps?: unknown[]) => fn(),
  useCallback: (fn: (...args: never[]) => unknown, _deps?: unknown[]) => fn,
  useRef: (initial: unknown) => ({ current: initial }),
}));

// ---------------------------------------------------------------------------
// Imports under test (after mocks are registered)
// ---------------------------------------------------------------------------

import { useApiFields, type ApiField } from '../lib/hooks/useApiFields';
import { useApiLabs, type ApiLab } from '../lib/hooks/useApiLabs';

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

const FARM_ID = '77';
const API_DOMAIN = 'api.example.com';

beforeEach(() => {
  jest.clearAllMocks();
  mockKvSet.mockResolvedValue(undefined);
  mockKvGet.mockResolvedValue(null);
  mockHarness.capturedEffect.value = null;
  mockHarness.slotCounter.value = 0;
  (global as unknown as Record<string, unknown>).__DEV__ = false;
  process.env.EXPO_PUBLIC_DOMAIN = API_DOMAIN;
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_DOMAIN;
});

// ===========================================================================
// useApiFields
// ===========================================================================

describe('useApiFields', () => {
  const ACTIVE_FIELD: ApiField = {
    id: 1,
    name: 'Top Field',
    areaSqMetres: 50000,
    areaHectares: '5.00',
    computedFarmableAreaHa: '4.80',
    soilType: 'sandy loam',
    currentUse: 'arable',
    isActive: true,
  };
  const INACTIVE_FIELD: ApiField = {
    ...ACTIVE_FIELD,
    id: 2,
    name: 'Old Field',
    isActive: false,
  };

  function apiResponse(records: ApiField[]) {
    return { ok: true, json: async () => ({ records }) } as unknown as Response;
  }

  it('writes only active fields to kvSet after a fresh fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_FIELD, INACTIVE_FIELD]));

    await runHook<ApiField>(useApiFields, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_fields_${FARM_ID}`);
    const stored: ApiField[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(ACTIVE_FIELD.id);
    expect(stored[0].isActive).toBe(true);
  });

  it('live state contains only active fields after fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_FIELD, INACTIVE_FIELD]));

    const result = await runHook<ApiField>(useApiFields, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(ACTIVE_FIELD.id);
    expect(result.items[0].name).toBe(ACTIVE_FIELD.name);
    expect(result.fromCache).toBe(false);
  });

  it('keeps cached fields when the API response loses its records key', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([ACTIVE_FIELD]));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ fields: [ACTIVE_FIELD] }),
    } as unknown as Response);

    const result = await runHook<ApiField>(useApiFields, FARM_ID, mockHarness);

    expect(result.items).toEqual([ACTIVE_FIELD]);
    expect(result.fromCache).toBe(true);
    expect(result.lastError).toBe('Invalid fields response: expected records array');
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('clears the previous farm before loading the next farm fields', async () => {
    const farmAField = { ...ACTIVE_FIELD, id: 101, name: 'Farm A Field' };
    const farmBField = { ...ACTIVE_FIELD, id: 202, name: 'Farm B Field' };
    const farmAId = FARM_ID;
    const farmBId = '78';

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(apiResponse([farmAField]))
      .mockResolvedValueOnce(apiResponse([farmBField]));

    const first = await runHook<ApiField>(useApiFields, farmAId, mockHarness);
    expect(first.loadedForFarmId).toBe(farmAId);
    expect(first.items).toEqual([farmAField]);

    const transition: Array<{
      loadedForFarmId: string | undefined;
      items: ApiField[];
    }> = [];
    const second = await rerenderHook<ApiField>(
      useApiFields,
      farmBId,
      mockHarness,
      () => {
        transition.push({
          loadedForFarmId: mockHarness.store.values[4] as string | undefined,
          items: mockHarness.store.values[0] as ApiField[],
        });
      },
    );

    expect(transition).toEqual([
      { loadedForFarmId: undefined, items: [] },
    ]);
    expect(second.loadedForFarmId).toBe(farmBId);
    expect(second.items).toEqual([farmBField]);
    expect(second.items).not.toContainEqual(farmAField);
  });

  it('returns cached fields as-is when API is offline', async () => {
    const cached: ApiField[] = [ACTIVE_FIELD];
    mockKvGet.mockResolvedValue(JSON.stringify(cached));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiField>(useApiFields, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(ACTIVE_FIELD.id);
    expect(result.fromCache).toBe(true);
  });

  it('sets lastError when API fails and cache is empty', async () => {
    mockKvGet.mockResolvedValue(null);
    global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

    const result = await runHook<ApiField>(useApiFields, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(0);
    expect(result.lastError).toBe('Network request failed');
  });

  it('does not call kvSet when the API fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('timeout'));

    await runHook<ApiField>(useApiFields, FARM_ID, mockHarness);

    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('writes an empty array to kvSet when API returns no active fields', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([INACTIVE_FIELD]));

    await runHook<ApiField>(useApiFields, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [, raw] = mockKvSet.mock.calls[0];
    const stored: ApiField[] = JSON.parse(raw);
    expect(stored).toHaveLength(0);
  });

  it('overwrites cache with fresh active fields when both cache and API exist', async () => {
    // Seed cache with a now-inactive field that the API no longer returns.
    const staleCache: ApiField[] = [INACTIVE_FIELD];
    mockKvGet.mockResolvedValue(JSON.stringify(staleCache));
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_FIELD]));

    const result = await runHook<ApiField>(useApiFields, FARM_ID, mockHarness);

    // After API call, live state should reflect only fresh active data.
    expect(result.fromCache).toBe(false);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(ACTIVE_FIELD.id);
  });
});

// ===========================================================================
// useApiLabs
// ===========================================================================

describe('useApiLabs', () => {
  const ACTIVE_LAB: ApiLab = {
    id: 10,
    name: 'ADAS Diagnostics',
    accountNumber: 'ACCT-001',
    contactName: 'Dr. Smith',
    email: 'lab@adas.co.uk',
    phone: '01234 567890',
    isActive: true,
  };
  const INACTIVE_LAB: ApiLab = {
    ...ACTIVE_LAB,
    id: 11,
    name: 'Old Lab',
    isActive: false,
  };

  function apiResponse(records: ApiLab[]) {
    return { ok: true, json: async () => ({ records }) } as unknown as Response;
  }

  it('writes only active labs to kvSet after a fresh fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_LAB, INACTIVE_LAB]));

    await runHook<ApiLab>(useApiLabs, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_labs_${FARM_ID}`);
    const stored: ApiLab[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(ACTIVE_LAB.id);
    expect(stored[0].isActive).toBe(true);
  });

  it('live state contains only active labs after fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_LAB, INACTIVE_LAB]));

    const result = await runHook<ApiLab>(useApiLabs, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(ACTIVE_LAB.id);
    expect(result.items[0].name).toBe(ACTIVE_LAB.name);
    expect(result.fromCache).toBe(false);
  });

  it('does not cache an empty lab list when the records key is missing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ labs: [ACTIVE_LAB] }),
    } as unknown as Response);

    const result = await runHook<ApiLab>(useApiLabs, FARM_ID, mockHarness);

    expect(result.lastError).toBe('Invalid labs response: expected records array');
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('returns cached labs as-is when API is offline', async () => {
    const cached: ApiLab[] = [ACTIVE_LAB];
    mockKvGet.mockResolvedValue(JSON.stringify(cached));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiLab>(useApiLabs, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(ACTIVE_LAB.id);
    expect(result.fromCache).toBe(true);
  });

  it('sets lastError when API fails and cache is empty', async () => {
    mockKvGet.mockResolvedValue(null);
    global.fetch = jest.fn().mockRejectedValue(new Error('DNS failure'));

    const result = await runHook<ApiLab>(useApiLabs, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(0);
    expect(result.lastError).toBe('DNS failure');
  });

  it('does not call kvSet when the API fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('timeout'));

    await runHook<ApiLab>(useApiLabs, FARM_ID, mockHarness);

    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('inactive-only response writes empty array to kvSet', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([INACTIVE_LAB]));

    await runHook<ApiLab>(useApiLabs, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [, raw] = mockKvSet.mock.calls[0];
    expect(JSON.parse(raw)).toEqual([]);
  });

  it('overwrites stale cache with fresh active labs after fetch', async () => {
    const staleCache: ApiLab[] = [{ ...ACTIVE_LAB, name: 'Old Name' }];
    mockKvGet.mockResolvedValue(JSON.stringify(staleCache));
    global.fetch = jest.fn().mockResolvedValue(apiResponse([ACTIVE_LAB]));

    const result = await runHook<ApiLab>(useApiLabs, FARM_ID, mockHarness);

    expect(result.fromCache).toBe(false);
    expect(result.items[0].name).toBe(ACTIVE_LAB.name);
  });
});
