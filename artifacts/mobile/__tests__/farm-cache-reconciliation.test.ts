const mockEffects: Array<() => unknown> = [];
const mockFarmStateFactory: { current: (() => unknown) | null } = { current: null };
const mockStateInitialValues: unknown[] = [];
const mockStateSetters: Array<jest.Mock> = [];
let mockStateIndex = 0;
const mockClearExpiredAgriEnvCaches = jest.fn<Promise<void>, [Iterable<string | number>?]>();
const mockGetItem = jest.fn<Promise<unknown>, [string]>();
const mockSetItem = jest.fn<Promise<void>, [string, unknown]>();
const mockRemoveItem = jest.fn<Promise<void>, [string]>();
const mockSyncRefData = jest.fn<Promise<void>, [string]>();
const mockRefreshApiModules = jest.fn<Promise<void>, [string, string?]>();

jest.mock("react", () => ({
  __esModule: true,
  default: { createElement: jest.fn() },
  useCallback: (callback: unknown) => callback,
  useEffect: (effect: () => unknown) => {
    mockEffects.push(effect);
  },
  useState: (initialValue: unknown) => {
    const index = mockStateIndex;
    mockStateIndex += 1;
    const setter = jest.fn();
    mockStateSetters[index] = setter;
    return [mockStateInitialValues[index] ?? initialValue, setter];
  },
}));

jest.mock("@nkzw/create-context-hook", () => ({
  __esModule: true,
  default: (factory: () => unknown) => {
    mockFarmStateFactory.current = factory;
    return [
      ({ children }: { children: unknown }) => children,
      () => factory(),
    ];
  },
}));

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

jest.mock("@/lib/storage", () => ({
  clearExpiredAgriEnvCaches: (...args: [Iterable<string | number>?]) => mockClearExpiredAgriEnvCaches(...args),
  getItem: (...args: [string]) => mockGetItem(...args),
  setItem: (...args: [string, unknown]) => mockSetItem(...args),
  removeItem: (...args: [string]) => mockRemoveItem(...args),
  STORAGE_KEYS: {
    FARM_LIST: "bde_farm_list",
    CURRENT_FARM: "bde_current_farm",
    USER_PROFILE: "bde_user_profile",
  },
}));

jest.mock("@/lib/refCache", () => ({
  syncRefData: (...args: [string]) => mockSyncRefData(...args),
}));

jest.mock("@/lib/hooks/useApiModules", () => ({
  refreshApiModules: (...args: [string, string?]) => mockRefreshApiModules(...args),
}));

require("../lib/context/FarmContext");

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

async function drain(rounds = 5): Promise<void> {
  for (let round = 0; round < rounds; round += 1) {
    await flushPromises();
  }
}

interface FarmState {
  refreshFarms: () => Promise<void>;
}

function createFarmState(): FarmState {
  if (!mockFarmStateFactory.current) {
    throw new Error("Farm context factory was not registered");
  }
  return mockFarmStateFactory.current() as FarmState;
}

function mountFarmContext(): FarmState {
  const farmState = createFarmState();
  const startupEffect = mockEffects[0];
  if (!startupEffect) {
    throw new Error("Farm context startup effect was not registered");
  }
  startupEffect();
  return farmState;
}

describe("FarmContext agri-environment cache reconciliation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEffects.length = 0;
    mockStateInitialValues.length = 0;
    mockStateSetters.length = 0;
    mockStateIndex = 0;
    mockClearExpiredAgriEnvCaches.mockResolvedValue(undefined);
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    mockRemoveItem.mockResolvedValue(undefined);
    mockSyncRefData.mockResolvedValue(undefined);
    mockRefreshApiModules.mockResolvedValue(undefined);

    (global as Record<string, unknown>).__DEV__ = true;
    process.env.EXPO_PUBLIC_DOMAIN = "api.example.test";
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_DOMAIN;
    delete (global as Record<string, unknown>).__DEV__;
  });

  it("clears all farm-scoped agri-environment caches when access to every farm is revoked", async () => {
    global.fetch = jest.fn(async (url: string) => ({
      ok: url.endsWith("/api/my-farms"),
      json: async () => ({ farms: [] }),
    })) as unknown as typeof fetch;

    mountFarmContext();
    await drain();

    expect(mockClearExpiredAgriEnvCaches).toHaveBeenCalledWith([]);
    expect(mockRemoveItem).toHaveBeenCalledWith("bde_current_farm");
    expect(mockSetItem).toHaveBeenCalledWith("bde_farm_list", []);
  });

  it("does not treat a failed farm request as an authoritative empty list", async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    mountFarmContext();
    await drain();

    expect(mockClearExpiredAgriEnvCaches).not.toHaveBeenCalledWith([]);
    expect(mockRemoveItem).not.toHaveBeenCalledWith("bde_current_farm");
  });

  it("switches a revoked selected farm to an authorized farm after refresh", async () => {
    const revokedFarm = { id: "revoked-farm", name: "Revoked Farm" };
    const authorizedFarm = {
      id: 42,
      name: "Authorized Farm",
      tenantSlug: "authorized-farm",
      sectorArable: true,
      sectorBeef: false,
      sectorDairy: false,
      sectorPigs: false,
      sectorPoultry: false,
      sectorViticulture: false,
    };
    mockStateInitialValues[1] = revokedFarm;
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ farms: [authorizedFarm] }),
    })) as unknown as typeof fetch;

    const farmState = createFarmState();
    await farmState.refreshFarms();

    expect(mockClearExpiredAgriEnvCaches).toHaveBeenCalledWith(["42"]);
    const currentFarmUpdater = mockStateSetters[1].mock.calls[0][0] as (
      farm: typeof revokedFarm,
    ) => { id: string };
    expect(currentFarmUpdater(revokedFarm)).toMatchObject({ id: "42" });
    expect(mockSetItem).toHaveBeenCalledWith(
      "bde_current_farm",
      expect.objectContaining({ id: "42" }),
    );
    expect(mockSyncRefData).toHaveBeenCalledWith("42");
    expect(mockRefreshApiModules).toHaveBeenCalledWith("42", "authorized-farm");
  });
});