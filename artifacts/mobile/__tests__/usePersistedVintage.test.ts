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

function renderHook(farmId: string) {
  mockHarness.stateSlotCounter.value = 0;
  mockHarness.refSlotCounter.value = 0;
  mockHarness.capturedEffect.value = null;
  return usePersistedVintage(farmId);
}

describe("usePersistedVintage", () => {
  beforeEach(() => {
    mockHarness.store.reset([undefined, undefined]);
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
    expect(renderHook("farm-a")).toEqual([2024, expect.any(Function), "farm-a"]);
  });

  it("reports a corrupt stored value as no preference", async () => {
    mockGetItem.mockResolvedValue("2024");

    renderHook("farm-a");
    mockHarness.capturedEffect.value?.();
    await drainAsync();

    expect(renderHook("farm-a")).toEqual([undefined, expect.any(Function), "farm-a"]);
  });

  it("persists a changed vintage with a farm-scoped key", () => {
    const [, setVintage] = renderHook("farm-a");
    setVintage(2025);

    expect(mockSetItem).toHaveBeenCalledWith("bde_vine_vintage_farm-a", 2025);
  });
});