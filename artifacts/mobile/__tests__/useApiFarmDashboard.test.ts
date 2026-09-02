const mockEffects: Array<() => void | (() => void)> = [];
const mockStateSetters: Array<jest.Mock> = [];
let mockStateIndex = 0;

const mockKvGet = jest.fn<Promise<string | null>, [string]>();

jest.mock("react", () => ({
  useCallback: (callback: (...args: any[]) => unknown) => callback,
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
}));

import { useApiFarmDashboard } from "../lib/hooks/useApiFarmDashboard";

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

describe("useApiFarmDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEffects.length = 0;
    mockStateSetters.length = 0;
    mockStateIndex = 0;
    mockKvGet.mockResolvedValue(null);
    process.env.EXPO_PUBLIC_DOMAIN = "api.example.test";
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_DOMAIN;
  });

  it("does not expose module keys until a slow dashboard response resolves", async () => {
    let resolveFetch!: (response: Response) => void;
    global.fetch = jest.fn(
      () => new Promise<Response>((resolve) => { resolveFetch = resolve; }),
    ) as unknown as typeof fetch;

    const result = useApiFarmDashboard("42");
    expect(result.data).toBeNull();
    expect(result.loading).toBe(true);
    expect(mockStateSetters[0]).not.toHaveBeenCalled();

    const cleanup = mockEffects[0]?.();
    await flushPromises();
    expect(mockStateSetters[0]).toHaveBeenLastCalledWith(null);
    expect(mockStateSetters[3]).toHaveBeenLastCalledWith(undefined);

    resolveFetch({
      ok: true,
      json: async () => ({
        activeSubscriptions: [{ moduleKey: "viticulture" }],
      }),
    } as Response);
    await flushPromises();
    await flushPromises();

    expect(mockStateSetters[0]).toHaveBeenLastCalledWith(
      expect.objectContaining({ activeModuleKeys: ["viticulture"] }),
    );
    expect(mockStateSetters[3]).toHaveBeenLastCalledWith("42");
    expect(mockStateSetters[1]).toHaveBeenLastCalledWith(false);

    if (typeof cleanup === "function") cleanup();
  });

  it("invalidates a successful response while a reload is pending", async () => {
    let resolveReload!: (response: Response) => void;
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeSubscriptions: [{ moduleKey: "viticulture" }],
        }),
      })
      .mockImplementationOnce(
        () => new Promise<Response>((resolve) => { resolveReload = resolve; }),
      ) as unknown as typeof fetch;

    const result = useApiFarmDashboard("42");
    mockEffects[0]?.();
    await flushPromises();
    await flushPromises();

    mockStateSetters[0].mockClear();
    mockStateSetters[1].mockClear();
    mockStateSetters[3].mockClear();

    const reloadPromise = result.reload();
    await flushPromises();

    expect(mockStateSetters[0]).toHaveBeenCalledWith(null);
    expect(mockStateSetters[3]).toHaveBeenCalledWith(undefined);
    expect(mockStateSetters[1]).toHaveBeenCalledWith(true);

    resolveReload({
      ok: true,
      json: async () => ({
        activeSubscriptions: [{ moduleKey: "viticulture" }],
      }),
    } as Response);
    await reloadPromise;
  });

  it("keeps module data invalid after a failed reload and can retry", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeSubscriptions: [{ moduleKey: "viticulture" }],
        }),
      })
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activeSubscriptions: [{ moduleKey: "organic-viticulture" }],
        }),
      }) as unknown as typeof fetch;

    const result = useApiFarmDashboard("42");
    const effect = mockEffects[0];
    effect?.();
    await flushPromises();
    await flushPromises();

    await result.reload();

    expect(mockStateSetters[0]).toHaveBeenLastCalledWith(null);
    expect(mockStateSetters[3]).toHaveBeenLastCalledWith(undefined);
    expect(mockStateSetters[2]).toHaveBeenLastCalledWith("Server returned 503");
    expect(mockStateSetters[1]).toHaveBeenLastCalledWith(false);

    await result.reload();

    expect(mockStateSetters[0]).toHaveBeenLastCalledWith(
      expect.objectContaining({ activeModuleKeys: ["organic-viticulture"] }),
    );
    expect(mockStateSetters[3]).toHaveBeenLastCalledWith("42");
    expect(mockStateSetters[2]).toHaveBeenLastCalledWith(null);
    expect(mockStateSetters[1]).toHaveBeenLastCalledWith(false);
  });

  it("invalidates the previous farm before a changed farm resolves", async () => {
    global.fetch = jest.fn(
      () => new Promise<Response>(() => undefined),
    ) as unknown as typeof fetch;

    useApiFarmDashboard("farm-b");
    mockEffects[0]?.();
    await flushPromises();

    expect(mockStateSetters[0]).toHaveBeenCalledWith(null);
    expect(mockStateSetters[3]).toHaveBeenCalledWith(undefined);
    expect(mockStateSetters[1]).toHaveBeenCalledWith(true);
  });
});