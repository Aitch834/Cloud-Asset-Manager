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

import {
  type VineRegisterStatusFilter,
  usePersistedVineRegisterStatusFilter,
} from "@/lib/hooks/usePersistedVineRegisterStatusFilter";

type DeferredRead = {
  key: string;
  resolve: (value: unknown) => void;
};

function renderHook(
  farmId: string | undefined,
): [VineRegisterStatusFilter, (value: VineRegisterStatusFilter) => void] {
  mockHarness.stateSlotCounter.value = 0;
  mockHarness.refSlotCounter.value = 0;
  mockHarness.capturedEffect.value = null;
  return usePersistedVineRegisterStatusFilter(farmId);
}

function runCurrentEffect(): (() => void) | undefined {
  const effect = mockHarness.capturedEffect.value;
  return effect?.() || undefined;
}

describe("usePersistedVineRegisterStatusFilter", () => {
  let reads: DeferredRead[];

  beforeEach(() => {
    mockHarness.store.reset(["active"]);
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

  it("defaults to Active, restores a saved filter, and scopes it to each farm", async () => {
    expect(renderHook("farm-a")[0]).toBe("active");
    const cleanupA = runCurrentEffect();
    expect(reads[0]?.key).toBe("bde_vine_register_status_filter_farm-a");

    reads[0].resolve("removed");
    await drainAsync();
    expect(renderHook("farm-a")[0]).toBe("removed");

    renderHook("farm-b");
    cleanupA?.();
    const cleanupB = runCurrentEffect();
    expect(renderHook("farm-b")[0]).toBe("active");
    expect(reads[1]?.key).toBe("bde_vine_register_status_filter_farm-b");

    reads[1].resolve("all");
    await drainAsync();
    expect(renderHook("farm-b")[0]).toBe("all");
  });

  it("persists user selections and ignores invalid stored values", async () => {
    renderHook("farm-a");
    runCurrentEffect();
    const [, setStatusFilter] = renderHook("farm-a");
    setStatusFilter("removed");
    expect(mockSetItem).toHaveBeenCalledWith(
      "bde_vine_register_status_filter_farm-a",
      "removed",
    );

    reads[0].resolve("invalid");
    await drainAsync();
    expect(renderHook("farm-a")[0]).toBe("removed");

    renderHook("farm-b");
    runCurrentEffect();
    reads[1].resolve("invalid");
    await drainAsync();
    expect(renderHook("farm-b")[0]).toBe("active");
  });
});