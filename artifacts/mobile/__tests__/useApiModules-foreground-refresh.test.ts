const mockEffects: Array<() => void | (() => void)> = [];
const mockStateSetters: Array<jest.Mock> = [];
let mockStateIndex = 0;

const mockKvGet = jest.fn<Promise<string | null>, [string]>();
const mockKvSet = jest.fn<Promise<void>, [string, string]>();

jest.mock("react", () => ({
  useEffect: (effect: () => void | (() => void)) => {
    mockEffects.push(effect);
  },
  useState: (initialValue: unknown) => {
    const setter = jest.fn();
    mockStateSetters[mockStateIndex] = setter;
    mockStateIndex += 1;
    return [initialValue, setter];
  },
}));

jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

jest.mock("@/lib/database", () => ({
  kvGet: (...args: [string]) => mockKvGet(...args),
  kvSet: (...args: [string, string]) => mockKvSet(...args),
}));

import {
  refreshApiModules,
  useApiModules,
} from "../lib/hooks/useApiModules";

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

describe("useApiModules foreground refresh", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEffects.length = 0;
    mockStateSetters.length = 0;
    mockStateIndex = 0;
    mockKvGet.mockResolvedValue(null);
    mockKvSet.mockResolvedValue(undefined);
    process.env.EXPO_PUBLIC_DOMAIN = "api.example.test";
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_DOMAIN;
  });

  it("updates an already-mounted farm hook when polling fetches new module keys", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activeModuleKeys: ["field-crop-management"] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeModuleKeys: ["field-crop-management", "water-irrigation"],
        }),
      }) as unknown as typeof fetch;

    useApiModules("42");
    const cleanup = mockEffects[0]?.();
    await flushPromises();
    await flushPromises();

    expect(mockStateSetters[0]).toHaveBeenLastCalledWith([
      "field-crop-management",
    ]);
    expect(mockStateSetters[2]).toHaveBeenLastCalledWith("42");

    await refreshApiModules("42", "authorized-farm");

    expect(mockStateSetters[0]).toHaveBeenLastCalledWith([
      "field-crop-management",
      "water-irrigation",
    ]);
    expect(mockKvSet).toHaveBeenLastCalledWith(
      "bde_active_module_keys_42",
      JSON.stringify(["field-crop-management", "water-irrigation"]),
    );

    if (typeof cleanup === "function") cleanup();
  });
});