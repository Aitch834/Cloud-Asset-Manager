/**
 * Tests confirming the WineGB survey banner migration Set guard behaviour.
 *
 * The vine-phenology screen uses a module-level `winegbMigratedSigs` Set (the
 * same pattern as `useIdentifierBannerDismiss`) to avoid re-reading AsyncStorage
 * on every remount when the user navigates away and back.
 *
 * Covers:
 *  1. runUiPrefBatchMigration — absent / promoted / retry result codes for the
 *     batch (JSON-array) WineGB legacy key format.
 *  2. First mount with a legacy key present — banner stays hidden (migrationChecked
 *     is false) until the migration promise resolves.
 *  3. Same-farm remount — the Set guard prevents a second AsyncStorage read for
 *     the legacy key.
 *  4. Farm switch — a different farmId produces a different sig; the Set guard
 *     does NOT block the migration, so AsyncStorage IS read again for the new farm.
 *  5. retry result — AsyncStorage write failure leaves the sig absent so the
 *     migration re-runs on the next mount.
 *
 * Architecture note
 * -----------------
 * We avoid @testing-library/react-native (which pulls in ESM-only Expo modules
 * that crash the Node Jest environment) and instead exercise the migration
 * function directly and simulate the component's useEffect guard logic inline —
 * matching the approach used in useUiPrefs-reinstall.test.ts.
 *
 * The module-level `winegbMigratedSigs` Set inside vine-phenology.tsx is not
 * exported (it is an implementation detail of the screen).  Tests 3 and 4
 * therefore simulate the guard in a local Set — identical logic to the
 * component — so we can verify call-count behaviour without importing the
 * full React-Native screen module.
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
// (same pattern as useUiPrefs-reinstall.test.ts)
// ---------------------------------------------------------------------------

const mockEffects: Array<() => unknown> = [];
let mockSlotIdx = 0;
const mockSlots: unknown[] = [];

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

import { runUiPrefBatchMigration, useUiPrefs } from "../lib/hooks/useUiPrefs";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

async function drain(rounds = 10): Promise<void> {
  for (let i = 0; i < rounds; i++) await flushPromises();
}

let _uidCounter = 0;
let _farmCounter = 0;
const nextUid  = () => `test-user-${++_uidCounter}`;
const nextFarm = () => `farm-${++_farmCounter}`;

function makeServerResponse(uiPrefs: PrefsMap): Partial<Response> {
  return {
    ok: true,
    json: async () => ({ uiPrefs }),
  };
}

/**
 * Builds the legacy AsyncStorage value for the WineGB migration.
 *
 * The screen stored a JSON-encoded string[] of survey names, e.g.:
 *   '["Bud Burst Survey","Flowering Survey"]'
 */
function makeLegacyWinegbValue(surveyNames: string[]): string {
  return JSON.stringify(surveyNames);
}

/**
 * Returns the useUiPrefs pref key for a WineGB survey dismissal.
 * Mirrors the helper in vine-phenology.tsx.
 */
function winegbPrefKey(surveyName: string, year: number): string {
  return `winegb_${surveyName.replace(/\s/g, "_").toLowerCase()}_${year}`;
}

/** Returns the legacy key for a farm+year combination. */
function winegbLegacyKey(farmId: string, year: number): string {
  return `bde_winegb_dismissed_${farmId}_${year}`;
}

/** Returns the migration sig for a userId+farmId pair. */
function winegbMigSig(userId: string, farmId: string): string {
  return `${userId}:${farmId}`;
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

  mockApiFetch.mockResolvedValue(makeServerResponse({}));
});

// ===========================================================================
// 1. runUiPrefBatchMigration — absent path (no legacy WineGB key)
//    Typical path: grower never had the old key, or it was already migrated.
// ===========================================================================

describe("runUiPrefBatchMigration — absent (no legacy WineGB key)", () => {
  const YEAR = 2026;

  it('returns "absent" when AsyncStorage has no entry for the legacy key', async () => {
    const uid  = nextUid();
    const farm = nextFarm();

    const result = await runUiPrefBatchMigration(
      uid,
      winegbLegacyKey(farm, YEAR),
      (raw) => {
        const dismissed: string[] = JSON.parse(raw);
        return dismissed.map(name => winegbPrefKey(name, YEAR));
      },
    );

    expect(result).toBe("absent");
  });

  it("does not touch AsyncStorage when there is nothing to migrate", async () => {
    const uid  = nextUid();
    const farm = nextFarm();

    await runUiPrefBatchMigration(
      uid,
      winegbLegacyKey(farm, YEAR),
      (raw) => {
        const dismissed: string[] = JSON.parse(raw);
        return dismissed.map(name => winegbPrefKey(name, YEAR));
      },
    );

    expect(mockSetItem).not.toHaveBeenCalled();
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it('returns "absent" and cleans up a malformed legacy entry', async () => {
    const uid     = nextUid();
    const farm    = nextFarm();
    const legKey  = winegbLegacyKey(farm, YEAR);

    asyncStore.set(legKey, "not-valid-json{{{{");

    const result = await runUiPrefBatchMigration(
      uid,
      legKey,
      (raw) => {
        const dismissed: string[] = JSON.parse(raw); // will throw
        return dismissed.map(name => winegbPrefKey(name, YEAR));
      },
    );

    expect(result).toBe("absent");
    expect(mockRemoveItem).toHaveBeenCalledWith(legKey);
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it('returns "absent" and cleans up when the parsed array is empty', async () => {
    const uid     = nextUid();
    const farm    = nextFarm();
    const legKey  = winegbLegacyKey(farm, YEAR);

    asyncStore.set(legKey, makeLegacyWinegbValue([]));

    const result = await runUiPrefBatchMigration(
      uid,
      legKey,
      (raw) => {
        const dismissed: string[] = JSON.parse(raw);
        return dismissed.map(name => winegbPrefKey(name, YEAR));
      },
    );

    expect(result).toBe("absent");
    expect(mockRemoveItem).toHaveBeenCalledWith(legKey);
  });
});

// ===========================================================================
// 2. runUiPrefBatchMigration — promoted path
//    Grower dismissed one or more WineGB surveys under the old key format.
//    Each survey name must be promoted to a separate useUiPrefs key.
// ===========================================================================

describe("runUiPrefBatchMigration — promoted (valid WineGB legacy entry found)", () => {
  const YEAR         = 2026;
  const SURVEY_NAMES = ["Bud Burst Survey", "Flowering Survey"];
  const EXPECTED_KEYS = SURVEY_NAMES.map(name => winegbPrefKey(name, YEAR));

  function setupLegacyKey(farm: string): string {
    const legKey = winegbLegacyKey(farm, YEAR);
    asyncStore.set(legKey, makeLegacyWinegbValue(SURVEY_NAMES));
    return legKey;
  }

  function parseKeys(raw: string): string[] {
    const dismissed: string[] = JSON.parse(raw);
    return dismissed.map(name => winegbPrefKey(name, YEAR));
  }

  it('returns "promoted"', async () => {
    const uid  = nextUid();
    const farm = nextFarm();
    const legKey = setupLegacyKey(farm);

    const result = await runUiPrefBatchMigration(uid, legKey, parseKeys);
    expect(result).toBe("promoted");
  });

  it("writes every derived pref key (= true) to the per-user cache", async () => {
    const uid  = nextUid();
    const farm = nextFarm();
    const legKey = setupLegacyKey(farm);

    await runUiPrefBatchMigration(uid, legKey, parseKeys);

    const cacheJson = asyncStore.get(`ui_prefs_cache_${uid}`);
    expect(cacheJson).toBeDefined();
    const cache = JSON.parse(cacheJson!) as PrefsMap;
    for (const key of EXPECTED_KEYS) {
      expect(cache[key]).toBe(true);
    }
  });

  it("adds every derived pref key to the pending queue for server sync", async () => {
    const uid  = nextUid();
    const farm = nextFarm();
    const legKey = setupLegacyKey(farm);

    await runUiPrefBatchMigration(uid, legKey, parseKeys);

    const pendingJson = asyncStore.get(`ui_prefs_pending_${uid}`);
    expect(pendingJson).toBeDefined();
    const pending = JSON.parse(pendingJson!) as PrefsMap;
    for (const key of EXPECTED_KEYS) {
      expect(pending[key]).toBe(true);
    }
  });

  it("removes the legacy key after both durable writes succeed", async () => {
    const uid  = nextUid();
    const farm = nextFarm();
    const legKey = setupLegacyKey(farm);

    await runUiPrefBatchMigration(uid, legKey, parseKeys);

    expect(mockRemoveItem).toHaveBeenCalledWith(legKey);
    expect(asyncStore.has(legKey)).toBe(false);
  });

  it("handles a single survey name correctly (no array/key confusion)", async () => {
    const uid    = nextUid();
    const farm   = nextFarm();
    const legKey = winegbLegacyKey(farm, YEAR);
    asyncStore.set(legKey, makeLegacyWinegbValue(["Harvest Survey"]));

    const result = await runUiPrefBatchMigration(
      uid,
      legKey,
      (raw) => {
        const dismissed: string[] = JSON.parse(raw);
        return dismissed.map(name => winegbPrefKey(name, YEAR));
      },
    );

    expect(result).toBe("promoted");
    const cacheJson = asyncStore.get(`ui_prefs_cache_${uid}`);
    const cache = JSON.parse(cacheJson!) as PrefsMap;
    expect(cache[winegbPrefKey("Harvest Survey", YEAR)]).toBe(true);
  });
});

// ===========================================================================
// 3. runUiPrefBatchMigration — retry path (AsyncStorage write fails)
//    The legacy key must be retained so the migration retries next mount.
// ===========================================================================

describe("runUiPrefBatchMigration — retry (durable write fails)", () => {
  const YEAR = 2026;

  it('returns "retry" when setItem throws, and retains the legacy key', async () => {
    const uid    = nextUid();
    const farm   = nextFarm();
    const legKey = winegbLegacyKey(farm, YEAR);
    asyncStore.set(legKey, makeLegacyWinegbValue(["Bud Burst Survey"]));
    mockSetItem.mockRejectedValueOnce(new Error("QuotaExceededError"));

    const result = await runUiPrefBatchMigration(
      uid,
      legKey,
      (raw) => {
        const dismissed: string[] = JSON.parse(raw);
        return dismissed.map(name => winegbPrefKey(name, YEAR));
      },
    );

    expect(result).toBe("retry");
    // Legacy key must survive so the next mount can retry.
    expect(asyncStore.has(legKey)).toBe(true);
  });
});

// ===========================================================================
// 4. Module-level Set guard — banner stays hidden during the async window
//
// The component computes:
//   migrationChecked = sig === null || winegbMigratedSigs.has(sig)
//   showBanner = prefsReady && migrationChecked && !isHintDismissed(key)
//
// Before the migration promise resolves, `migrationChecked` is false, so
// `showBanner` is false regardless of prefsReady — banner stays hidden.
//
// We simulate the component's guard logic with a local Set (same pattern as
// the component) so we can verify call-count behaviour without importing the
// full React-Native screen module.
// ===========================================================================

describe("Module-level Set guard — conservative hide during async migration window", () => {
  const YEAR = 2026;

  /**
   * Simulates one "mount" of the vine-phenology component's migration effect.
   *
   * Returns whether the migration ran (i.e. AsyncStorage was read for the
   * legacy key) and the resulting migration outcome.
   */
  async function simulateMount(params: {
    migratedSigs: Set<string>;
    userId: string;
    farmId: string;
  }): Promise<{ ran: boolean; result: string | null }> {
    const { migratedSigs, userId, farmId } = params;
    const sig    = winegbMigSig(userId, farmId);
    const legKey = winegbLegacyKey(farmId, YEAR);

    if (migratedSigs.has(sig)) {
      return { ran: false, result: null };
    }

    const result = await runUiPrefBatchMigration(
      userId,
      legKey,
      (raw) => {
        const dismissed: string[] = JSON.parse(raw);
        return dismissed.map(name => winegbPrefKey(name, YEAR));
      },
    );

    if (result !== "retry") {
      migratedSigs.add(sig);
    }

    return { ran: true, result };
  }

  it("migrationChecked is false before migration promise resolves (conservative hide)", async () => {
    const uid  = nextUid();
    const farm = nextFarm();

    // Put a legacy key in the store so migration has real work to do.
    asyncStore.set(
      winegbLegacyKey(farm, YEAR),
      makeLegacyWinegbValue(["Bud Burst Survey"]),
    );

    const migratedSigs = new Set<string>();
    const sig = winegbMigSig(uid, farm);

    // Before migration runs: sig is not in the Set.
    expect(migratedSigs.has(sig)).toBe(false);

    // migrationChecked formula: false → banner conservatively hidden.
    const migrationChecked = migratedSigs.has(sig);
    expect(migrationChecked).toBe(false);

    // Now run migration.
    await simulateMount({ migratedSigs, userId: uid, farmId: farm });

    // After migration: sig is in the Set.
    expect(migratedSigs.has(sig)).toBe(true);
  });

  it("same-farm remount does NOT re-read AsyncStorage for the legacy key", async () => {
    const uid    = nextUid();
    const farm   = nextFarm();
    const legKey = winegbLegacyKey(farm, YEAR);

    // First mount: legacy key present → promoted.
    asyncStore.set(legKey, makeLegacyWinegbValue(["Bud Burst Survey"]));

    const migratedSigs = new Set<string>();

    const firstMount = await simulateMount({ migratedSigs, userId: uid, farmId: farm });
    expect(firstMount.ran).toBe(true);
    expect(firstMount.result).toBe("promoted");

    // Record how many times the legacy key specifically was read after the
    // first mount.  We scope to the legacy key because the async best-effort
    // PATCH cleanup (step 4g in runUiPrefBatchMigration) calls loadPending()
    // after the migration promise resolves, which adds a getItem call for the
    // pending-queue key — that extra read is expected and unrelated to
    // re-checking the legacy key.
    const legacyKeyReadsAfterFirst = mockGetItem.mock.calls.filter(
      (c) => c[0] === legKey,
    ).length;

    // Second mount (same farm, same user — simulates navigate-away-and-back).
    const secondMount = await simulateMount({ migratedSigs, userId: uid, farmId: farm });

    // Guard should have short-circuited — legacy key must NOT have been read again.
    expect(secondMount.ran).toBe(false);
    expect(
      mockGetItem.mock.calls.filter((c) => c[0] === legKey).length,
    ).toBe(legacyKeyReadsAfterFirst);
  });

  it("farm switch produces a different sig and the migration runs for the new farm", async () => {
    const uid   = nextUid();
    const farmA = nextFarm();
    const farmB = nextFarm();

    // Both farms have legacy data.
    asyncStore.set(
      winegbLegacyKey(farmA, YEAR),
      makeLegacyWinegbValue(["Bud Burst Survey"]),
    );
    asyncStore.set(
      winegbLegacyKey(farmB, YEAR),
      makeLegacyWinegbValue(["Flowering Survey"]),
    );

    const migratedSigs = new Set<string>();

    // Mount on Farm A.
    const mountA = await simulateMount({ migratedSigs, userId: uid, farmId: farmA });
    expect(mountA.ran).toBe(true);
    expect(mountA.result).toBe("promoted");
    expect(migratedSigs.has(winegbMigSig(uid, farmA))).toBe(true);

    // Switch to Farm B — different sig, guard does not block.
    expect(migratedSigs.has(winegbMigSig(uid, farmB))).toBe(false);

    const mountB = await simulateMount({ migratedSigs, userId: uid, farmId: farmB });
    expect(mountB.ran).toBe(true); // migration ran for farmB
    expect(mountB.result).toBe("promoted");
    expect(migratedSigs.has(winegbMigSig(uid, farmB))).toBe(true);
  });

  it("retry result leaves sig absent so the migration re-runs on next mount", async () => {
    const uid  = nextUid();
    const farm = nextFarm();

    asyncStore.set(
      winegbLegacyKey(farm, YEAR),
      makeLegacyWinegbValue(["Véraison Survey"]),
    );

    // First write will fail → retry.
    mockSetItem.mockRejectedValueOnce(new Error("QuotaExceededError"));

    const migratedSigs = new Set<string>();

    const firstMount = await simulateMount({ migratedSigs, userId: uid, farmId: farm });
    expect(firstMount.result).toBe("retry");

    // Sig must NOT be in the Set so the next mount retries.
    expect(migratedSigs.has(winegbMigSig(uid, farm))).toBe(false);

    // Next mount (writes now succeed) — migration runs again.
    const secondMount = await simulateMount({ migratedSigs, userId: uid, farmId: farm });
    expect(secondMount.ran).toBe(true);
    expect(secondMount.result).toBe("promoted");
    expect(migratedSigs.has(winegbMigSig(uid, farm))).toBe(true);
  });

  it("userId switch resets the guard (different sig per user)", async () => {
    const uidA = nextUid();
    const uidB = nextUid();
    const farm = nextFarm();

    asyncStore.set(
      winegbLegacyKey(farm, YEAR),
      makeLegacyWinegbValue(["Harvest Survey"]),
    );

    const migratedSigs = new Set<string>();

    // User A mounts — migration runs.
    await simulateMount({ migratedSigs, userId: uidA, farmId: farm });
    expect(migratedSigs.has(winegbMigSig(uidA, farm))).toBe(true);

    // User B mounts on the same farm — different sig, migration runs for B.
    // (AsyncStorage would be re-read because the legacy key is farm-scoped.)
    const mountB = await simulateMount({ migratedSigs, userId: uidB, farmId: farm });
    expect(mountB.ran).toBe(true);
    expect(migratedSigs.has(winegbMigSig(uidB, farm))).toBe(true);
  });
});

// ===========================================================================
// 5. runUiPrefBatchMigration — waits for in-flight bootstrap before reading
//    the legacy key (same ordering guarantee as runUiPrefMigration).
// ===========================================================================

describe("runUiPrefBatchMigration — waits for active fetchPromise before reading legacy key", () => {
  const YEAR = 2026;

  it("does not read the legacy key until any active bootstrap fetch completes", async () => {
    const uid  = nextUid();
    const farm = nextFarm();

    let resolveBootstrap!: (v: Partial<Response>) => void;
    mockApiFetch.mockReturnValueOnce(
      new Promise<Partial<Response>>((res) => { resolveBootstrap = res; }),
    );

    // Kick off bootstrap via the statically-imported useUiPrefs.
    // The React mock captures every useEffect call in mockEffects; the
    // bootstrap effect is at index 2 (mount-tracking=0, subscription=1,
    // bootstrap=2).  We reset mockEffects first so prior-test effects don't
    // interfere with the index.
    mockEffects.length = 0;
    useUiPrefs(uid);
    mockEffects[2]?.(); // bootstrap effect

    const legKey = winegbLegacyKey(farm, YEAR);

    // Start migration — it will await the fetchPromise set by bootstrap.
    const migrationPromise = runUiPrefBatchMigration(
      uid,
      legKey,
      (raw) => {
        const dismissed: string[] = JSON.parse(raw);
        return dismissed.map(name => winegbPrefKey(name, YEAR));
      },
    );

    // Drain partially — server still stalled, migration should not have read
    // the legacy key yet (it is blocked waiting on the bootstrap promise).
    await drain(4);
    expect(mockGetItem).not.toHaveBeenCalledWith(legKey);

    // Unblock the server → bootstrap finishes → migration can proceed.
    resolveBootstrap(makeServerResponse({}));
    const result = await migrationPromise;
    await drain();

    // Legacy key is absent → "absent".
    expect(result).toBe("absent");
    // Now the legacy key was read (after bootstrap settled).
    expect(mockGetItem).toHaveBeenCalledWith(legKey);
  });
});
