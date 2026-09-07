const mockUnset = Symbol("unset");
let mockState: unknown = mockUnset;
let mockCapturedEffect: (() => unknown) | null = null;

jest.mock("react", () => ({
  useState: (initialValue: unknown) => {
    if (mockState === mockUnset) mockState = initialValue;
    return [
      mockState,
      (nextValue: unknown) => {
        mockState =
          typeof nextValue === "function"
            ? (nextValue as (mockPrevious: unknown) => unknown)(mockState)
            : nextValue;
      },
    ];
  },
  useEffect: (effect: () => unknown) => {
    mockCapturedEffect = effect;
  },
}));

jest.mock("@/lib/uploadPhoto", () => ({
  getApiBase: () => "https://api.example.test",
}));

type Thresholds = {
  idleBarrelDays: number;
  approachingNeutralFills: number;
};

type ThresholdHook = (
  idleBarrelDaysOverride?: number | null,
  approachingNeutralFillsOverride?: number | null,
  enabled?: boolean,
) => Thresholds;

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

async function drainAsync(): Promise<void> {
  for (let index = 0; index < 4; index += 1) await flushPromises();
}

function loadHook(): ThresholdHook {
  jest.resetModules();
  return require("../lib/hooks/useBarrelAlertThresholds")
    .useBarrelAlertThresholds as ThresholdHook;
}

async function loadPlatformDefaults(
  hook: ThresholdHook,
  idleOverride?: number | null,
  neutralOverride?: number | null,
): Promise<Thresholds> {
  hook(idleOverride, neutralOverride);
  mockCapturedEffect?.();
  await drainAsync();
  return hook(idleOverride, neutralOverride);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockState = mockUnset;
  mockCapturedEffect = null;
});

describe("useBarrelAlertThresholds", () => {
  it("uses valid platform defaults when farm overrides are absent", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        config: {
          barrel_idle_days_default: 11,
          barrel_neutral_fills_default: 7,
        },
      }),
    }) as typeof fetch;

    const hook = loadHook();
    const thresholds = await loadPlatformDefaults(hook);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.test/api/platform-config",
    );
    expect(thresholds).toEqual({
      idleBarrelDays: 11,
      approachingNeutralFills: 7,
    });
  });

  it.each([
    ["a non-OK response", () => Promise.resolve({ ok: false })],
    ["a failed request", () => Promise.reject(new Error("offline"))],
  ])("preserves built-in fallbacks after %s", async (_label, response) => {
    global.fetch = jest.fn(response) as typeof fetch;

    const hook = loadHook();
    const thresholds = await loadPlatformDefaults(hook);
    const {
      IDLE_BARREL_DAYS,
      APPROACHING_NEUTRAL_FILLS,
    } = require("../lib/utils/vesselAlerts") as {
      IDLE_BARREL_DAYS: number;
      APPROACHING_NEUTRAL_FILLS: number;
    };

    expect(thresholds).toEqual({
      idleBarrelDays: IDLE_BARREL_DAYS,
      approachingNeutralFills: APPROACHING_NEUTRAL_FILLS,
    });
  });

  it("keeps farm-specific overrides ahead of loaded platform defaults", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        config: {
          barrel_idle_days_default: 11,
          barrel_neutral_fills_default: 7,
        },
      }),
    }) as typeof fetch;

    const hook = loadHook();
    const thresholds = await loadPlatformDefaults(hook, 4, 2);

    expect(thresholds).toEqual({
      idleBarrelDays: 4,
      approachingNeutralFills: 2,
    });
  });
});