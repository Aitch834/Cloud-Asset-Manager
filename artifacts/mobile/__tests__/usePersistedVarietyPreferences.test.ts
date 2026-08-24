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

import { type VarietySort, usePersistedVarietySort } from "@/lib/hooks/usePersistedVarietySort";

const DEFAULT_SORT: VarietySort = { col: "variety", dir: "asc" };

type DeferredRead = {
  key: string;
  resolve: (value: unknown) => void;
};

function renderHook(farmId: string): [VarietySort, (sort: VarietySort) => void] {
  mockHarness.stateSlotCounter.value = 0;
  mockHarness.refSlotCounter.value = 0;
  mockHarness.capturedEffect.value = null;
  return usePersistedVarietySort(farmId);
}

function runCurrentEffect(): (() => void) | undefined {
  const effect = mockHarness.capturedEffect.value;
  return effect?.() || undefined;
}

describe("usePersistedVarietySort", () => {
  let reads: DeferredRead[];

  beforeEach(() => {
    mockHarness.store.reset([DEFAULT_SORT]);
    mockHarness.stateSlotCounter.value = 0;
    mockHarness.refSlotCounter.value = 0;
    mockHarness.refs = [];
    mockHarness.capturedEffect.value = null;
    reads = [];
    mockGetItem.mockReset().mockImplementation((key: string) => new Promise((resolve) => {
      reads.push({ key, resolve });
    }));
    mockSetItem.mockReset().mockResolvedValue(undefined);
  });

  it("restores the saved sort when returning quickly to a farm", async () => {
    renderHook("farm-a");
    const cleanupA = runCurrentEffect();
    expect(reads[0]?.key).toBe("bde_vine_variety_sort_farm-a");

    reads[0].resolve({ col: "totalKg", dir: "desc" } satisfies VarietySort);
    await drainAsync();
    expect(renderHook("farm-a")[0]).toEqual({ col: "totalKg", dir: "desc" });

    renderHook("farm-b");
    cleanupA?.();
    const cleanupB = runCurrentEffect();
    expect(reads[1]?.key).toBe("bde_vine_variety_sort_farm-b");

    const [, setFarmBSort] = renderHook("farm-b");
    setFarmBSort({ col: "avgBrix", dir: "desc" });

    renderHook("farm-a");
    cleanupB?.();
    runCurrentEffect();
    expect(reads[2]?.key).toBe("bde_vine_variety_sort_farm-a");

    reads[2].resolve({ col: "totalKg", dir: "desc" } satisfies VarietySort);
    await drainAsync();
    expect(renderHook("farm-a")[0]).toEqual({ col: "totalKg", dir: "desc" });

    // The abandoned farm-B read must not overwrite the restored farm-A sort.
    reads[1].resolve({ col: "variety", dir: "asc" } satisfies VarietySort);
    await drainAsync();
    expect(renderHook("farm-a")[0]).toEqual({ col: "totalKg", dir: "desc" });
  });

  it("persists a new sort for the current farm before hydration completes", async () => {
    const [, setSort] = renderHook("farm-a");
    runCurrentEffect();

    setSort({ col: "avgBrix", dir: "desc" });
    expect(mockSetItem).toHaveBeenCalledWith(
      "bde_vine_variety_sort_farm-a",
      { col: "avgBrix", dir: "desc" },
    );

    reads[0].resolve({ col: "variety", dir: "asc" } satisfies VarietySort);
    await drainAsync();
    expect(renderHook("farm-a")[0]).toEqual({ col: "avgBrix", dir: "desc" });
  });
});