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

import { usePersistedVintage } from "@/lib/hooks/usePersistedVintage";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function renderHook(farmId: string) {
  mockHarness.stateSlotCounter.value = 0;
  mockHarness.refSlotCounter.value = 0;
  mockHarness.capturedEffect.value = null;
  return usePersistedVintage(farmId);
}

describe("usePersistedVintage", () => {
  beforeEach(() => {
    mockHarness.store.reset([undefined, undefined, null]);
    mockHarness.refs = [];
    mockGetItem.mockReset();
    mockSetItem.mockReset().mockResolvedValue(undefined);
  });

  it("restores a saved vintage for the same farm after reopening", async () => {
    mockGetItem.mockResolvedValue(2024);

    renderHook("farm-a");
    mockHarness.capturedEffect.value?.();
    await drainAsync();

    expect(mockGetItem).toHaveBeenCalledWith("bde_vine_vintage_farm-a");
    expect(renderHook("farm-a")).toEqual([2024, expect.any(Function), "farm-a", null]);
  });

  it("reports a corrupt stored value as no preference", async () => {
    mockGetItem.mockResolvedValue("2024");

    renderHook("farm-a");
    mockHarness.capturedEffect.value?.();
    await drainAsync();

    expect(renderHook("farm-a")).toEqual([undefined, expect.any(Function), "farm-a", null]);
  });

  it("persists a changed vintage with a farm-scoped key", () => {
    const [, setVintage] = renderHook("farm-a");
    setVintage(2025);

    expect(mockSetItem).toHaveBeenCalledWith("bde_vine_vintage_farm-a", 2025);
  });

  it("ignores an old farm read that resolves after the current farm", async () => {
    const farmARead = deferred<number>();
    const farmBRead = deferred<number>();
    mockGetItem.mockImplementation((key: string) => {
      if (key === "bde_vine_vintage_farm-a") return farmARead.promise;
      if (key === "bde_vine_vintage_farm-b") return farmBRead.promise;
      throw new Error(`Unexpected storage key: ${key}`);
    });

    renderHook("farm-a");
    const cancelFarmARead = mockHarness.capturedEffect.value?.();

    renderHook("farm-b");
    cancelFarmARead?.();
    mockHarness.capturedEffect.value?.();

    farmBRead.resolve(2025);
    await drainAsync();
    expect(renderHook("farm-b")).toEqual([2025, expect.any(Function), "farm-b", null]);

    farmARead.resolve(2023);
    await drainAsync();
    expect(renderHook("farm-b")).toEqual([2025, expect.any(Function), "farm-b", null]);
    expect(mockGetItem.mock.calls).toEqual([
      ["bde_vine_vintage_farm-a"],
      ["bde_vine_vintage_farm-b"],
    ]);
  });

  it("warns without rolling back the visible vintage when storage rejects the write", async () => {
    mockSetItem.mockRejectedValue(new Error("storage unavailable"));
    const [, setVintage] = renderHook("farm-a");

    setVintage(2025);
    await drainAsync();

    expect(renderHook("farm-a")).toEqual([
      2025,
      expect.any(Function),
      undefined,
      "Your vintage selection could not be remembered. The current analytics are still available.",
    ]);
  });
});
