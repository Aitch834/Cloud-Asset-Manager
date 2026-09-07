import { drainAsync, StateStore } from "./helpers/cachedHookHarness";

const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockHarness = {
  store: new StateStore(),
  stateSlotCounter: { value: 0 },
  refSlotCounter: { value: 0 },
  refs: [] as Array<{ current: unknown }>,
  capturedEffect: { value: null as (() => void | (() => void)) | null },
};

jest.mock("@/lib/storage", () => ({
  getItem: (...args: [string]) => mockGetItem(...args),
  setItem: (...args: [string, unknown]) => mockSetItem(...args),
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

import { usePersistedVesselZoneFilter } from "@/lib/hooks/usePersistedVesselZoneFilter";

type DeferredRead = {
  key: string;
  resolve: (value: unknown) => void;
};

function renderHook(
  farmId: string | undefined,
): [string[], (value: string[] | ((current: string[]) => string[])) => void] {
  mockHarness.stateSlotCounter.value = 0;
  mockHarness.refSlotCounter.value = 0;
  mockHarness.capturedEffect.value = null;
  return usePersistedVesselZoneFilter(farmId);
}

function runCurrentEffect(): (() => void) | undefined {
  return mockHarness.capturedEffect.value?.() || undefined;
}

describe("usePersistedVesselZoneFilter", () => {
  let reads: DeferredRead[];

  beforeEach(() => {
    mockHarness.store.reset([[]]);
    mockHarness.refs = [];
    reads = [];
    mockGetItem.mockReset().mockImplementation((key: string) => new Promise(resolve => {
      reads.push({ key, resolve });
    }));
    mockSetItem.mockReset().mockResolvedValue(undefined);
  });

  it("restores each farm's saved zones without exposing the previous farm", async () => {
    expect(renderHook("farm-a")[0]).toEqual([]);
    const cleanupA = runCurrentEffect();
    expect(reads[0]?.key).toBe("bde_vessel_zone_filter_farm-a");

    reads[0].resolve(["North", "West"]);
    await drainAsync();
    expect(renderHook("farm-a")[0]).toEqual(["North", "West"]);

    expect(renderHook("farm-b")[0]).toEqual([]);
    cleanupA?.();
    runCurrentEffect();
    expect(reads[1]?.key).toBe("bde_vessel_zone_filter_farm-b");

    reads[1].resolve(["South"]);
    await drainAsync();
    expect(renderHook("farm-b")[0]).toEqual(["South"]);
  });

  it("persists functional updates and an explicitly cleared filter", () => {
    renderHook("farm-a");
    runCurrentEffect();
    const [, setZoneFilter] = renderHook("farm-a");

    setZoneFilter(["North"]);
    setZoneFilter(current => [...current, "West"]);
    setZoneFilter([]);

    expect(mockSetItem).toHaveBeenNthCalledWith(
      1,
      "bde_vessel_zone_filter_farm-a",
      ["North"],
    );
    expect(mockSetItem).toHaveBeenNthCalledWith(
      2,
      "bde_vessel_zone_filter_farm-a",
      ["North", "West"],
    );
    expect(mockSetItem).toHaveBeenNthCalledWith(
      3,
      "bde_vessel_zone_filter_farm-a",
      [],
    );
  });

  it("does not let a late read overwrite a newer user selection", async () => {
    renderHook("farm-a");
    runCurrentEffect();
    const [, setZoneFilter] = renderHook("farm-a");

    setZoneFilter(["Current"]);
    reads[0].resolve(["Stale"]);
    await drainAsync();

    expect(renderHook("farm-a")[0]).toEqual(["Current"]);
  });
});