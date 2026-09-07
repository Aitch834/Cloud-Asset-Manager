import { drainAsync, StateStore } from "./helpers/cachedHookHarness";

type AgriEnvStatusFilter = "active" | "pending" | "completed" | null;

const storedPreferences = new Map<string, unknown>();
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();
const mockHarness = {
  store: new StateStore(),
  stateSlotCounter: { value: 0 },
  refSlotCounter: { value: 0 },
  refs: [] as Array<{ current: unknown }>,
  capturedEffect: { value: null as (() => void | (() => void)) | null },
};

jest.mock("@/lib/storage", () => ({
  getItem: (key: string) => mockGetItem(key),
  setItem: (key: string, value: unknown) => mockSetItem(key, value),
  removeItem: (key: string) => mockRemoveItem(key),
  STORAGE_KEYS: {
    AGRI_ENV_STATUS_FILTER: "bde_agri_env_status_filter",
  },
}));

jest.mock("react", () => ({
  useState: (initial: unknown) => {
    const slot = mockHarness.stateSlotCounter.value++;
    return mockHarness.store.useState(slot, initial);
  },
  useRef: (initial: unknown) => {
    const slot = mockHarness.refSlotCounter.value++;
    if (!mockHarness.refs[slot]) mockHarness.refs[slot] = { current: initial };
    return mockHarness.refs[slot];
  },
  useEffect: (effect: () => void | (() => void)) => {
    mockHarness.capturedEffect.value = effect;
  },
  useCallback: <T extends (...args: never[]) => unknown>(callback: T) => callback,
}));

import { usePersistedAgriEnvStatusFilter } from "@/lib/hooks/usePersistedAgriEnvStatusFilter";

function resetMountedHook(initialStatus: AgriEnvStatusFilter = null): void {
  mockHarness.store.reset([initialStatus]);
  mockHarness.stateSlotCounter.value = 0;
  mockHarness.refSlotCounter.value = 0;
  mockHarness.refs = [];
  mockHarness.capturedEffect.value = null;
}

function mountHook(
  farmId: string,
): [
  AgriEnvStatusFilter,
  (value: AgriEnvStatusFilter) => void,
  (() => void) | undefined,
] {
  resetMountedHook();
  const [statusFilter, setStatusFilter] = usePersistedAgriEnvStatusFilter(farmId);
  const cleanup = mockHarness.capturedEffect.value?.();
  return [statusFilter, setStatusFilter, cleanup];
}

function readMountedHook(farmId: string): [
  AgriEnvStatusFilter,
  (value: AgriEnvStatusFilter) => void,
] {
  mockHarness.stateSlotCounter.value = 0;
  mockHarness.refSlotCounter.value = 0;
  mockHarness.capturedEffect.value = null;
  return usePersistedAgriEnvStatusFilter(farmId);
}

describe("usePersistedAgriEnvStatusFilter", () => {
  beforeEach(() => {
    storedPreferences.clear();
    mockGetItem.mockReset().mockImplementation(async (key: string) => storedPreferences.get(key) ?? null);
    mockSetItem.mockReset().mockImplementation(async (key: string, value: unknown) => {
      storedPreferences.set(key, value);
    });
    mockRemoveItem.mockReset().mockImplementation(async (key: string) => {
      storedPreferences.delete(key);
    });
    resetMountedHook();
  });

  it.each(["active", "pending"] as const)(
    "keeps the %s chip selected after leaving and returning to the screen",
    async (selectedFilter) => {
      const [initialFilter, setStatusFilter, cleanup] = mountHook("farm-a");
      await drainAsync();
      expect(initialFilter).toBeNull();

      setStatusFilter(selectedFilter);
      expect(storedPreferences.get("bde_agri_env_status_filter_farm-a")).toBe(selectedFilter);

      cleanup?.();
      mountHook("farm-a");
      await drainAsync();
      const [returnedFilter] = readMountedHook("farm-a");
      expect(returnedFilter).toBe(selectedFilter);
    },
  );

  it("removes the preference when All is selected and restores All on the next visit", async () => {
    const [, setStatusFilter, cleanup] = mountHook("farm-a");
    await drainAsync();
    setStatusFilter("active");
    expect(storedPreferences.has("bde_agri_env_status_filter_farm-a")).toBe(true);

    setStatusFilter(null);
    await drainAsync();
    expect(mockRemoveItem).toHaveBeenCalledWith("bde_agri_env_status_filter_farm-a");
    expect(storedPreferences.has("bde_agri_env_status_filter_farm-a")).toBe(false);

    cleanup?.();
    mountHook("farm-a");
    await drainAsync();
    const [returnedFilter] = readMountedHook("farm-a");
    expect(returnedFilter).toBeNull();
  });

  it("keeps each farm's saved filter separate", async () => {
    const [, setFarmAFilter, cleanupA] = mountHook("farm-a");
    await drainAsync();
    setFarmAFilter("active");
    cleanupA?.();

    const [, setFarmBFilter, cleanupB] = mountHook("farm-b");
    await drainAsync();
    expect(readMountedHook("farm-b")[0]).toBeNull();
    setFarmBFilter("pending");
    cleanupB?.();

    mountHook("farm-a");
    await drainAsync();
    const [farmAFilter] = readMountedHook("farm-a");
    expect(farmAFilter).toBe("active");

    const [, , cleanupAReturn] = mountHook("farm-b");
    await drainAsync();
    expect(readMountedHook("farm-b")[0]).toBe("pending");
    cleanupAReturn?.();
  });
});