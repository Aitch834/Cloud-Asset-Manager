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

import { type PressureFilter, usePersistedPressureFilter } from "@/lib/hooks/usePersistedPressureFilter";

type DeferredRead = {
  key: string;
  resolve: (value: unknown) => void;
};

function renderHook(farmId: string | undefined): [PressureFilter, (value: PressureFilter) => void] {
  mockHarness.stateSlotCounter.value = 0;
  mockHarness.refSlotCounter.value = 0;
  mockHarness.capturedEffect.value = null;
  return usePersistedPressureFilter(farmId);
}

function runCurrentEffect(): (() => void) | undefined {
  const effect = mockHarness.capturedEffect.value;
  return effect?.() || undefined;
}

describe("usePersistedPressureFilter", () => {
  let reads: DeferredRead[];

  beforeEach(() => {
    mockHarness.store.reset(["__all__"]);
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

  it("restores a saved pressure filter and keeps it scoped to each farm", async () => {
    renderHook("farm-a");
    const cleanupA = runCurrentEffect();
    expect(reads[0]?.key).toBe("bde_vine_scouting_pressure_filter_farm-a");

    reads[0].resolve("3");
    await drainAsync();
    expect(renderHook("farm-a")[0]).toBe("3");

    renderHook("farm-b");
    cleanupA?.();
    const cleanupB = runCurrentEffect();
    expect(renderHook("farm-b")[0]).toBe("__all__");
    expect(reads[1]?.key).toBe("bde_vine_scouting_pressure_filter_farm-b");

    reads[1].resolve("2");
    await drainAsync();
    expect(renderHook("farm-b")[0]).toBe("2");

    renderHook("farm-a");
    cleanupB?.();
    runCurrentEffect();
    expect(reads[2]?.key).toBe("bde_vine_scouting_pressure_filter_farm-a");
    reads[2].resolve("3");
    await drainAsync();
    expect(renderHook("farm-a")[0]).toBe("3");
  });

  it("writes selected filters and falls back to All pressure for invalid values", async () => {
    renderHook("farm-a");
    runCurrentEffect();
    const [, setPressureFilter] = renderHook("farm-a");
    setPressureFilter("1");
    expect(mockSetItem).toHaveBeenCalledWith(
      "bde_vine_scouting_pressure_filter_farm-a",
      "1",
    );

    reads[0].resolve("unexpected");
    await drainAsync();
    expect(renderHook("farm-a")[0]).toBe("1");

    renderHook("farm-b");
    runCurrentEffect();
    reads[1].resolve("unexpected");
    await drainAsync();
    expect(renderHook("farm-b")[0]).toBe("__all__");
  });
});