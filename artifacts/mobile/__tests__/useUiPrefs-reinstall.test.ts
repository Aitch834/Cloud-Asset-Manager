/**
 * Tests confirming that CPH/SBI banner dismissals survive app reinstall.
 *
 * The dismissal is server-synced via useUiPrefs, so on reinstall (empty
 * AsyncStorage) the server GET provides the persisted preference and the
 * banner stays hidden once prefs sync completes.
 *
 * Covers:
 *  1. runUiPrefMigration — absent / promoted / retry result codes
 *  2. Bootstrap: empty cache + server prefs → dismissed flag set correctly
 *  3. prefsReady / migrationChecked ordering: no banner flicker during load
 *  4. dismissed formula: conservative-hide while migration or prefs pending
 *
 * Architecture note
 * -----------------
 * We avoid @testing-library/react-native (which pulls in ESM Expo modules that
 * crash the Node Jest environment) and instead drive hooks by mocking React's
 * useState / useEffect / useRef / useCallback to run synchronously and capture
 * state updates directly — the same pattern used in buildCachedApiHook.test.ts.
 *
 * Module-level singletons (singletons Map, migratedSigs Set) persist for the
 * whole test run, so every test uses a unique userId (via nextUid()) to avoid
 * cross-test interference.
 */

// ---------------------------------------------------------------------------
// AsyncStorage mock — in-memory map, all ops awaitable
// ---------------------------------------------------------------------------

const asyncStore = new Map<string, string>();

const mockGetItem = jest.fn(async (key: string) => asyncStore.get(key) ?? null);
const mockSetItem = jest.fn(async (key: string, value: string) => {
  asyncStore.set(key, value);
});
const mockRemoveItem = jest.fn(async (key: string) => {
  asyncStore.delete(key);
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: (...args: [string]) => mockGetItem(...args),
    setItem: (...args: [string, string]) => mockSetItem(...args),
    removeItem: (...args: [string]) => mockRemoveItem(...args),
  },
}));

// ---------------------------------------------------------------------------
// apiFetch mock
// ---------------------------------------------------------------------------

type PrefsMap = Record<string, boolean>;
const mockApiFetch = jest.fn<Promise<Partial<Response>>, [string, RequestInit?]>();

jest.mock("@/lib/apiFetch", () => ({
  apiFetch: (...args: [string, RequestInit?]) => mockApiFetch(...args),
}));

// ---------------------------------------------------------------------------
// React mock — synchronous useState / useEffect / useRef / useCallback
//
// mockEffects holds every useEffect callback in call order.
// mockSlots holds the current value for each useState slot.
// mockSlotIdx tracks which slot the next useState call maps to.
//
// All names are prefixed with "mock" so jest.mock() factories can reference
// them (Jest allows mock-prefixed variable access inside factory functions).
// ---------------------------------------------------------------------------

const mockEffects: Array<() => unknown> = [];
let mockSlotIdx = 0;
const mockSlots: unknown[] = [];

/**
 * Called by the mocked useState setter.  Extracted here (outside the
 * jest.mock factory) so the factory never contains TypeScript type
 * annotations with named parameters — Babel's scope analyser treats those
 * as variable references and rejects them inside factory functions.
 */
function mockApplySetterValue(slotIndex: number, v: unknown): void {
  mockSlots[slotIndex] =
    typeof v === "function"
      ? (v as (...args: unknown[]) => unknown)(mockSlots[slotIndex])
      : v;
}

jest.mock("react", () => ({
  useState: (init: unknown) => {
    const i = mockSlotIdx++;
    if (mockSlots.length <= i) {
      mockSlots.push(
        typeof init === "function" ? (init as () => unknown)() : init,
      );
    }
    const setter = (v: unknown) => mockApplySetterValue(i, v);
    return [mockSlots[i], setter];
  },
  useEffect: (fn: () => unknown) => {
    mockEffects.push(fn);
  },
  useRef: (init: unknown) => ({ current: init }),
  useCallback: (fn: unknown) => fn,
}));

// ---------------------------------------------------------------------------
// Misc mocks required by transitive imports
// ---------------------------------------------------------------------------

jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
}));

// ---------------------------------------------------------------------------
// Imports under test (after all mocks are in place)
// ---------------------------------------------------------------------------

import {
  runUiPrefMigration,
  useUiPrefs,
} from "../lib/hooks/useUiPrefs";
import { useIdentifierBannerDismiss } from "../lib/hooks/useIdentifierBannerDismiss";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

async function drain(rounds = 10): Promise<void> {
  for (let i = 0; i < rounds; i++) await flushPromises();
}

let _uidCounter = 0;
/** Returns a unique user ID string so module-level singletons don't bleed between tests. */
const nextUid = () => `test-user-${++_uidCounter}`;

function makeServerResponse(uiPrefs: PrefsMap): Partial<Response> {
  return {
    ok: true,
    json: async () => ({ uiPrefs }),
  };
}

function makeLegacyValue(ageMs = 1000): string {
  return JSON.stringify({ ts: Date.now() - ageMs });
}

// ---------------------------------------------------------------------------
// Per-test setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  asyncStore.clear();

  mockEffects.length = 0;
  mockSlots.length = 0;
  mockSlotIdx = 0;

  // Default: server returns empty prefs so tests that don't set this won't hang.
  mockApiFetch.mockResolvedValue(makeServerResponse({}));
});

// ===========================================================================
// 1. runUiPrefMigration — absent path (no legacy key)
//    This is the typical reinstall path: the old app data was wiped, so there
//    is nothing to migrate.
// ===========================================================================

describe("runUiPrefMigration — absent (no legacy key)", () => {
  it('returns "absent" when AsyncStorage has no entry for the legacy key', async () => {
    const uid = nextUid();
    const result = await runUiPrefMigration(
      uid,
      "identifier-banner-dismissed-purchase-farm1",
      "identifier_banner_dismissed_purchase_farm1",
      () => true,
    );
    expect(result).toBe("absent");
  });

  it("does not touch AsyncStorage when there is nothing to migrate", async () => {
    const uid = nextUid();
    await runUiPrefMigration(uid, "legacy-key", "new-key", () => true);
    expect(mockSetItem).not.toHaveBeenCalled();
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it('returns "absent" and cleans up an expired legacy entry without promoting it', async () => {
    const uid = nextUid();
    const thirtyOneDays = 31 * 24 * 60 * 60 * 1000;
    asyncStore.set("legacy-key", JSON.stringify({ ts: Date.now() - thirtyOneDays }));

    const result = await runUiPrefMigration(
      uid,
      "legacy-key",
      "new-key",
      (raw) => {
        try {
          const p = JSON.parse(raw) as { ts: number };
          return Date.now() - p.ts <= 30 * 24 * 60 * 60 * 1000;
        } catch {
          return false;
        }
      },
    );

    expect(result).toBe("absent");
    // Best-effort cleanup of the expired key should have run.
    expect(mockRemoveItem).toHaveBeenCalledWith("legacy-key");
    // No new key should have been written.
    expect(mockSetItem).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// 2. runUiPrefMigration — promoted path (existing device; legacy data present)
//    Grower had previously dismissed the banner on the OLD storage format.
//    The migration must lift the dismissal into the new server-synced format.
// ===========================================================================

describe("runUiPrefMigration — promoted (valid legacy entry found)", () => {
  const LEGACY_KEY = "identifier-banner-dismissed-purchase-farm1";
  const NEW_KEY = "identifier_banner_dismissed_purchase_farm1";

  function isValid(raw: string): boolean {
    try {
      const p = JSON.parse(raw) as { ts: number };
      return typeof p.ts === "number" && Date.now() - p.ts <= 30 * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }

  beforeEach(() => {
    asyncStore.set(LEGACY_KEY, makeLegacyValue());
  });

  it('returns "promoted"', async () => {
    const uid = nextUid();
    const result = await runUiPrefMigration(uid, LEGACY_KEY, NEW_KEY, isValid);
    expect(result).toBe("promoted");
  });

  it("writes the new key (= true) to the per-user cache in AsyncStorage", async () => {
    const uid = nextUid();
    await runUiPrefMigration(uid, LEGACY_KEY, NEW_KEY, isValid);

    const cacheJson = asyncStore.get(`ui_prefs_cache_${uid}`);
    expect(cacheJson).toBeDefined();
    const cache = JSON.parse(cacheJson!) as PrefsMap;
    expect(cache[NEW_KEY]).toBe(true);
  });

  it("adds the new key to the pending queue so it flushes to the server on reconnect", async () => {
    const uid = nextUid();
    await runUiPrefMigration(uid, LEGACY_KEY, NEW_KEY, isValid);

    const pendingJson = asyncStore.get(`ui_prefs_pending_${uid}`);
    expect(pendingJson).toBeDefined();
    const pending = JSON.parse(pendingJson!) as PrefsMap;
    expect(pending[NEW_KEY]).toBe(true);
  });

  it("removes the legacy key from AsyncStorage after both durable writes succeed", async () => {
    const uid = nextUid();
    await runUiPrefMigration(uid, LEGACY_KEY, NEW_KEY, isValid);

    expect(mockRemoveItem).toHaveBeenCalledWith(LEGACY_KEY);
    // And the legacy key is gone from the store.
    expect(asyncStore.has(LEGACY_KEY)).toBe(false);
  });
});

// ===========================================================================
// 3. runUiPrefMigration — retry path (storage write fails)
//    If AsyncStorage is unavailable (e.g. device under heavy load), the
//    legacy key must be retained so the migration can re-run next time.
// ===========================================================================

describe("runUiPrefMigration — retry (durable write fails)", () => {
  it('returns "retry" when setItem throws, and retains the legacy key', async () => {
    const uid = nextUid();
    asyncStore.set("legacy-key", makeLegacyValue());
    mockSetItem.mockRejectedValueOnce(new Error("QuotaExceededError"));

    const result = await runUiPrefMigration(uid, "legacy-key", "new-key", () => true);

    expect(result).toBe("retry");
    // Legacy key must still be there so the next mount can retry.
    expect(asyncStore.has("legacy-key")).toBe(true);
  });
});

// ===========================================================================
// 4. useUiPrefs bootstrap — reinstall scenario
//    AsyncStorage is empty (app data cleared by reinstall).
//    Server returns a previously-dismissed pref.
//    After the bootstrap effect runs, prefsReady must be true and the
//    dismissed pref must be reflected in the in-memory state.
//
// Hook slot layout (useUiPrefs called with a userId):
//   slot[0]  = prefs (PrefsMap)
//   slot[1]  = prefsReady (boolean)
//
// Effect layout:
//   mockEffects[0] = mounted tracking
//   mockEffects[1] = singleton subscription
//   mockEffects[2] = bootstrap (runLoad)
// ===========================================================================

describe("useUiPrefs — bootstrap on fresh install (empty AsyncStorage)", () => {
  const PREF_KEY = "identifier_banner_dismissed_purchase_farm1";

  it("sets prefsReady=true after server responds with prefs", async () => {
    const uid = nextUid();
    mockApiFetch.mockResolvedValue(makeServerResponse({ [PREF_KEY]: true }));

    useUiPrefs(uid);
    // Fire only the bootstrap effect (index 2); mount and subscription don't matter here.
    mockEffects[2]?.();
    await drain();

    expect(mockSlots[1]).toBe(true); // prefsReady
  });

  it("populates prefs with the dismissed key returned by the server", async () => {
    const uid = nextUid();
    mockApiFetch.mockResolvedValue(makeServerResponse({ [PREF_KEY]: true }));

    useUiPrefs(uid);
    mockEffects[2]?.();
    await drain();

    const prefs = mockSlots[0] as PrefsMap;
    expect(prefs[PREF_KEY]).toBe(true);
  });

  it("does NOT set prefsReady=true before the server responds (no premature ready)", async () => {
    const uid = nextUid();
    // Server response is delayed — we'll check state before draining.
    let resolveServer!: (v: Partial<Response>) => void;
    mockApiFetch.mockReturnValue(
      new Promise<Partial<Response>>((res) => { resolveServer = res; }),
    );

    useUiPrefs(uid);
    mockEffects[2]?.();

    // Drain only microtasks (cache load), NOT the server fetch.
    await flushPromises();

    // prefsReady must still be false — empty cache + server not yet responded.
    expect(mockSlots[1]).toBe(false);

    // Now let the server respond and fully drain.
    resolveServer(makeServerResponse({ [PREF_KEY]: true }));
    await drain();

    expect(mockSlots[1]).toBe(true);
  });

  it("still reaches prefsReady=true if the server is unreachable (offline fallback)", async () => {
    const uid = nextUid();
    mockApiFetch.mockRejectedValue(new Error("Network request failed"));

    useUiPrefs(uid);
    mockEffects[2]?.();
    await drain();

    // prefsReady must become true so the UI doesn't hang forever offline.
    expect(mockSlots[1]).toBe(true);
  });

  it("reaches prefsReady=true immediately when returning user has a cached pref", async () => {
    const uid = nextUid();
    // Pre-populate cache (simulates returning user, not fresh install).
    asyncStore.set(
      `ui_prefs_cache_${uid}`,
      JSON.stringify({ [PREF_KEY]: true }),
    );

    // Server response can be delayed — prefsReady should come from cache first.
    let resolveServer!: (v: Partial<Response>) => void;
    mockApiFetch.mockReturnValue(
      new Promise<Partial<Response>>((res) => { resolveServer = res; }),
    );

    useUiPrefs(uid);
    mockEffects[2]?.();

    // Drain cache load.
    await drain(4);

    // Cache exists → prefsReady must already be true.
    expect(mockSlots[1]).toBe(true);
    const prefs = mockSlots[0] as PrefsMap;
    expect(prefs[PREF_KEY]).toBe(true);

    resolveServer(makeServerResponse({ [PREF_KEY]: true }));
    await drain();
  });
});

// ===========================================================================
// 5. dismissed formula — useIdentifierBannerDismiss return value
//
// The dismissed flag must be true in EVERY state where showing the banner
// would be premature or incorrect:
//
//   dismissed = !migrationChecked || (prefsReady && isHintDismissed(key))
//
// Hook slot layout (useUiPrefs is called inside useIdentifierBannerDismiss):
//   slot[0]  = prefs          (from useUiPrefs)
//   slot[1]  = prefsReady     (from useUiPrefs)
//   slot[2]  = migrationEpoch (from useIdentifierBannerDismiss)
//
// Effect layout:
//   mockEffects[0] = mounted tracking    (from useUiPrefs)
//   mockEffects[1] = subscription        (from useUiPrefs)
//   mockEffects[2] = bootstrap           (from useUiPrefs)
//   mockEffects[3] = migration check     (from useIdentifierBannerDismiss)
// ===========================================================================

describe("useIdentifierBannerDismiss — dismissed formula", () => {
  const SCREEN = "purchase";
  const FARM_ID = "farm-42";
  const PREF_KEY = `identifier_banner_dismissed_${SCREEN}_${FARM_ID}`;

  describe("conservative hide while migration is pending (migrationChecked = false)", () => {
    it("returns dismissed=true on the initial render before migration completes", () => {
      const uid = nextUid();
      // Server is slow — never responds in this test.
      mockApiFetch.mockReturnValue(new Promise(() => { /* never resolves */ }));

      const { dismissed } = useIdentifierBannerDismiss(SCREEN, FARM_ID, uid);

      // migrationChecked is false (no entry in migratedSigs yet) → conservatively hidden.
      expect(dismissed).toBe(true);
    });
  });

  describe("after migration completes with no legacy key (absent) and server provides dismissed pref", () => {
    it("returns dismissed=true once prefs sync delivers the dismissed key", async () => {
      const uid = nextUid();
      mockApiFetch.mockResolvedValue(makeServerResponse({ [PREF_KEY]: true }));

      useIdentifierBannerDismiss(SCREEN, FARM_ID, uid);

      // Run bootstrap + migration effects.
      mockEffects[2]?.(); // bootstrap
      mockEffects[3]?.(); // migration
      await drain();

      // Re-render: reset slot index, reuse updated mockSlots.
      mockSlotIdx = 0;
      const { dismissed } = useIdentifierBannerDismiss(SCREEN, FARM_ID, uid);

      // Both conditions now met: migrationChecked=true, prefsReady=true, key in prefs.
      expect(dismissed).toBe(true);
    });

    it("does NOT return dismissed=true when the server returns no dismissed pref", async () => {
      const uid = nextUid();
      // Server has no record of the dismissal (user never dismissed).
      mockApiFetch.mockResolvedValue(makeServerResponse({}));

      useIdentifierBannerDismiss(SCREEN, FARM_ID, uid);

      mockEffects[2]?.(); // bootstrap
      mockEffects[3]?.(); // migration
      await drain();

      mockSlotIdx = 0;
      const { dismissed } = useIdentifierBannerDismiss(SCREEN, FARM_ID, uid);

      // migrationChecked=true, prefsReady=true, key NOT in prefs → banner should show.
      expect(dismissed).toBe(false);
    });
  });

  describe("dismissed=true is maintained across the full reinstall flow", () => {
    it("is never false between initial render and sync completion when server has dismissed pref", async () => {
      const uid = nextUid();
      let resolveServer!: (v: Partial<Response>) => void;
      mockApiFetch.mockReturnValue(
        new Promise<Partial<Response>>((res) => { resolveServer = res; }),
      );

      // T=0: initial render — migration not yet checked.
      const initial = useIdentifierBannerDismiss(SCREEN, FARM_ID, uid);
      expect(initial.dismissed).toBe(true); // conservative hide ✓

      // Fire bootstrap + migration effects.
      mockEffects[2]?.();
      mockEffects[3]?.();

      // T=1: partial drain (cache load complete, server still in-flight).
      await drain(4);

      // Re-render to read updated state.
      mockSlotIdx = 0;
      const midFlight = useIdentifierBannerDismiss(SCREEN, FARM_ID, uid);

      // Migration awaits the bootstrap fetchPromise. Since the server hasn't
      // responded yet, the migration sig has NOT been added to migratedSigs —
      // dismissed remains conservatively true.
      expect(midFlight.dismissed).toBe(true); // still conservative ✓

      // T=2: server responds with dismissed pref.
      resolveServer(makeServerResponse({ [PREF_KEY]: true }));
      await drain();

      // Re-render to see final state.
      mockSlotIdx = 0;
      const final = useIdentifierBannerDismiss(SCREEN, FARM_ID, uid);

      expect(final.dismissed).toBe(true); // dismissed via server pref ✓
    });
  });

  describe("when userId is null (logged out)", () => {
    it("returns dismissed=false so the banner is shown to unauthenticated users", () => {
      // userId null → sig is null → migrationChecked=true, prefsReady=false (default).
      // dismissed = !true || (false && false) = false.
      const { dismissed } = useIdentifierBannerDismiss(SCREEN, FARM_ID, null);
      expect(dismissed).toBe(false);
    });
  });
});

// ===========================================================================
// 6. Ordering guarantee: migration waits for bootstrap (prefsReady first)
//    runUiPrefMigration awaits s.fetchPromise before writing, which ensures
//    migrationChecked transitions to true ONLY after prefsReady is already
//    true.  This eliminates the flicker window where migrationChecked=true
//    but prefsReady=false would leave dismissed=false momentarily.
// ===========================================================================

describe("runUiPrefMigration ordering — waits for in-flight bootstrap to settle", () => {
  it("awaits an active fetchPromise before reading the legacy key", async () => {
    const uid = nextUid();
    let resolveBootstrap!: (v: Partial<Response>) => void;

    // Stall the bootstrap fetch so we can interleave a migration call.
    mockApiFetch.mockReturnValue(
      new Promise<Partial<Response>>((res) => { resolveBootstrap = res; }),
    );

    // Kick off bootstrap (sets s.fetchPromise on the singleton).
    useUiPrefs(uid);
    mockEffects[2]?.();

    // Start migration — it will await the fetchPromise.
    const migrationPromise = runUiPrefMigration(
      uid,
      "absent-legacy-key",
      "new-key",
      () => true,
    );

    // Drain partially — server still stalled, so migration should not have
    // read the legacy key yet.
    await drain(4);
    // Migration is still pending (awaiting fetchPromise).
    expect(mockGetItem).not.toHaveBeenCalledWith("absent-legacy-key");

    // Unblock the server → bootstrap finishes → migration can proceed.
    resolveBootstrap(makeServerResponse({}));
    const result = await migrationPromise;
    await drain();

    // Legacy key was absent → "absent" result.
    expect(result).toBe("absent");
    // Now migration reads the legacy key (confirmed absent).
    expect(mockGetItem).toHaveBeenCalledWith("absent-legacy-key");
  });
});
