/**
 * Unit tests for buildCachedApiHook-based hooks: livestock data.
 *
 * Covered hooks:
 *   - useApiHerds          (records key, filter: isActive !== false)
 *   - useApiSheepFlocks    (records key, filter: isActive + type contains "sheep")
 *   - useApiGoatFlocks     (records key, filter: isActive + type contains "goat")
 *   - useApiSires          (records key, filter: isActive !== false)
 *   - useApiStraws         (records key, filter: isActive !== false)
 *   - useApiPigFlocks      (direct array, no filter)
 *   - useApiPoultryFlocks  (direct array, filter: status !== "depleted")
 *
 * None of these hooks supply a cacheTransform.  The assertions verify:
 *   (a) kvSet is called with the correctly-filtered items after a fresh fetch.
 *   (b) Stale cache items are returned as-is (no re-transform on read).
 *   (c) Live state holds the real API values after a successful fetch.
 *   (d) The per-hook filter / type-split logic is exercised end-to-end.
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

import { useApiHerds, type ApiHerd } from '../lib/hooks/useApiHerds';
import { useApiSheepFlocks } from '../lib/hooks/useApiSheepFlocks';
import { useApiGoatFlocks } from '../lib/hooks/useApiGoatFlocks';
import { useApiSires, type ApiSire } from '../lib/hooks/useApiSires';
import { useApiStraws, type ApiStraw } from '../lib/hooks/useApiStraws';
import { useApiPigFlocks, type ApiPigFlock } from '../lib/hooks/useApiPigFlocks';
import { useApiPoultryFlocks, type ApiFlock } from '../lib/hooks/useApiPoultryFlocks';

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

const FARM_ID = '55';
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
// useApiHerds
// ===========================================================================

describe('useApiHerds', () => {
  const ACTIVE_HERD: ApiHerd = {
    id: 1,
    name: 'Main Cattle Herd',
    type: 'cattle',
    breed: 'Hereford',
    herdNumber: 'UK123456',
    notes: null,
    isActive: true,
  };
  const INACTIVE_HERD: ApiHerd = {
    ...ACTIVE_HERD,
    id: 2,
    name: 'Old Herd',
    isActive: false,
  };

  function apiResponse(records: ApiHerd[]) {
    return { ok: true, json: async () => ({ records }) } as unknown as Response;
  }

  it('writes only active herds to kvSet after a fresh fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_HERD, INACTIVE_HERD]));

    await runHook<ApiHerd>(useApiHerds, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_herds_${FARM_ID}`);
    const stored: ApiHerd[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(ACTIVE_HERD.id);
  });

  it('live state contains only active herds after fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_HERD, INACTIVE_HERD]));

    const result = await runHook<ApiHerd>(useApiHerds, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(ACTIVE_HERD.id);
    expect(result.fromCache).toBe(false);
  });

  it('does not cache an empty herd list when the records key is renamed', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ herds: [ACTIVE_HERD] }),
    } as unknown as Response);

    const result = await runHook<ApiHerd>(useApiHerds, FARM_ID, mockHarness);

    expect(result.lastError).toBe('Invalid herds response: expected records array');
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('clears the previous farm before loading the next farm herds', async () => {
    const farmAHerd = { ...ACTIVE_HERD, id: 101, name: 'Farm A Herd' };
    const farmBHerd = { ...ACTIVE_HERD, id: 202, name: 'Farm B Herd' };
    const farmAId = FARM_ID;
    const farmBId = '56';

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(apiResponse([farmAHerd]))
      .mockResolvedValueOnce(apiResponse([farmBHerd]));

    const first = await runHook<ApiHerd>(useApiHerds, farmAId, mockHarness);
    expect(first.loadedForFarmId).toBe(farmAId);
    expect(first.items).toEqual([farmAHerd]);

    const transition: Array<{
      loadedForFarmId: string | undefined;
      items: ApiHerd[];
    }> = [];
    const second = await rerenderHook<ApiHerd>(
      useApiHerds,
      farmBId,
      mockHarness,
      () => {
        transition.push({
          loadedForFarmId: mockHarness.store.values[4] as string | undefined,
          items: mockHarness.store.values[0] as ApiHerd[],
        });
      },
    );

    expect(transition).toEqual([
      { loadedForFarmId: undefined, items: [] },
    ]);
    expect(second.loadedForFarmId).toBe(farmBId);
    expect(second.items).toEqual([farmBHerd]);
    expect(second.items).not.toContainEqual(farmAHerd);
  });

  it('returns cached herds as-is when offline', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([ACTIVE_HERD]));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiHerd>(useApiHerds, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(1);
    expect(result.fromCache).toBe(true);
  });

  it('sets lastError when API fails and cache is empty', async () => {
    mockKvGet.mockResolvedValue(null);
    global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));

    const result = await runHook<ApiHerd>(useApiHerds, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(0);
    expect(result.lastError).toBe('Connection refused');
  });
});

// ===========================================================================
// useApiSheepFlocks
// ===========================================================================

describe('useApiSheepFlocks', () => {
  const SHEEP_HERD: ApiHerd = {
    id: 10,
    name: 'Main Sheep Flock',
    type: 'sheep',
    breed: 'Suffolk',
    herdNumber: null,
    notes: null,
    isActive: true,
  };
  const CATTLE_HERD: ApiHerd = {
    ...SHEEP_HERD,
    id: 11,
    name: 'Cattle',
    type: 'cattle',
  };
  const INACTIVE_SHEEP: ApiHerd = {
    ...SHEEP_HERD,
    id: 12,
    name: 'Old Sheep',
    isActive: false,
  };

  function apiResponse(records: ApiHerd[]) {
    return { ok: true, json: async () => ({ records }) } as unknown as Response;
  }

  it('writes only active sheep flocks to kvSet — excludes cattle and inactive', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([SHEEP_HERD, CATTLE_HERD, INACTIVE_SHEEP]));

    await runHook<ApiHerd>(useApiSheepFlocks, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_sheep_flocks_${FARM_ID}`);
    const stored: ApiHerd[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(SHEEP_HERD.id);
    expect(stored[0].type.toLowerCase()).toContain('sheep');
  });

  it('live state contains only active sheep herds after fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([SHEEP_HERD, CATTLE_HERD, INACTIVE_SHEEP]));

    const result = await runHook<ApiHerd>(
      useApiSheepFlocks,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(SHEEP_HERD.id);
    expect(result.fromCache).toBe(false);
  });

  it('does not cache an empty sheep list when the records key is missing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ flocks: [SHEEP_HERD] }),
    } as unknown as Response);

    const result = await runHook<ApiHerd>(useApiSheepFlocks, FARM_ID, mockHarness);

    expect(result.lastError).toBe('Invalid sheep flocks response: expected records array');
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('returns cached sheep flocks as-is when offline', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([SHEEP_HERD]));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiHerd>(
      useApiSheepFlocks,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.fromCache).toBe(true);
  });
});

// ===========================================================================
// useApiGoatFlocks
// ===========================================================================

describe('useApiGoatFlocks', () => {
  const GOAT_HERD: ApiHerd = {
    id: 20,
    name: 'Dairy Goats',
    type: 'dairy goat',
    breed: 'British Toggenburg',
    herdNumber: null,
    notes: null,
    isActive: true,
  };
  const SHEEP_HERD: ApiHerd = {
    ...GOAT_HERD,
    id: 21,
    name: 'Sheep Flock',
    type: 'sheep',
  };
  const INACTIVE_GOAT: ApiHerd = {
    ...GOAT_HERD,
    id: 22,
    name: 'Old Goats',
    isActive: false,
  };

  function apiResponse(records: ApiHerd[]) {
    return { ok: true, json: async () => ({ records }) } as unknown as Response;
  }

  it('writes only active goat flocks to kvSet — excludes sheep and inactive', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([GOAT_HERD, SHEEP_HERD, INACTIVE_GOAT]));

    await runHook<ApiHerd>(useApiGoatFlocks, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_goat_flocks_${FARM_ID}`);
    const stored: ApiHerd[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(GOAT_HERD.id);
    expect(stored[0].type.toLowerCase()).toContain('goat');
  });

  it('live state contains only active goat herds after fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([GOAT_HERD, SHEEP_HERD, INACTIVE_GOAT]));

    const result = await runHook<ApiHerd>(
      useApiGoatFlocks,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(GOAT_HERD.id);
    expect(result.fromCache).toBe(false);
  });

  it('does not cache an empty goat list when the records key is missing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ flocks: [GOAT_HERD] }),
    } as unknown as Response);

    const result = await runHook<ApiHerd>(useApiGoatFlocks, FARM_ID, mockHarness);

    expect(result.lastError).toBe('Invalid goat flocks response: expected records array');
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('returns cached goat flocks as-is when offline', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([GOAT_HERD]));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiHerd>(
      useApiGoatFlocks,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.fromCache).toBe(true);
  });
});

// ===========================================================================
// useApiSires
// ===========================================================================

describe('useApiSires', () => {
  const ACTIVE_SIRE: ApiSire = {
    id: 30,
    name: 'Champion Bull',
    species: 'cattle',
    breed: 'Charolais',
    tagNumber: 'UK123',
    passportNumber: 'PASS-001',
    ownershipType: 'owned',
    supplierName: null,
    bvdStatus: 'negative',
    scrapieGenotype: null,
    isActive: true,
  };
  const INACTIVE_SIRE: ApiSire = {
    ...ACTIVE_SIRE,
    id: 31,
    name: 'Retired Bull',
    isActive: false,
  };

  function apiResponse(records: ApiSire[]) {
    return { ok: true, json: async () => ({ records }) } as unknown as Response;
  }

  it('writes only active sires to kvSet after a fresh fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_SIRE, INACTIVE_SIRE]));

    await runHook<ApiSire>(useApiSires, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_sires_${FARM_ID}`);
    const stored: ApiSire[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(ACTIVE_SIRE.id);
  });

  it('live state contains only active sires after fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_SIRE, INACTIVE_SIRE]));

    const result = await runHook<ApiSire>(useApiSires, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(ACTIVE_SIRE.id);
    expect(result.fromCache).toBe(false);
  });

  it('does not cache an empty sire list when the records key is missing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sires: [ACTIVE_SIRE] }),
    } as unknown as Response);

    const result = await runHook<ApiSire>(useApiSires, FARM_ID, mockHarness);

    expect(result.lastError).toBe('Invalid sires response: expected records array');
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('returns cached sires as-is when offline', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([ACTIVE_SIRE]));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiSire>(useApiSires, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(1);
    expect(result.fromCache).toBe(true);
  });

  it('does not call kvSet when API returns HTTP error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
    } as unknown as Response);

    await runHook<ApiSire>(useApiSires, FARM_ID, mockHarness);

    expect(mockKvSet).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// useApiStraws
// ===========================================================================

describe('useApiStraws', () => {
  const ACTIVE_STRAW: ApiStraw = {
    id: 40,
    sireRegisterId: 30,
    sireName: 'Champion Bull',
    sireBreed: 'Charolais',
    sireSpecies: 'cattle',
    supplierName: 'Genus',
    batchNumber: 'BATCH-001',
    strawsReceived: 50,
    strawsUsed: 10,
    storageLocation: 'Tank A',
    deliveryDate: '2024-01-15',
    isActive: true,
  };
  const INACTIVE_STRAW: ApiStraw = {
    ...ACTIVE_STRAW,
    id: 41,
    batchNumber: 'BATCH-002',
    isActive: false,
  };

  function apiResponse(records: ApiStraw[]) {
    return { ok: true, json: async () => ({ records }) } as unknown as Response;
  }

  it('writes only active straws to kvSet after a fresh fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_STRAW, INACTIVE_STRAW]));

    await runHook<ApiStraw>(useApiStraws, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_straws_${FARM_ID}`);
    const stored: ApiStraw[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(ACTIVE_STRAW.id);
    expect(stored[0].isActive).toBe(true);
  });

  it('live state contains only active straws after fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_STRAW, INACTIVE_STRAW]));

    const result = await runHook<ApiStraw>(useApiStraws, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].batchNumber).toBe(ACTIVE_STRAW.batchNumber);
    expect(result.fromCache).toBe(false);
  });

  it('does not cache an empty straw list when the records key is missing', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ straws: [ACTIVE_STRAW] }),
    } as unknown as Response);

    const result = await runHook<ApiStraw>(useApiStraws, FARM_ID, mockHarness);

    expect(result.lastError).toBe('Invalid straws response: expected records array');
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('returns cached straws as-is when offline', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([ACTIVE_STRAW]));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiStraw>(useApiStraws, FARM_ID, mockHarness);

    expect(result.items).toHaveLength(1);
    expect(result.fromCache).toBe(true);
  });

  it('does not call kvSet when API fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('timeout'));

    await runHook<ApiStraw>(useApiStraws, FARM_ID, mockHarness);

    expect(mockKvSet).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// useApiPigFlocks
// ===========================================================================

describe('useApiPigFlocks', () => {
  const PIG_FLOCK: ApiPigFlock = {
    id: 50,
    flockName: 'Main Pig Unit',
    productionType: 'farrow-to-finish',
    breed: 'Large White',
    cphNumber: '12/345/0001',
    herdNumber: 'PH123',
    currentCount: 200,
    location: 'Building A',
  };

  // Note: useApiPigFlocks transform accepts a direct JSON array (not { records: [...] }).
  function apiResponse(flocks: ApiPigFlock[]) {
    return { ok: true, json: async () => flocks } as unknown as Response;
  }

  it('writes all flocks to kvSet (direct array — no records wrapper)', async () => {
    global.fetch = jest.fn().mockResolvedValue(apiResponse([PIG_FLOCK]));

    await runHook<ApiPigFlock>(useApiPigFlocks, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_pig_flocks_${FARM_ID}`);
    const stored: ApiPigFlock[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(PIG_FLOCK.id);
    expect(stored[0].flockName).toBe(PIG_FLOCK.flockName);
  });

  it('live state contains all flocks after fetch', async () => {
    global.fetch = jest.fn().mockResolvedValue(apiResponse([PIG_FLOCK]));

    const result = await runHook<ApiPigFlock>(
      useApiPigFlocks,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].productionType).toBe(PIG_FLOCK.productionType);
    expect(result.fromCache).toBe(false);
  });

  it('returns stale cache when offline', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([PIG_FLOCK]));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiPigFlock>(
      useApiPigFlocks,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.fromCache).toBe(true);
  });

  it('keeps stale cache when the direct-array response becomes an envelope', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([PIG_FLOCK]));
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records: [PIG_FLOCK] }),
    } as unknown as Response);

    const result = await runHook<ApiPigFlock>(
      useApiPigFlocks,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toEqual([PIG_FLOCK]);
    expect(result.fromCache).toBe(true);
    expect(result.lastError).toBe('Invalid pig flocks response: expected array');
    expect(mockKvSet).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// useApiPoultryFlocks
// ===========================================================================

describe('useApiPoultryFlocks', () => {
  const ACTIVE_FLOCK: ApiFlock = {
    id: 60,
    flockNumber: 'FL-001',
    species: 'broiler',
    breed: 'Ross 308',
    productionSystem: 'indoor',
    placementDate: '2024-03-01',
    placementCount: 20000,
    status: 'active',
    houseName: 'House 1',
  };
  const DEPLETED_FLOCK: ApiFlock = {
    ...ACTIVE_FLOCK,
    id: 61,
    flockNumber: 'FL-002',
    status: 'depleted',
  };

  // Note: useApiPoultryFlocks transform also accepts a direct JSON array.
  function apiResponse(flocks: ApiFlock[]) {
    return { ok: true, json: async () => flocks } as unknown as Response;
  }

  it('writes only non-depleted flocks to kvSet after a fresh fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_FLOCK, DEPLETED_FLOCK]));

    await runHook<ApiFlock>(useApiPoultryFlocks, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_poultry_flocks_${FARM_ID}`);
    const stored: ApiFlock[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(ACTIVE_FLOCK.id);
    expect(stored[0].status).not.toBe('depleted');
  });

  it('live state contains only non-depleted flocks after fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_FLOCK, DEPLETED_FLOCK]));

    const result = await runHook<ApiFlock>(
      useApiPoultryFlocks,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].flockNumber).toBe(ACTIVE_FLOCK.flockNumber);
    expect(result.fromCache).toBe(false);
  });

  it('does not cache an empty poultry list when the direct-array shape changes', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ records: [ACTIVE_FLOCK] }),
    } as unknown as Response);

    const result = await runHook<ApiFlock>(useApiPoultryFlocks, FARM_ID, mockHarness);

    expect(result.lastError).toBe('Invalid poultry flocks response: expected array');
    expect(mockKvSet).not.toHaveBeenCalled();
  });

  it('returns cached flocks as-is when offline', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([ACTIVE_FLOCK]));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiFlock>(
      useApiPoultryFlocks,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.fromCache).toBe(true);
  });

  it('excludes depleted flocks and caches only active ones', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_FLOCK, DEPLETED_FLOCK]));

    await runHook<ApiFlock>(useApiPoultryFlocks, FARM_ID, mockHarness);

    const [, raw] = mockKvSet.mock.calls[0];
    const stored: ApiFlock[] = JSON.parse(raw);
    const hasDepletedInCache = stored.some((f) => f.status === 'depleted');
    expect(hasDepletedInCache).toBe(false);
  });

  it('does not call kvSet when API fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('timeout'));

    await runHook<ApiFlock>(useApiPoultryFlocks, FARM_ID, mockHarness);

    expect(mockKvSet).not.toHaveBeenCalled();
  });
});
