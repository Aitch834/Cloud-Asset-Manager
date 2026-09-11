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

import { usePersistedDateRange } from "@/lib/hooks/usePersistedDateRange";

type PersistedDateRange = {
  from: string;
  to: string;
};

type DeferredRead = {
  key: string;
  resolve: (value: unknown) => void;
};

type DateRangeHook = [
  string,
  (value: string) => void,
  string,
  (value: string) => void,
];

function renderHook(farmId: string | undefined): DateRangeHook {
  mockHarness.stateSlotCounter.value = 0;
  mockHarness.refSlotCounter.value = 0;
  mockHarness.capturedEffect.value = null;
  return usePersistedDateRange(farmId);
}

function runCurrentEffect(): (() => void) | undefined {
  const effect = mockHarness.capturedEffect.value;
  return effect?.() || undefined;
}

describe("usePersistedDateRange", () => {
  let reads: DeferredRead[];

  beforeEach(() => {
    mockHarness.store.reset([{ from: "", to: "" }]);
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

  it("restores each farm's saved range without leaking the previous farm", async () => {
    const farmARange = {
      from: "2026-04-01",
      to: "2026-04-30",
    } satisfies PersistedDateRange;
    const farmBRange = {
      from: "2026-05-01",
      to: "2026-05-31",
    } satisfies PersistedDateRange;

    renderHook("farm-a");
    const cleanupA = runCurrentEffect();
    expect(reads[0]?.key).toBe("bde_vine_scouting_date_range_farm-a");

    reads[0].resolve(farmARange);
    await drainAsync();
    expect(renderHook("farm-a")).toEqual([
      farmARange.from,
      expect.any(Function),
      farmARange.to,
      expect.any(Function),
    ]);

    renderHook("farm-b");
    cleanupA?.();
    const cleanupB = runCurrentEffect();
    expect(renderHook("farm-b")[0]).toBe("");
    expect(renderHook("farm-b")[2]).toBe("");
    expect(reads[1]?.key).toBe("bde_vine_scouting_date_range_farm-b");

    reads[1].resolve(farmBRange);
    await drainAsync();
    expect(renderHook("farm-b")[0]).toBe(farmBRange.from);
    expect(renderHook("farm-b")[2]).toBe(farmBRange.to);

    renderHook("farm-a");
    cleanupB?.();
    runCurrentEffect();
    expect(renderHook("farm-a")[0]).toBe("");
    expect(renderHook("farm-a")[2]).toBe("");
    expect(reads[2]?.key).toBe("bde_vine_scouting_date_range_farm-a");

    reads[2].resolve(farmARange);
    await drainAsync();
    expect(renderHook("farm-a")[0]).toBe(farmARange.from);
    expect(renderHook("farm-a")[2]).toBe(farmARange.to);
  });

  it("writes the complete range when either date is cleared", async () => {
    renderHook("farm-a");
    runCurrentEffect();
    reads[0].resolve({ from: "2026-06-01", to: "2026-06-30" });
    await drainAsync();

    const [, setDateFrom, , setDateTo] = renderHook("farm-a");

    setDateFrom("");
    expect(mockSetItem).toHaveBeenLastCalledWith(
      "bde_vine_scouting_date_range_farm-a",
      { from: "", to: "2026-06-30" },
    );

    setDateTo("");
    expect(mockSetItem).toHaveBeenLastCalledWith(
      "bde_vine_scouting_date_range_farm-a",
      { from: "", to: "" },
    );
  });
});