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
let mockAppState = "active";
let mockAppStateChange: ((state: string) => void) | null = null;
const mockAppStateRemove = jest.fn();

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

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
  AppState: {
    get currentState() { return mockAppState; },
    addEventListener: jest.fn((_event: string, listener: (state: string) => void) => {
      mockAppStateChange = listener;
      return { remove: mockAppStateRemove };
    }),
  },
}));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
}));

// ---------------------------------------------------------------------------
// Imports under test (after all mocks are in place)
// ---------------------------------------------------------------------------

import {
  runUiPrefBatchMigration,
  runUiPrefMigration,
  useUiPrefs,
} from "../lib/hooks/useUiPrefs";
import {
  identifierBannerPrefKey,
  useIdentifierBannerDismiss,
} from "../lib/hooks/useIdentifierBannerDismiss";

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
  mockAppState = "active";
  mockAppStateChange = null;

  // Default: server returns empty prefs so tests that don't set this won't hang.
  mockApiFetch.mockResolvedValue(makeServerResponse({}));
});

describe("useUiPrefs — foreground retry of queued dismissals", () => {
  function mountForegroundListener(uid: string): void {
    useUiPrefs(uid);
    // The mounted-state effect also owns the AppState listener.
    mockEffects[0]?.();
  }

  it("PATCHes queued dismissals when the app returns to active", async () => {
    const uid = nextUid();
    asyncStore.set(`ui_prefs_pending_${uid}`, JSON.stringify({ offline_banner: true }));
    mountForegroundListener(uid);

    mockAppStateChange?.("background");
    mockAppStateChange?.("active");
    await drain();

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/account/ui-prefs",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ offline_banner: true }),
      }),
    );
    expect(asyncStore.has(`ui_prefs_pending_${uid}`)).toBe(false);
  });

  it("preserves the pending queue when the foreground PATCH fails", async () => {
    const uid = nextUid();
    asyncStore.set(`ui_prefs_pending_${uid}`, JSON.stringify({ offline_banner: true }));
    mockApiFetch.mockResolvedValue({ ok: false });
    mountForegroundListener(uid);

    mockAppStateChange?.("inactive");
    mockAppStateChange?.("active");
    await drain();

    expect(JSON.parse(asyncStore.get(`ui_prefs_pending_${uid}`)!)).toEqual({
      offline_banner: true,
    });
  });

  it("removes only the snapshot sent by the successful foreground attempt", async () => {
    const uid = nextUid();
    const pendingKey = `ui_prefs_pending_${uid}`;
    asyncStore.set(pendingKey, JSON.stringify({ sent_banner: true }));
    let resolvePatch!: (response: Partial<Response>) => void;
    mockApiFetch.mockImplementation((_url, opts) => {
      if (opts?.method === "PATCH") {
        return new Promise((resolve) => { resolvePatch = resolve; });
      }
      return Promise.resolve(makeServerResponse({}));
    });
    mountForegroundListener(uid);

    mockAppStateChange?.("background");
    mockAppStateChange?.("active");
    await drain(4);
    asyncStore.set(
      pendingKey,
      JSON.stringify({ sent_banner: true, newer_banner: true }),
    );
    resolvePatch({ ok: true });
    await drain();

    expect(JSON.parse(asyncStore.get(pendingKey)!)).toEqual({
      newer_banner: true,
    });
  });

  it("finishes an older foreground retry before sending a newer false value", async () => {
    const uid = nextUid();
    const key = "offline_banner";
    asyncStore.set(`ui_prefs_pending_${uid}`, JSON.stringify({ [key]: true }));
    const patchBodies: PrefsMap[] = [];
    let resolveForegroundPatch!: (response: Partial<Response>) => void;
    mockApiFetch.mockImplementation((_url, opts) => {
      if (opts?.method !== "PATCH") return Promise.resolve(makeServerResponse({}));
      patchBodies.push(JSON.parse(opts.body as string) as PrefsMap);
      if (patchBodies.length === 1) {
        return new Promise((resolve) => { resolveForegroundPatch = resolve; });
      }
      return Promise.resolve({ ok: true });
    });

    const { setPref } = useUiPrefs(uid);
    mockEffects[0]?.();
    mockAppStateChange?.("background");
    mockAppStateChange?.("active");
    await drain(4);

    setPref(key, false);
    await drain(4);
    // The newer PATCH must wait; otherwise the delayed true retry could finish
    // last and overwrite false on the server.
    expect(patchBodies).toEqual([{ [key]: true }]);

    resolveForegroundPatch({ ok: true });
    await drain();
    expect(patchBodies).toEqual([{ [key]: true }, { [key]: false }]);
    expect(asyncStore.has(`ui_prefs_pending_${uid}`)).toBe(false);
  });
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
// 7. dismissHint — write-side durability
//
// The three scenarios below cover what actually happens when a grower taps
// "Dismiss" on the banner:
//
//   a. Cache + pending queue are written BEFORE the PATCH completes so a
//      crash or network failure immediately after the tap doesn't lose the
//      dismissal.
//   b. A failed PATCH leaves the pending entry intact so it is retried the
//      next time the grower has connectivity.
//   c. After a successful dismissal, a fresh app load reads the cache without
//      waiting for a server round-trip — the banner stays hidden instantly.
// ===========================================================================

describe("dismissHint — cache and pending queue updated before PATCH completes", () => {
  /**
   * Helper: returns a mockApiFetch implementation where GET resolves
   * immediately with `getPrefs` and PATCH never resolves (stalled forever),
   * so we can inspect AsyncStorage state before the network responds.
   */
  function makeStalledPatchFetch(getPrefs: PrefsMap = {}) {
    return (url: string, opts?: RequestInit): Promise<Partial<Response>> => {
      if (!opts?.method || (opts.method as string).toUpperCase() !== "PATCH") {
        return Promise.resolve(makeServerResponse(getPrefs));
      }
      // Stall the PATCH forever so we can inspect storage in-between.
      return new Promise(() => { /* never resolves */ });
    };
  }

  it("writes the dismissed key to the AsyncStorage cache before PATCH completes", async () => {
    const uid = nextUid();
    mockApiFetch.mockImplementation(makeStalledPatchFetch());

    const { dismissHint } = useUiPrefs(uid);
    mockEffects[2]?.(); // bootstrap
    await drain();

    dismissHint("winery_winegb_banner");
    // Drain microtasks for the enqueueWrite cache/pending slot, not the PATCH.
    await drain(4);

    const cacheJson = asyncStore.get(`ui_prefs_cache_${uid}`);
    expect(cacheJson).toBeDefined();
    const cache = JSON.parse(cacheJson!) as PrefsMap;
    expect(cache["winery_winegb_banner"]).toBe(true);
  });

  it("writes the dismissed key to the AsyncStorage pending queue before PATCH completes", async () => {
    const uid = nextUid();
    mockApiFetch.mockImplementation(makeStalledPatchFetch());

    const { dismissHint } = useUiPrefs(uid);
    mockEffects[2]?.(); // bootstrap
    await drain();

    dismissHint("winery_winegb_banner");
    await drain(4);

    const pendingJson = asyncStore.get(`ui_prefs_pending_${uid}`);
    expect(pendingJson).toBeDefined();
    const pending = JSON.parse(pendingJson!) as PrefsMap;
    expect(pending["winery_winegb_banner"]).toBe(true);
  });
});

describe("dismissHint — failed PATCH retains pending entry for next flush attempt", () => {
  it("keeps the key in the pending queue when the server returns a non-ok response", async () => {
    const uid = nextUid();
    mockApiFetch.mockImplementation(
      (url: string, opts?: RequestInit): Promise<Partial<Response>> => {
        if (!opts?.method || (opts.method as string).toUpperCase() !== "PATCH") {
          return Promise.resolve(makeServerResponse({}));
        }
        // PATCH fails (e.g. server error, network timeout handled by the catch).
        return Promise.resolve({ ok: false } as Partial<Response>);
      },
    );

    const { dismissHint } = useUiPrefs(uid);
    mockEffects[2]?.(); // bootstrap
    await drain();

    dismissHint("winery_winegb_banner");
    await drain(); // let the full PATCH attempt complete

    // Pending queue must still contain the key so it is retried on the next
    // successful write (reconnect-flush pattern).
    const pendingJson = asyncStore.get(`ui_prefs_pending_${uid}`);
    expect(pendingJson).toBeDefined();
    const pending = JSON.parse(pendingJson!) as PrefsMap;
    expect(pending["winery_winegb_banner"]).toBe(true);
  });

  it("clears the key from the pending queue only after a successful PATCH", async () => {
    const uid = nextUid();
    mockApiFetch.mockImplementation(
      (url: string, opts?: RequestInit): Promise<Partial<Response>> => {
        if (!opts?.method || (opts.method as string).toUpperCase() !== "PATCH") {
          return Promise.resolve(makeServerResponse({}));
        }
        return Promise.resolve({ ok: true } as Partial<Response>);
      },
    );

    const { dismissHint } = useUiPrefs(uid);
    mockEffects[2]?.(); // bootstrap
    await drain();

    dismissHint("winery_winegb_banner");
    await drain();

    // Pending queue must now be empty — the key has been flushed to the server.
    const pendingJson = asyncStore.get(`ui_prefs_pending_${uid}`);
    // Either the key is absent from the store (removed) or the entry is empty.
    if (pendingJson !== undefined) {
      const pending = JSON.parse(pendingJson) as PrefsMap;
      expect(pending["winery_winegb_banner"]).toBeUndefined();
    }
    // Cache must still hold the dismissed key.
    const cacheJson = asyncStore.get(`ui_prefs_cache_${uid}`);
    expect(cacheJson).toBeDefined();
    const cache = JSON.parse(cacheJson!) as PrefsMap;
    expect(cache["winery_winegb_banner"]).toBe(true);
  });
});

describe("dismissHint — fresh app load after dismissal confirms dismissed=true from cache (no server wait)", () => {
  it("shows the pref as dismissed immediately from cache before the server responds", async () => {
    const uid = nextUid();
    // Pre-populate cache — this is the state left behind by a prior
    // successful dismissHint (cache written first, then PATCH confirmed).
    asyncStore.set(
      `ui_prefs_cache_${uid}`,
      JSON.stringify({ winery_winegb_banner: true }),
    );

    // Server responds slowly (simulates slow network on app restart).
    let resolveServer!: (v: Partial<Response>) => void;
    mockApiFetch.mockReturnValue(
      new Promise<Partial<Response>>((res) => { resolveServer = res; }),
    );

    useUiPrefs(uid);
    mockEffects[2]?.(); // bootstrap effect

    // Drain just the cache load (fast, synchronous I/O path); server is still in-flight.
    await drain(4);

    // prefsReady must be true already — returned user path, cache hit.
    expect(mockSlots[1]).toBe(true);
    // The dismissed key must be in prefs without having waited for the server.
    const prefs = mockSlots[0] as PrefsMap;
    expect(prefs["winery_winegb_banner"]).toBe(true);

    // Clean up: let the server respond so the bootstrap can finish normally.
    resolveServer(makeServerResponse({ winery_winegb_banner: true }));
    await drain();
  });

  it("does not need a server response to know the banner is dismissed (apiFetch GET may still be pending)", async () => {
    const uid = nextUid();
    asyncStore.set(
      `ui_prefs_cache_${uid}`,
      JSON.stringify({ winery_winegb_banner: true }),
    );

    // Stall the server indefinitely.
    mockApiFetch.mockReturnValue(new Promise(() => { /* never resolves */ }));

    useUiPrefs(uid);
    mockEffects[2]?.();
    await drain(4);

    // Even with the server permanently unreachable, the cache provides the answer.
    expect(mockSlots[1]).toBe(true);
    const prefs = mockSlots[0] as PrefsMap;
    expect(prefs["winery_winegb_banner"]).toBe(true);
  });
});

describe("scanning identifier warnings — restart persistence and farm isolation", () => {
  for (const screen of ["sheep-scanning", "goat-scanning"]) {
    it(`${screen} stays dismissed after restart for the same farm`, async () => {
      const uid = nextUid();
      const dismissedFarm = "farm-with-dismissal";
      const dismissedKey = identifierBannerPrefKey(screen, dismissedFarm);

      // This cache is the durable state read on a fresh native app launch.
      asyncStore.set(
        `ui_prefs_cache_${uid}`,
        JSON.stringify({ [dismissedKey]: true }),
      );
      mockApiFetch.mockResolvedValue(
        makeServerResponse({ [dismissedKey]: true }),
      );

      useIdentifierBannerDismiss(screen, dismissedFarm, uid);
      mockEffects[2]?.(); // bootstrap
      mockEffects[3]?.(); // legacy migration
      await drain();

      mockSlotIdx = 0;
      expect(
        useIdentifierBannerDismiss(screen, dismissedFarm, uid).dismissed,
      ).toBe(true);
    });

    it(`${screen} uses an independent dismissal for each farm`, () => {
      expect(identifierBannerPrefKey(screen, "farm-a")).not.toBe(
        identifierBannerPrefKey(screen, "farm-b"),
      );
    });
  }
});

// ===========================================================================
// 5b. useUiPrefs bootstrap — reconnect flush
//     An offline dismissal is durable in the pending queue even when its
//     original PATCH failed.  A later successful bootstrap GET is the
//     reconnect signal that must flush that queue to the server.
// ===========================================================================

describe("useUiPrefs bootstrap — flushes offline pending dismissals", () => {
  const PREF_KEY = "winery_winegb_banner";

  function seedPending(uid: string): void {
    asyncStore.set(
      `ui_prefs_pending_${uid}`,
      JSON.stringify({ [PREF_KEY]: true }),
    );
  }

  function makeBootstrapFetch(patchOk: boolean) {
    return (_url: string, opts?: RequestInit): Promise<Partial<Response>> => {
      if ((opts?.method ?? "GET").toUpperCase() === "PATCH") {
        return Promise.resolve({ ok: patchOk } as Partial<Response>);
      }
      return Promise.resolve(makeServerResponse({}));
    };
  }

  it("flushes a pending offline dismissal after a successful bootstrap", async () => {
    const uid = nextUid();
    seedPending(uid);
    mockApiFetch.mockImplementation(makeBootstrapFetch(true));

    useUiPrefs(uid);
    mockEffects[2]?.(); // bootstrap effect
    await drain();

    // The pending queue is drained only after the bootstrap GET succeeds and
    // the reconnect PATCH is accepted.
    expect(asyncStore.has(`ui_prefs_pending_${uid}`)).toBe(false);

    const cacheJson = asyncStore.get(`ui_prefs_cache_${uid}`);
    expect(cacheJson).toBeDefined();
    const cache = JSON.parse(cacheJson!) as PrefsMap;
    expect(cache[PREF_KEY]).toBe(true);

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/account/ui-prefs",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ [PREF_KEY]: true }),
      }),
    );
  });

  it("preserves the pending dismissal when the bootstrap flush PATCH fails", async () => {
    const uid = nextUid();
    seedPending(uid);
    mockApiFetch.mockImplementation(makeBootstrapFetch(false));

    useUiPrefs(uid);
    mockEffects[2]?.(); // bootstrap effect
    await drain();

    const pendingJson = asyncStore.get(`ui_prefs_pending_${uid}`);
    expect(pendingJson).toBeDefined();
    const pending = JSON.parse(pendingJson!) as PrefsMap;
    expect(pending[PREF_KEY]).toBe(true);
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

describe("runUiPrefBatchMigration ordering — waits for in-flight bootstrap to settle", () => {
  it("awaits an active fetchPromise before reading the legacy key", async () => {
    const uid = nextUid();
    const legacyKey = "batch-legacy-key";
    const migratedKey = "batch-new-key";
    let resolveBootstrap!: (v: Partial<Response>) => void;

    asyncStore.set(legacyKey, JSON.stringify([migratedKey]));

    // Stall the bootstrap fetch so we can interleave a batch migration call.
    mockApiFetch.mockReturnValue(
      new Promise<Partial<Response>>((res) => { resolveBootstrap = res; }),
    );

    // Kick off bootstrap (sets s.fetchPromise on the singleton).
    useUiPrefs(uid);
    mockEffects[2]?.();

    // Start migration — it must await the fetchPromise before reading storage.
    const migrationPromise = runUiPrefBatchMigration(
      uid,
      legacyKey,
      (raw) => JSON.parse(raw) as string[],
    );

    // The server is still stalled, so the batch migration must not have read
    // the legacy key yet.
    await drain(4);
    expect(mockGetItem).not.toHaveBeenCalledWith(legacyKey);

    // Unblock bootstrap, then the migration can read and promote the entry.
    resolveBootstrap(makeServerResponse({}));
    const result = await migrationPromise;
    await drain();

    expect(result).toBe("promoted");
    expect(mockGetItem).toHaveBeenCalledWith(legacyKey);
  });
});

// ===========================================================================
// 7. runUiPrefBatchMigration — absent path
//    Missing key, malformed JSON, and an empty parsed list must all produce
//    "absent" without writing any new storage entries.
// ===========================================================================

describe("runUiPrefBatchMigration — absent (no legacy key or unparseable)", () => {
  it('returns "absent" when the legacy key does not exist in AsyncStorage', async () => {
    const uid = nextUid();
    const result = await runUiPrefBatchMigration(
      uid,
      "winegb-multi-dismissed-farm1",
      (raw) => JSON.parse(raw) as string[],
    );
    expect(result).toBe("absent");
  });

  it("does not write to AsyncStorage when there is nothing to migrate", async () => {
    const uid = nextUid();
    await runUiPrefBatchMigration(
      uid,
      "winegb-multi-dismissed-farm1",
      (raw) => JSON.parse(raw) as string[],
    );
    expect(mockSetItem).not.toHaveBeenCalled();
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it('returns "absent" and cleans up when parseKeys throws (malformed JSON)', async () => {
    const uid = nextUid();
    asyncStore.set("winegb-multi-dismissed-farm1", "NOT_VALID_JSON{{{");

    const result = await runUiPrefBatchMigration(
      uid,
      "winegb-multi-dismissed-farm1",
      (raw) => JSON.parse(raw) as string[],
    );

    expect(result).toBe("absent");
    // Best-effort cleanup of the malformed key should have run.
    expect(mockRemoveItem).toHaveBeenCalledWith("winegb-multi-dismissed-farm1");
    // No new pref keys should have been written.
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it('returns "absent" and cleans up when parseKeys returns an empty array', async () => {
    const uid = nextUid();
    asyncStore.set("winegb-multi-dismissed-farm1", "[]");

    const result = await runUiPrefBatchMigration(
      uid,
      "winegb-multi-dismissed-farm1",
      (raw) => JSON.parse(raw) as string[],
    );

    expect(result).toBe("absent");
    expect(mockRemoveItem).toHaveBeenCalledWith("winegb-multi-dismissed-farm1");
    expect(mockSetItem).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// 8. runUiPrefBatchMigration — promoted path
//    The legacy entry holds multiple screen identifiers.  Every one of them
//    must be written to both the cache and the pending queue, and the legacy
//    key must be removed — all before the function resolves.
// ===========================================================================

describe("runUiPrefBatchMigration — promoted (multiple keys in one legacy entry)", () => {
  const LEGACY_KEY = "winegb-multi-dismissed-farm42";
  // Simulates a legacy entry that encodes dismissals for three separate screens.
  const DISMISSED_SCREENS = [
    "winegb_banner_dismissed_excise_farm42",
    "winegb_banner_dismissed_membership_farm42",
    "winegb_banner_dismissed_harvest_farm42",
  ];

  function parseKeys(raw: string): string[] {
    return JSON.parse(raw) as string[];
  }

  beforeEach(() => {
    asyncStore.set(LEGACY_KEY, JSON.stringify(DISMISSED_SCREENS));
  });

  it('returns "promoted"', async () => {
    const uid = nextUid();
    const result = await runUiPrefBatchMigration(uid, LEGACY_KEY, parseKeys);
    expect(result).toBe("promoted");
  });

  it("writes every parsed key (= true) to the per-user cache", async () => {
    const uid = nextUid();
    await runUiPrefBatchMigration(uid, LEGACY_KEY, parseKeys);

    const cacheJson = asyncStore.get(`ui_prefs_cache_${uid}`);
    expect(cacheJson).toBeDefined();
    const cache = JSON.parse(cacheJson!) as PrefsMap;

    for (const key of DISMISSED_SCREENS) {
      expect(cache[key]).toBe(true);
    }
  });

  it("writes every parsed key (= true) to the pending queue", async () => {
    const uid = nextUid();
    await runUiPrefBatchMigration(uid, LEGACY_KEY, parseKeys);

    const pendingJson = asyncStore.get(`ui_prefs_pending_${uid}`);
    expect(pendingJson).toBeDefined();
    const pending = JSON.parse(pendingJson!) as PrefsMap;

    for (const key of DISMISSED_SCREENS) {
      expect(pending[key]).toBe(true);
    }
  });

  it("removes the legacy key after both durable writes succeed", async () => {
    const uid = nextUid();
    await runUiPrefBatchMigration(uid, LEGACY_KEY, parseKeys);

    expect(mockRemoveItem).toHaveBeenCalledWith(LEGACY_KEY);
    expect(asyncStore.has(LEGACY_KEY)).toBe(false);
  });

  it("does not write any extra keys beyond those returned by parseKeys", async () => {
    const uid = nextUid();
    await runUiPrefBatchMigration(uid, LEGACY_KEY, parseKeys);

    const cacheJson = asyncStore.get(`ui_prefs_cache_${uid}`);
    const cache = JSON.parse(cacheJson!) as PrefsMap;
    const writtenKeys = Object.keys(cache);

    // The cache should only contain exactly the keys from DISMISSED_SCREENS
    // (singleton starts empty for this fresh uid).
    expect(writtenKeys.sort()).toEqual([...DISMISSED_SCREENS].sort());
  });

  it("preserves pre-existing singleton prefs when merging new keys", async () => {
    const uid = nextUid();
    // Pre-populate the singleton with an unrelated dismissal.
    asyncStore.set(
      `ui_prefs_cache_${uid}`,
      JSON.stringify({ some_other_banner_dismissed: true }),
    );
    // Also put it in AsyncStorage pending so loadPending picks it up.
    asyncStore.set(
      `ui_prefs_pending_${uid}`,
      JSON.stringify({ some_other_banner_dismissed: true }),
    );

    await runUiPrefBatchMigration(uid, LEGACY_KEY, parseKeys);

    const cacheJson = asyncStore.get(`ui_prefs_cache_${uid}`);
    const cache = JSON.parse(cacheJson!) as PrefsMap;

    // All new keys written.
    for (const key of DISMISSED_SCREENS) {
      expect(cache[key]).toBe(true);
    }
    // Pre-existing key preserved in the pending queue.
    const pendingJson = asyncStore.get(`ui_prefs_pending_${uid}`);
    const pending = JSON.parse(pendingJson!) as PrefsMap;
    expect(pending["some_other_banner_dismissed"]).toBe(true);
  });
});

// ===========================================================================
// 9. runUiPrefBatchMigration — concurrent dismissal serialization
//     A dismissal can be queued while the migration is part-way through its
//     read-modify-write cycle.  Both entries must survive in the pending
//     queue so neither one is silently lost before the next server flush.
// ===========================================================================

describe("runUiPrefBatchMigration — preserves a concurrent dismissal", () => {
  it("keeps both the migrated keys and a racing dismissHint in the pending queue", async () => {
    const uid = nextUid();
    const legacyKey = "winegb-multi-dismissed-concurrent-farm";
    const migratedKey = "winegb_banner_dismissed_excise_concurrent";
    const dismissedKey = "winegb_banner_dismissed_live";
    const pendingKey = `ui_prefs_pending_${uid}`;
    let releasePendingRead!: () => void;
    const pendingReadGate = new Promise<void>((resolve) => {
      releasePendingRead = resolve;
    });
    let pendingReadCount = 0;
    let pendingReadStarted = false;

    asyncStore.set(legacyKey, JSON.stringify([migratedKey]));
    // Let both best-effort PATCHes settle, but keep their queue entries by
    // simulating an offline/non-ok response.
    mockApiFetch.mockResolvedValue({ ok: false });
    mockGetItem.mockImplementation(async (key: string) => {
      if (key === pendingKey && pendingReadCount++ === 0) {
        pendingReadStarted = true;
        await pendingReadGate;
      }
      return asyncStore.get(key) ?? null;
    });

    const { dismissHint } = useUiPrefs(uid);
    dismissHint(dismissedKey);

    // Hold the dismissal after its cache write and pending-queue read.  The
    // migration is now genuinely concurrent with that read-modify-write.
    await flushPromises();
    expect(pendingReadStarted).toBe(true);

    const migrationPromise = runUiPrefBatchMigration(
      uid,
      legacyKey,
      (raw) => JSON.parse(raw) as string[],
    );

    // With the queue, migration waits behind the gated dismissal.  Without
    // it, migration can write its own snapshot before the dismissal resumes.
    await drain(4);
    releasePendingRead();

    await migrationPromise;
    await drain();

    const pendingJson = asyncStore.get(pendingKey);
    expect(pendingJson).toBeDefined();
    const pending = JSON.parse(pendingJson!) as PrefsMap;
    expect(pending[migratedKey]).toBe(true);
    expect(pending[dismissedKey]).toBe(true);
  });

  it("keeps both the migrated key and a racing setPref update in the pending queue", async () => {
    const uid = nextUid();
    const legacyKey = "winegb-multi-dismissed-concurrent-pref-farm";
    const migratedKey = "winegb_banner_dismissed_excise_concurrent_pref";
    const preferenceKey = "field_register_show_archived";
    const pendingKey = `ui_prefs_pending_${uid}`;
    let releasePendingRead!: () => void;
    const pendingReadGate = new Promise<void>((resolve) => {
      releasePendingRead = resolve;
    });
    let pendingReadCount = 0;
    let pendingReadStarted = false;

    asyncStore.set(legacyKey, JSON.stringify([migratedKey]));
    // Failed PATCHes leave both writes in the durable pending queue.
    mockApiFetch.mockResolvedValue({ ok: false });
    mockGetItem.mockImplementation(async (key: string) => {
      if (key === pendingKey && pendingReadCount++ === 0) {
        pendingReadStarted = true;
        await pendingReadGate;
      }
      return asyncStore.get(key) ?? null;
    });

    const { setPref } = useUiPrefs(uid);
    setPref(preferenceKey, false);

    // Pause setPref inside its queued pending read, then start migration for
    // the same user so both operations overlap before either PATCH settles.
    await flushPromises();
    expect(pendingReadStarted).toBe(true);

    const migrationPromise = runUiPrefBatchMigration(
      uid,
      legacyKey,
      (raw) => JSON.parse(raw) as string[],
    );

    await drain(4);
    releasePendingRead();

    await migrationPromise;
    await drain();

    const pendingJson = asyncStore.get(pendingKey);
    expect(pendingJson).toBeDefined();
    const pending = JSON.parse(pendingJson!) as PrefsMap;
    expect(pending[migratedKey]).toBe(true);
    expect(pending[preferenceKey]).toBe(false);
  });
});

// ===========================================================================
// 10. runUiPrefBatchMigration — retry path
//    When a durable write fails (e.g. storage quota exceeded) the legacy key
//    must be retained so the migration can be retried on the next mount.
//    None of the new keys should be durably stored (the cache write is the
//    first durable operation and it throws before any removal).
// ===========================================================================

describe("runUiPrefBatchMigration — retry (durable write fails)", () => {
  const LEGACY_KEY = "winegb-multi-dismissed-farm99";
  const DISMISSED_SCREENS = [
    "winegb_banner_dismissed_excise_farm99",
    "winegb_banner_dismissed_membership_farm99",
  ];

  beforeEach(() => {
    asyncStore.set(LEGACY_KEY, JSON.stringify(DISMISSED_SCREENS));
  });

  it('returns "retry" when the cache setItem throws, and retains the legacy key', async () => {
    const uid = nextUid();
    mockSetItem.mockRejectedValueOnce(new Error("QuotaExceededError"));

    const result = await runUiPrefBatchMigration(
      uid,
      LEGACY_KEY,
      (raw) => JSON.parse(raw) as string[],
    );

    expect(result).toBe("retry");
    // Legacy key must still be in storage for the next attempt.
    expect(asyncStore.has(LEGACY_KEY)).toBe(true);
  });

  it("does not remove the legacy key when a write fails", async () => {
    const uid = nextUid();
    mockSetItem.mockRejectedValueOnce(new Error("QuotaExceededError"));

    await runUiPrefBatchMigration(
      uid,
      LEGACY_KEY,
      (raw) => JSON.parse(raw) as string[],
    );

    expect(mockRemoveItem).not.toHaveBeenCalledWith(LEGACY_KEY);
    expect(asyncStore.has(LEGACY_KEY)).toBe(true);
  });
});

// ===========================================================================
// 10. dismissHint — concurrent writes preserve every pending dismissal
//
// dismissHint's cache/pending read-modify-write runs in the per-user write
// queue, while the PATCH runs outside it.  These tests exercise both sides of
// that contract: concurrent durable writes must merge, and cleanup for an
// earlier PATCH must not delete a key added during its network request.
// ===========================================================================

describe("dismissHint — concurrent dismissals preserve pending queue entries", () => {
  function startHook(uid: string): void {
    useUiPrefs(uid);
    mockEffects[2]?.(); // bootstrap
  }

  it("keeps both keys in the pending queue when concurrent PATCHes fail", async () => {
    const uid = nextUid();
    mockApiFetch.mockImplementation(
      (url: string, opts?: RequestInit): Promise<Partial<Response>> => {
        if (!opts?.method || (opts.method as string).toUpperCase() !== "PATCH") {
          return Promise.resolve(makeServerResponse({}));
        }
        return Promise.resolve({ ok: false } as Partial<Response>);
      },
    );

    startHook(uid);
    await drain();

    const { dismissHint } = useUiPrefs(uid);
    // Deliberately do not await between these calls: this is the rapid
    // double-tap scenario the per-user write queue is intended to protect.
    dismissHint("first_concurrent_banner");
    dismissHint("second_concurrent_banner");
    await drain();

    const pendingJson = asyncStore.get(`ui_prefs_pending_${uid}`);
    expect(pendingJson).toBeDefined();
    const pending = JSON.parse(pendingJson!) as PrefsMap;
    expect(pending).toEqual({
      first_concurrent_banner: true,
      second_concurrent_banner: true,
    });
  });

  it("preserves a dismissal added while an earlier PATCH is in flight", async () => {
    const uid = nextUid();
    let resolveFirstPatch!: (response: Partial<Response>) => void;
    let firstPatchStarted!: () => void;
    const firstPatchStartedPromise = new Promise<void>((resolve) => {
      firstPatchStarted = resolve;
    });
    let patchCount = 0;

    mockApiFetch.mockImplementation(
      (url: string, opts?: RequestInit): Promise<Partial<Response>> => {
        if (!opts?.method || (opts.method as string).toUpperCase() !== "PATCH") {
          return Promise.resolve(makeServerResponse({}));
        }

        patchCount += 1;
        if (patchCount === 1) {
          firstPatchStarted();
          return new Promise<Partial<Response>>((resolve) => {
            resolveFirstPatch = resolve;
          });
        }

        // Leave the later key pending so the assertion can inspect whether
        // the first PATCH's cleanup incorrectly removed it.
        return Promise.resolve({ ok: false } as Partial<Response>);
      },
    );

    startHook(uid);
    await drain();

    const { dismissHint } = useUiPrefs(uid);
    dismissHint("flush_window_first");
    await firstPatchStartedPromise;

    // The first PATCH has already snapshotted its queue.  This dismissal is
    // written while that request is in flight, before its cleanup runs.
    dismissHint("flush_window_second");
    await drain(4);

    resolveFirstPatch({ ok: true } as Partial<Response>);
    await drain();

    const pendingJson = asyncStore.get(`ui_prefs_pending_${uid}`);
    expect(pendingJson).toBeDefined();
    const pending = JSON.parse(pendingJson!) as PrefsMap;
    expect(pending).toEqual({ flush_window_second: true });
  });
});
