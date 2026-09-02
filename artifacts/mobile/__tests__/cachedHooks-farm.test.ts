/**
 * Unit tests for buildCachedApiHook-based hooks: farm-level data.
 *
 * Covered hooks:
 *   - useApiFarmMembers  (JSON key: members,  filter: isActive !== false)
 *   - useApiInsurance    (JSON key: records,  no filter)
 *   - useApiSprayProducts(JSON key: records,  no filter)
 *   - useApiStaff        (JSON key: staff,    no filter)
 *
 * None of these hooks supply a cacheTransform, so the cache stores whatever
 * the transform function returns and is replayed unchanged on cache-read.
 * The assertions verify:
 *   (a) kvSet is called with the correctly-filtered items after a fresh fetch.
 *   (b) Stale cache items are returned as-is (no transform re-applied on read).
 *   (c) Live state holds the real API values after a successful fetch.
 *   (d) The per-hook filter / extraction logic is exercised.
 *
 * See buildCachedApiHook.test.ts and helpers/cachedHookHarness.ts for
 * a full explanation of the harness approach.
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

import {
  useApiFarmMembers,
  type ApiFarmMember,
} from '../lib/hooks/useApiFarmMembers';
import {
  useApiInsurance,
  type ApiInsurancePolicy,
} from '../lib/hooks/useApiInsurance';
import {
  useApiSprayProducts,
  type ApiSprayProduct,
} from '../lib/hooks/useApiSprayProducts';
import { useApiStaff, type ApiStaffMember } from '../lib/hooks/useApiStaff';

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

const FARM_ID = '42';
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
// useApiFarmMembers
// ===========================================================================

describe('useApiFarmMembers', () => {
  const ACTIVE_MEMBER: ApiFarmMember = {
    id: 1,
    firstName: 'Alice',
    lastName: 'Smith',
    jobTitle: 'Manager',
    farmRole: 'admin',
    isActive: true,
    departmentId: null,
    departmentName: null,
    departmentColour: null,
    secondaryDepartments: [],
  };
  const INACTIVE_MEMBER: ApiFarmMember = {
    ...ACTIVE_MEMBER,
    id: 2,
    firstName: 'Bob',
    isActive: false,
  };

  function apiResponse(members: ApiFarmMember[]) {
    return {
      ok: true,
      json: async () => ({ members }),
    } as unknown as Response;
  }

  it('writes only active members to kvSet after a fresh fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_MEMBER, INACTIVE_MEMBER]));

    await runHook<ApiFarmMember>(useApiFarmMembers, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_farm_members_${FARM_ID}`);
    const stored: ApiFarmMember[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(ACTIVE_MEMBER.id);
    expect(stored.every((m) => m.isActive !== false)).toBe(true);
  });

  it('live state contains only active members after fetch', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(apiResponse([ACTIVE_MEMBER, INACTIVE_MEMBER]));

    const result = await runHook<ApiFarmMember>(
      useApiFarmMembers,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(ACTIVE_MEMBER.id);
    expect(result.fromCache).toBe(false);
  });

  it('clears the previous farm before loading the next farm members', async () => {
    const farmAMember = { ...ACTIVE_MEMBER, id: 101, firstName: 'Farm A' };
    const farmBMember = { ...ACTIVE_MEMBER, id: 202, firstName: 'Farm B' };
    const farmAId = FARM_ID;
    const farmBId = '43';

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(apiResponse([farmAMember]))
      .mockResolvedValueOnce(apiResponse([farmBMember]));

    const first = await runHook<ApiFarmMember>(
      useApiFarmMembers,
      farmAId,
      mockHarness,
    );
    expect(first.loadedForFarmId).toBe(farmAId);
    expect(first.items).toEqual([farmAMember]);

    const transition: Array<{
      loadedForFarmId: string | undefined;
      items: ApiFarmMember[];
    }> = [];
    const second = await rerenderHook<ApiFarmMember>(
      useApiFarmMembers,
      farmBId,
      mockHarness,
      () => {
        transition.push({
          loadedForFarmId: mockHarness.store.values[4] as string | undefined,
          items: mockHarness.store.values[0] as ApiFarmMember[],
        });
      },
    );

    expect(transition).toEqual([
      { loadedForFarmId: undefined, items: [] },
    ]);
    expect(second.loadedForFarmId).toBe(farmBId);
    expect(second.items).toEqual([farmBMember]);
    expect(second.items).not.toContainEqual(farmAMember);
  });

  it('returns cached members as-is when API is offline', async () => {
    const cached: ApiFarmMember[] = [ACTIVE_MEMBER];
    mockKvGet.mockResolvedValue(JSON.stringify(cached));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiFarmMember>(
      useApiFarmMembers,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(ACTIVE_MEMBER.id);
    expect(result.fromCache).toBe(true);
  });

  it('sets lastError when API fails and cache is empty', async () => {
    mockKvGet.mockResolvedValue(null);
    global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

    const result = await runHook<ApiFarmMember>(
      useApiFarmMembers,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(0);
    expect(result.lastError).toBe('Network request failed');
  });

  it('skips fetch and emits no error when farmId is undefined', async () => {
    mockHarness.slotCounter.value = 0;
    mockHarness.store.reset([[], true, false, null]);
    useApiFarmMembers(undefined);
    if (mockHarness.capturedEffect.value) {
      const ret = mockHarness.capturedEffect.value();
      if (ret instanceof Promise) await ret;
    }
    await drainAsync();

    const [items, , , lastError] = mockHarness.store.values as [
      ApiFarmMember[],
      boolean,
      boolean,
      string | null,
    ];
    expect(items).toHaveLength(0);
    expect(lastError).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// useApiInsurance
// ===========================================================================

describe('useApiInsurance', () => {
  const POLICY: ApiInsurancePolicy = {
    id: 1,
    policyType: 'crop',
    insurer: 'Aviva',
    policyNumber: 'POL-001',
  };

  function apiResponse(records: ApiInsurancePolicy[]) {
    return {
      ok: true,
      json: async () => ({ records }),
    } as unknown as Response;
  }

  it('writes all policies to kvSet after a fresh fetch', async () => {
    global.fetch = jest.fn().mockResolvedValue(apiResponse([POLICY]));

    await runHook<ApiInsurancePolicy>(useApiInsurance, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_insurance_${FARM_ID}`);
    const stored: ApiInsurancePolicy[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(POLICY.id);
    expect(stored[0].policyType).toBe(POLICY.policyType);
  });

  it('live state contains all policies after fetch', async () => {
    global.fetch = jest.fn().mockResolvedValue(apiResponse([POLICY]));

    const result = await runHook<ApiInsurancePolicy>(
      useApiInsurance,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(POLICY.id);
    expect(result.fromCache).toBe(false);
  });

  it('returns stale cache when API fails', async () => {
    const cached: ApiInsurancePolicy[] = [POLICY];
    mockKvGet.mockResolvedValue(JSON.stringify(cached));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiInsurancePolicy>(
      useApiInsurance,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.fromCache).toBe(true);
  });

  it('does not call kvSet when the fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    await runHook<ApiInsurancePolicy>(useApiInsurance, FARM_ID, mockHarness);

    expect(mockKvSet).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// useApiSprayProducts
// ===========================================================================

describe('useApiSprayProducts', () => {
  const PRODUCT: ApiSprayProduct = {
    id: 10,
    productName: 'Glyphosate Max',
    activeIngredient: 'glyphosate',
    mappaNumber: 'MAPP-12345',
    manufacturer: 'Monsanto',
    category: 'herbicide',
    harvestInterval: '7 days',
    maxApplicationsPerSeason: 2,
    lerapCategory: 'A',
    lerapStandardBufferM: '5',
  };

  function apiResponse(records: ApiSprayProduct[]) {
    return {
      ok: true,
      json: async () => ({ records }),
    } as unknown as Response;
  }

  it('writes all products to kvSet after a fresh fetch', async () => {
    global.fetch = jest.fn().mockResolvedValue(apiResponse([PRODUCT]));

    await runHook<ApiSprayProduct>(useApiSprayProducts, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_spray_products_${FARM_ID}`);
    const stored: ApiSprayProduct[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(PRODUCT.id);
    expect(stored[0].productName).toBe(PRODUCT.productName);
    expect(stored[0].harvestInterval).toBe(PRODUCT.harvestInterval);
  });

  it('live state contains all products after fetch', async () => {
    global.fetch = jest.fn().mockResolvedValue(apiResponse([PRODUCT]));

    const result = await runHook<ApiSprayProduct>(
      useApiSprayProducts,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].productName).toBe(PRODUCT.productName);
    expect(result.fromCache).toBe(false);
  });

  it('returns stale cache when API fails', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([PRODUCT]));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiSprayProduct>(
      useApiSprayProducts,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.fromCache).toBe(true);
  });

  it('survives an empty records array from the API', async () => {
    global.fetch = jest.fn().mockResolvedValue(apiResponse([]));

    const result = await runHook<ApiSprayProduct>(
      useApiSprayProducts,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(0);
    expect(result.fromCache).toBe(false);
    expect(result.lastError).toBeNull();
    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [, raw] = mockKvSet.mock.calls[0];
    expect(JSON.parse(raw)).toEqual([]);
  });
});

// ===========================================================================
// useApiStaff
// ===========================================================================

describe('useApiStaff', () => {
  const STAFF_MEMBER: ApiStaffMember = {
    id: 5,
    memberId: 3,
    email: 'dave@farm.co.uk',
    name: 'Dave Jones',
    role: 'driver',
  };

  // Note: the API response uses the key "staff", not "records".
  function apiResponse(staff: ApiStaffMember[]) {
    return {
      ok: true,
      json: async () => ({ staff }),
    } as unknown as Response;
  }

  it('writes staff list to kvSet after a fresh fetch (staff key, not records)', async () => {
    global.fetch = jest.fn().mockResolvedValue(apiResponse([STAFF_MEMBER]));

    await runHook<ApiStaffMember>(useApiStaff, FARM_ID, mockHarness);

    expect(mockKvSet).toHaveBeenCalledTimes(1);
    const [key, raw] = mockKvSet.mock.calls[0];
    expect(key).toBe(`bde_cache_farm_staff_${FARM_ID}`);
    const stored: ApiStaffMember[] = JSON.parse(raw);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(STAFF_MEMBER.id);
    expect(stored[0].name).toBe(STAFF_MEMBER.name);
  });

  it('live state contains staff after fetch', async () => {
    global.fetch = jest.fn().mockResolvedValue(apiResponse([STAFF_MEMBER]));

    const result = await runHook<ApiStaffMember>(
      useApiStaff,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe(STAFF_MEMBER.name);
    expect(result.fromCache).toBe(false);
  });

  it('returns stale cache when API is offline', async () => {
    mockKvGet.mockResolvedValue(JSON.stringify([STAFF_MEMBER]));
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));

    const result = await runHook<ApiStaffMember>(
      useApiStaff,
      FARM_ID,
      mockHarness,
    );

    expect(result.items).toHaveLength(1);
    expect(result.fromCache).toBe(true);
  });

  it('does not call kvSet if the API returns an HTTP error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as unknown as Response);

    const result = await runHook<ApiStaffMember>(useApiStaff, FARM_ID, mockHarness);

    expect(mockKvSet).not.toHaveBeenCalled();
    expect(result.lastError).toMatch(/HTTP 500/);
  });
});
