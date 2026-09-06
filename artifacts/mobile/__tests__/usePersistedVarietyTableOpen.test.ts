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

import { usePersistedVarietyTableOpen } from "@/lib/hooks/usePersistedVarietyTableOpen";

type SetOpen = (open: boolean | ((previous: boolean) => boolean)) => void;

type DeferredRead = {
  key: string;
  resolve: (value: unknown) => void;
};

function renderHook(farmId: string | undefined): [boolean, SetOpen] {
  mockHarness.stateSlotCounter.value = 0;
  mockHarness.refSlotCounter.value = 0;
  mockHarness.capturedEffect.value = null;
  return usePersistedVarietyTableOpen(farmId);
}

function runCurrentEffect(): (() => void) | undefined {
  const effect = mockHarness.capturedEffect.value;
  return effect?.() || undefined;
}

describe("usePersistedVarietyTableOpen", () => {
  let reads: DeferredRead[];

  beforeEach(() => {
    mockHarness.store.reset([true]);
    mockHarness.stateSlotCounter.value = 0;
    mockHarness.refSlotCounter.value = 0;
    mockHarness.refs = [];
    mockHarness.capturedEffect.value = null;
    reads = [];
    mockGetItem.mockReset().mockImplementation(
      (key: string) =>
        new Promise((resolve) => {
          reads.push({ key, resolve });
        }),
    );
    mockSetItem.mockReset().mockResolvedValue(undefined);
  });

  it.each([
    ["open", true],
    ["closed", false],
  ] as const)("restores a valid saved %s value", async (_label, storedValue) => {
    renderHook("farm-a");
    runCurrentEffect();

    expect(reads[0]?.key).toBe("bde_vine_variety_table_open_farm-a");
    reads[0].resolve(storedValue);
    await drainAsync();

    expect(renderHook("farm-a")[0]).toBe(storedValue);
  });

  it.each([null, "false", 0, {}, []])(
    "falls back to open for malformed stored value %p",
    async (storedValue) => {
      renderHook("farm-a");
      runCurrentEffect();

      reads[0].resolve(storedValue);
      await drainAsync();

      expect(renderHook("farm-a")[0]).toBe(true);
    },
  );

  it("ignores a stale storage read after switching farms", async () => {
    renderHook("farm-a");
    const cleanupFarmA = runCurrentEffect();

    renderHook("farm-b");
    cleanupFarmA?.();
    runCurrentEffect();
    expect(reads.map(({ key }) => key)).toEqual([
      "bde_vine_variety_table_open_farm-a",
      "bde_vine_variety_table_open_farm-b",
    ]);

    reads[1].resolve(false);
    await drainAsync();
    expect(renderHook("farm-b")[0]).toBe(false);

    reads[0].resolve(true);
    await drainAsync();
    expect(renderHook("farm-b")[0]).toBe(false);
  });

  it("does not overwrite a user toggle made before hydration completes", async () => {
    const [, setIsOpen] = renderHook("farm-a");
    runCurrentEffect();

    setIsOpen(false);
    expect(mockSetItem).toHaveBeenCalledWith(
      "bde_vine_variety_table_open_farm-a",
      false,
    );

    reads[0].resolve(true);
    await drainAsync();

    expect(renderHook("farm-a")[0]).toBe(false);
  });
});