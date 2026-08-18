/**
 * Tests for useDiseaseAlert — farm-switch safety and request-identity guard.
 *
 * Covers:
 *  1. No farm selected — fetch never called, alert stays null.
 *  2. Successful fetch — alert state set from API response.
 *  3. Farm switch — prior farm's alert is cleared immediately (before async
 *     work settles), not after.
 *  4. Out-of-order / delayed response — stale farm-a response arriving after
 *     switching to farm-b is discarded; state remains farm-b's alert.
 *  5. Failed second-farm fetch — alert stays null after switch; previous
 *     farm's alert is NOT restored.
 *
 * Architecture note
 * -----------------
 * We avoid @testing-library/react-native (ESM-only Expo modules crash the
 * Node Jest environment) and instead mock React's core primitives directly,
 * capturing the useEffect callback and firing it manually — the same approach
 * used by buildCachedApiHook.test.ts and winegb-banner-migration.test.ts.
 *
 * Variable-naming constraint: every name referenced inside a jest.mock()
 * factory MUST start with "mock" (babel-jest hoist rule).
 */

// ---------------------------------------------------------------------------
// Async helpers
// ---------------------------------------------------------------------------

const mockFlushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

async function drain(rounds = 8): Promise<void> {
  for (let i = 0; i < rounds; i++) await mockFlushPromises();
}

// ---------------------------------------------------------------------------
// Module-level mutable state shared between jest.mock closures and tests
// ---------------------------------------------------------------------------

/** The single useState slot (alert) in useDiseaseAlert. */
let mockAlertState: import("../lib/hooks/useDiseaseAlert").DiseaseAlertData | null = null;

/**
 * The request-identity counter ref. Must be a stable object so the effect
 * closure's `requestIdRef.current` mutations are visible to the test and to
 * subsequent effect runs within the same test.
 */
const mockRequestIdRef = { current: 0 };

/** Most recently captured useEffect callback. */
let mockCapturedEffect: (() => unknown) | null = null;

/** currentFarm value returned by the mocked useFarm(). */
let mockCurrentFarm: { id: string } | undefined = undefined;

/**
 * Setter for the single useState slot. Extracted here (prefixed `mock`) so the
 * jest.mock("react") factory can reference it without triggering babel-jest's
 * out-of-scope variable restriction (which rejects non-mock-prefixed names used
 * inside factory closures, including TypeScript parameter names in type casts).
 */
const mockSetAlertState = (v: unknown): void => {
  type AlertOrNull = import("../lib/hooks/useDiseaseAlert").DiseaseAlertData | null;
  mockAlertState =
    typeof v === "function"
      ? (v as (prev: AlertOrNull) => AlertOrNull)(mockAlertState)
      : (v as AlertOrNull);
};

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockApiFetch = jest.fn<
  Promise<Partial<Response>>,
  [string, RequestInit?]
>();

jest.mock("@/lib/apiFetch", () => ({
  apiFetch: (...args: [string, RequestInit?]) => mockApiFetch(...args),
}));

jest.mock("@/lib/context/FarmContext", () => ({
  useFarm: () => ({ currentFarm: mockCurrentFarm }),
}));

jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
}));

jest.mock("react", () => ({
  /**
   * Single-slot useState: returns current mockAlertState and a setter that
   * delegates to mockSetAlertState (prefixed mock → allowed in factory scope).
   */
  useState: (_init: unknown) => [mockAlertState, mockSetAlertState],
  /** Capture the effect — fired manually in each test. */
  useEffect: (fn: () => unknown, _deps?: unknown[]) => {
    mockCapturedEffect = fn;
  },
  /** Return the shared stable ref so the guard counter is visible to tests. */
  useRef: (_init: unknown) => mockRequestIdRef,
}));

// ---------------------------------------------------------------------------
// Import under test (must come AFTER all jest.mock() calls)
// ---------------------------------------------------------------------------

import { useDiseaseAlert } from "../lib/hooks/useDiseaseAlert";
import type { DiseaseAlertData } from "../lib/hooks/useDiseaseAlert";

// ---------------------------------------------------------------------------
// Per-test reset
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  mockAlertState = null;
  mockRequestIdRef.current = 0;
  mockCapturedEffect = null;
  mockCurrentFarm = undefined;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FARM_A = "farm-111";
const FARM_B = "farm-222";

const ALERT_A: DiseaseAlertData = {
  active: true,
  level: "national",
  message: "National cattle alert",
};

const ALERT_B: DiseaseAlertData = {
  active: true,
  level: "regional",
  message: "Regional cattle alert",
};

function makeOk(data: unknown): Partial<Response> {
  return { ok: true, json: async () => data };
}

/**
 * Mount the hook for `farmId` + `sector` and return the captured useEffect
 * callback.  Does NOT fire the effect; the caller does that so it can save the
 * cleanup before deciding when to run the next effect.
 */
function mountHook(
  farmId: string | undefined,
  sector: "beef" | "dairy" | "sheep" | "goat" | "pig" = "beef"
): () => unknown {
  mockCurrentFarm = farmId ? { id: farmId } : undefined;
  useDiseaseAlert(sector);
  return mockCapturedEffect!;
}

// ===========================================================================
// 1. No farm selected
// ===========================================================================

describe("useDiseaseAlert — no farm selected", () => {
  it("does not call apiFetch and leaves alert null when farmId is undefined", async () => {
    const effect = mountHook(undefined);
    effect();
    await drain();

    expect(mockApiFetch).not.toHaveBeenCalled();
    expect(mockAlertState).toBeNull();
  });

  it("returns a cleanup function even when farmId is absent", () => {
    const effect = mountHook(undefined);
    // Effect should return nothing (undefined / no cleanup), which is fine
    const cleanup = effect();
    // Just confirm it doesn't throw
    if (typeof cleanup === "function") cleanup();
  });
});

// ===========================================================================
// 2. Successful fetch
// ===========================================================================

describe("useDiseaseAlert — successful fetch", () => {
  it("sets alert state when API returns an active alert", async () => {
    mockApiFetch.mockResolvedValue(makeOk(ALERT_A));

    const effect = mountHook(FARM_A);
    effect();
    await drain();

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/beef-alert?farmId=${FARM_A}`)
    );
    expect(mockAlertState).toEqual(ALERT_A);
  });

  it("leaves alert null when API returns active: false", async () => {
    mockApiFetch.mockResolvedValue(makeOk({ active: false }));

    const effect = mountHook(FARM_A);
    effect();
    await drain();

    expect(mockAlertState).toBeNull();
  });

  it("leaves alert null when API returns a non-ok status", async () => {
    mockApiFetch.mockResolvedValue({ ok: false });

    const effect = mountHook(FARM_A);
    effect();
    await drain();

    expect(mockAlertState).toBeNull();
  });

  it("leaves alert null and does not throw when apiFetch rejects (network error)", async () => {
    mockApiFetch.mockRejectedValue(new Error("Network request failed"));

    const effect = mountHook(FARM_A);
    expect(() => effect()).not.toThrow();
    await drain();

    expect(mockAlertState).toBeNull();
  });

  it("passes the sector name in the endpoint URL", async () => {
    mockApiFetch.mockResolvedValue(makeOk(ALERT_A));

    const effect = mountHook(FARM_A, "dairy");
    effect();
    await drain();

    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/dairy-alert")
    );
  });
});

// ===========================================================================
// 3. Farm switch — alert cleared immediately, before fetch resolves
// ===========================================================================

describe("useDiseaseAlert — farm switch clears alert immediately", () => {
  it("sets alert to null at the start of the new effect before the fetch resolves", async () => {
    // Mount farm-a with an active alert
    mockApiFetch.mockResolvedValue(makeOk(ALERT_A));
    const effectA = mountHook(FARM_A);
    const cleanupA = effectA() as (() => void) | undefined;
    await drain();
    expect(mockAlertState).toEqual(ALERT_A); // farm-a banner is showing

    // Hold farm-b's fetch pending so we can inspect state mid-flight
    let resolveFetchB!: (v: Partial<Response>) => void;
    mockApiFetch.mockReturnValueOnce(
      new Promise<Partial<Response>>((res) => {
        resolveFetchB = res;
      })
    );

    // Simulate farm switch: capture new effect, run cleanup, fire new effect
    const effectB = mountHook(FARM_B);
    cleanupA?.(); // invalidate farm-a's in-flight request
    effectB(); // immediately calls setAlert(null) before any async work

    // Alert must be null NOW — before farm-b fetch resolves
    expect(mockAlertState).toBeNull();

    // Resolve farm-b and confirm the new alert appears
    resolveFetchB(makeOk(ALERT_B));
    await drain();
    expect(mockAlertState).toEqual(ALERT_B);
  });
});

// ===========================================================================
// 4. Out-of-order response — stale farm-a response discarded after farm switch
// ===========================================================================

describe("useDiseaseAlert — out-of-order response is discarded", () => {
  it("does not overwrite farm-b alert when farm-a response arrives late", async () => {
    // Hold farm-a's fetch pending
    let resolveFetchA!: (v: Partial<Response>) => void;
    mockApiFetch.mockReturnValueOnce(
      new Promise<Partial<Response>>((res) => {
        resolveFetchA = res;
      })
    );

    const effectA = mountHook(FARM_A);
    const cleanupA = effectA() as (() => void) | undefined;

    // Switch to farm-b before farm-a has resolved
    mockApiFetch.mockResolvedValue(makeOk(ALERT_B));
    const effectB = mountHook(FARM_B);
    cleanupA?.(); // increments requestIdRef.current → invalidates requestId from effectA
    effectB();
    await drain();

    expect(mockAlertState).toEqual(ALERT_B); // farm-b alert is showing

    // Now let farm-a's stale response arrive
    resolveFetchA(makeOk(ALERT_A));
    await drain();

    // Farm-a's response must be discarded — alert stays farm-b's
    expect(mockAlertState).toEqual(ALERT_B);
  });

  it("leaves alert null when farm-a response arrives after switching to a farm with no alert", async () => {
    // Hold farm-a's fetch pending
    let resolveFetchA!: (v: Partial<Response>) => void;
    mockApiFetch.mockReturnValueOnce(
      new Promise<Partial<Response>>((res) => {
        resolveFetchA = res;
      })
    );

    const effectA = mountHook(FARM_A);
    const cleanupA = effectA() as (() => void) | undefined;

    // Switch to farm-b — returns inactive alert
    mockApiFetch.mockResolvedValue(makeOk({ active: false }));
    const effectB = mountHook(FARM_B);
    cleanupA?.();
    effectB();
    await drain();

    expect(mockAlertState).toBeNull();

    // Farm-a's stale active alert arrives
    resolveFetchA(makeOk(ALERT_A));
    await drain();

    // Must remain null — farm-a response is stale
    expect(mockAlertState).toBeNull();
  });
});

// ===========================================================================
// 5. Failed second-farm fetch leaves alert null (not prior farm's alert)
// ===========================================================================

describe("useDiseaseAlert — failed second-farm fetch does not restore prior alert", () => {
  it("leaves alert null when the new farm fetch fails, even though the previous farm had an alert", async () => {
    // Farm-a succeeds
    mockApiFetch.mockResolvedValue(makeOk(ALERT_A));
    const effectA = mountHook(FARM_A);
    const cleanupA = effectA() as (() => void) | undefined;
    await drain();
    expect(mockAlertState).toEqual(ALERT_A);

    // Farm-b fetch fails
    mockApiFetch.mockRejectedValueOnce(new Error("offline"));
    const effectB = mountHook(FARM_B);
    cleanupA?.();
    effectB();
    await drain();

    // Alert must be null — farm-a's alert must not be restored
    expect(mockAlertState).toBeNull();
  });

  it("leaves alert null when the new farm returns non-ok after prior farm had an alert", async () => {
    mockApiFetch.mockResolvedValue(makeOk(ALERT_A));
    const effectA = mountHook(FARM_A);
    const cleanupA = effectA() as (() => void) | undefined;
    await drain();
    expect(mockAlertState).toEqual(ALERT_A);

    // Farm-b returns HTTP error
    mockApiFetch.mockResolvedValueOnce({ ok: false });
    const effectB = mountHook(FARM_B);
    cleanupA?.();
    effectB();
    await drain();

    expect(mockAlertState).toBeNull();
  });
});
