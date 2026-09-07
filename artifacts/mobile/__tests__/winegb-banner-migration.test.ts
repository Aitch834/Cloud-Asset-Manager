/**
 * Tests confirming the WineGB survey banner migration Set guard behaviour.
 *
 * The vine-phenology screen uses the shared batch-migration guard to avoid
 * re-reading AsyncStorage on every remount when the user navigates away and
 * back.
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
 * that crash the Node Jest environment). The React mock below lets the tests
 * invoke the shared hook's effect and re-render it without importing the full
 * React-Native screen module.
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
const mockStateSetterCalls: number[] = [];

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
    const setter = (v: unknown) => {
      mockStateSetterCalls.push(i);
      mockApplySetterValue(i, v);
    };
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
  dismissHintDurable,
  runUiPrefBatchMigration,
  useUiPrefs,
} from "../lib/hooks/useUiPrefs";
import { useUiPrefBatchMigrationGuard } from "../lib/hooks/useUiPrefBatchMigrationGuard";
import { shouldOfferWinegbSurvey, winegbPrefKey } from "../lib/winegbSurveys";

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

/** Returns the legacy key for a farm+year combination. */
function winegbLegacyKey(farmId: string, year: number): string {
  return `bde_winegb_dismissed_${farmId}_${year}`;
}

// ---------------------------------------------------------------------------
// Per-test setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  asyncStore.clear();
  mockGetItem.mockImplementation(async (key: string) => asyncStore.get(key) ?? null);
  mockSetItem.mockImplementation(async (key: string, value: string) => {
    asyncStore.set(key, value);
  });
  mockRemoveItem.mockImplementation(async (key: string) => {
    asyncStore.delete(key);
  });

  mockEffects.length = 0;
  mockSlots.length = 0;
  mockSlotIdx = 0;
  mockStateSetterCalls.length = 0;

  mockApiFetch.mockResolvedValue(makeServerResponse({}));
});

// ---------------------------------------------------------------------------
// 1. runUiPrefBatchMigration — absent path (no legacy WineGB key)
//    Typical path: grower never had the old key, or it was already migrated.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 2. runUiPrefBatchMigration — promoted path
//    Grower dismissed one or more WineGB surveys under the old key format.
//    Each survey name must be promoted to a separate useUiPrefs key.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 3. runUiPrefBatchMigration — retry path (AsyncStorage write fails)
//    The legacy key must be retained so the migration retries next mount.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// 4. Shared hook guard — banner stays hidden during the async window
//
// The hook computes:
//   migrationChecked = sig === null || migratedSigs.has(sig)
//   showBanner = prefsReady && migrationChecked && !isHintDismissed(key)
//
// Before the migration promise resolves, `migrationChecked` is false, so
// `showBanner` is false regardless of prefsReady — banner stays hidden.
// ---------------------------------------------------------------------------

describe("useUiPrefBatchMigrationGuard — conservative hide during async migration window", () => {
  const YEAR = 2026;

  function renderGuard(params: {
    userId: string;
    farmId: string;
    legacyKey?: string;
  }): { migrationChecked: boolean; runEffect: () => unknown } {
    mockSlotIdx = 0;
    mockEffects.length = 0;
    const { userId, farmId } = params;
    const legKey = params.legacyKey ?? winegbLegacyKey(farmId, YEAR);

    const migrationChecked = useUiPrefBatchMigrationGuard(
      userId,
      farmId,
      legKey,
      (raw) => {
        const dismissed: string[] = JSON.parse(raw);
        return dismissed.map(name => winegbPrefKey(name, YEAR));
      },
    );

    const effect = mockEffects[0] as (() => unknown) | undefined;
    return {
      migrationChecked,
      runEffect: () => effect?.(),
    };
  }

  function makeHandleSave(params: {
    stageCode: string;
    year: number;
    prefsReady: boolean;
    migrationChecked: boolean;
    isHintDismissed: (key: string) => boolean;
  }): () => Promise<boolean> {
    return async () => {
      // Represents the fast appendToList + refreshPendingCount portion of save.
      await Promise.resolve();
      return shouldOfferWinegbSurvey(params);
    };
  }

  function startDeferredMigration(params: {
    userId: string;
    farmId: string;
    legacyValue: string | null;
  }): {
    initialMigrationChecked: boolean;
    release: () => void;
  } {
    const legacyKey = winegbLegacyKey(params.farmId, YEAR);
    let releaseLegacyRead!: () => void;
    const legacyRead = new Promise<void>((resolve) => {
      releaseLegacyRead = resolve;
    });

    mockGetItem.mockImplementation(async (key: string) => {
      if (key === legacyKey) {
        await legacyRead;
        return params.legacyValue;
      }
      return asyncStore.get(key) ?? null;
    });

    const firstRender = renderGuard({
      userId: params.userId,
      farmId: params.farmId,
    });
    firstRender.runEffect();

    return {
      initialMigrationChecked: firstRender.migrationChecked,
      release: releaseLegacyRead,
    };
  }

  function isCachedPrefDismissed(uid: string, key: string): boolean {
    const cacheJson = asyncStore.get(`ui_prefs_cache_${uid}`);
    if (!cacheJson) return false;
    const cache = JSON.parse(cacheJson) as PrefsMap;
    return cache[key] === true;
  }

  it("does not show the banner when handleSave runs before migration resolves", async () => {
    const uid  = nextUid();
    const farm = nextFarm();

    const deferred = startDeferredMigration({
      userId: uid,
      farmId: farm,
      legacyValue: makeLegacyWinegbValue(["Fruit Set Survey"]),
    });
    await drain(4);

    const handleSave = makeHandleSave({
      stageCode: "71",
      year: YEAR,
      prefsReady: true,
      migrationChecked: deferred.initialMigrationChecked,
      isHintDismissed: (key) => isCachedPrefDismissed(uid, key),
    });

    await expect(handleSave()).resolves.toBe(false);
    expect(renderGuard({ userId: uid, farmId: farm }).migrationChecked).toBe(false);

    deferred.release();
    await drain();
    expect(renderGuard({ userId: uid, farmId: farm }).migrationChecked).toBe(true);
  });

  it("finishes the durable migration without updating an inactive screen after cleanup", async () => {
    const uid = nextUid();
    const farm = nextFarm();
    const legacyKey = winegbLegacyKey(farm, YEAR);
    const migratedPrefKey = winegbPrefKey("Fruit Set Survey", YEAR);
    asyncStore.set(
      legacyKey,
      makeLegacyWinegbValue(["Fruit Set Survey"]),
    );

    let releaseLegacyRead!: () => void;
    const legacyRead = new Promise<void>((resolve) => {
      releaseLegacyRead = resolve;
    });
    mockGetItem.mockImplementation(async (key: string) => {
      if (key === legacyKey) {
        await legacyRead;
      }
      return asyncStore.get(key) ?? null;
    });

    const mount = renderGuard({ userId: uid, farmId: farm });
    const cleanup = mount.runEffect();
    expect(typeof cleanup).toBe("function");
    expect(mount.migrationChecked).toBe(false);

    (cleanup as () => void)();
    const setterCallsAfterCleanup = mockStateSetterCalls.length;
    releaseLegacyRead();
    await drain();

    const cache = JSON.parse(
      asyncStore.get(`ui_prefs_cache_${uid}`) ?? "{}",
    ) as PrefsMap;
    expect(cache[migratedPrefKey]).toBe(true);
    expect(asyncStore.has(legacyKey)).toBe(false);
    expect(mockStateSetterCalls).toHaveLength(setterCallsAfterCleanup);
    expect(renderGuard({ userId: uid, farmId: farm }).migrationChecked).toBe(true);
  });

  it("keeps a legacy Fruit Set dismissal hidden after migration completes", async () => {
    const uid  = nextUid();
    const farm = nextFarm();
    const deferred = startDeferredMigration({
      userId: uid,
      farmId: farm,
      legacyValue: makeLegacyWinegbValue(["Fruit Set Survey"]),
    });

    expect(deferred.initialMigrationChecked).toBe(false);
    deferred.release();
    await drain();

    const migrationChecked = renderGuard({ userId: uid, farmId: farm }).migrationChecked;
    expect(migrationChecked).toBe(true);
    expect(isCachedPrefDismissed(uid, winegbPrefKey("Fruit Set Survey", YEAR))).toBe(true);

    const handleSave = makeHandleSave({
      stageCode: "71",
      year: YEAR,
      prefsReady: true,
      migrationChecked,
      isHintDismissed: (key) => isCachedPrefDismissed(uid, key),
    });
    await expect(handleSave()).resolves.toBe(false);
  });

  it("shows the banner on the next save after an undismissed migration", async () => {
    const uid  = nextUid();
    const farm = nextFarm();
    const deferred = startDeferredMigration({
      userId: uid,
      farmId: farm,
      legacyValue: null,
    });

    expect(deferred.initialMigrationChecked).toBe(false);
    deferred.release();
    await drain();

    const migrationChecked = renderGuard({ userId: uid, farmId: farm }).migrationChecked;
    expect(migrationChecked).toBe(true);
    expect(isCachedPrefDismissed(uid, winegbPrefKey("Fruit Set Survey", YEAR))).toBe(false);

    const handleSave = makeHandleSave({
      stageCode: "71",
      year: YEAR,
      prefsReady: true,
      migrationChecked,
      isHintDismissed: (key) => isCachedPrefDismissed(uid, key),
    });
    await expect(handleSave()).resolves.toBe(true);
  });

  it("same-farm remount does NOT re-read AsyncStorage for the legacy key", async () => {
    const uid    = nextUid();
    const farm   = nextFarm();
    const legKey = winegbLegacyKey(farm, YEAR);

    // First mount: legacy key present → promoted.
    asyncStore.set(legKey, makeLegacyWinegbValue(["Bud Burst Survey"]));

    const firstMount = renderGuard({ userId: uid, farmId: farm });
    firstMount.runEffect();
    await drain();
    expect(firstMount.migrationChecked).toBe(false);
    expect(renderGuard({ userId: uid, farmId: farm }).migrationChecked).toBe(true);

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
    const secondMount = renderGuard({ userId: uid, farmId: farm });
    secondMount.runEffect();
    await drain();

    // Guard should have short-circuited — legacy key must NOT have been read again.
    expect(secondMount.migrationChecked).toBe(true);
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

    // Mount on Farm A.
    const mountA = renderGuard({ userId: uid, farmId: farmA });
    mountA.runEffect();
    await drain();
    expect(renderGuard({ userId: uid, farmId: farmA }).migrationChecked).toBe(true);

    // Switch to Farm B — different sig, guard does not block.
    const mountB = renderGuard({ userId: uid, farmId: farmB });
    expect(mountB.migrationChecked).toBe(false);
    mountB.runEffect();
    await drain();
    expect(renderGuard({ userId: uid, farmId: farmB }).migrationChecked).toBe(true);
  });

  it("different legacy keys do not share a completed guard entry", async () => {
    const uid  = nextUid();
    const farm = nextFarm();
    const legacyKeyA = `${winegbLegacyKey(farm, YEAR)}_a`;
    const legacyKeyB = `${winegbLegacyKey(farm, YEAR)}_b`;

    asyncStore.set(legacyKeyA, makeLegacyWinegbValue(["Bud Burst Survey"]));
    asyncStore.set(legacyKeyB, makeLegacyWinegbValue(["Flowering Survey"]));

    const migrationA = renderGuard({ userId: uid, farmId: farm, legacyKey: legacyKeyA });
    migrationA.runEffect();
    await drain();
    expect(renderGuard({ userId: uid, farmId: farm, legacyKey: legacyKeyA }).migrationChecked).toBe(true);

    const migrationB = renderGuard({ userId: uid, farmId: farm, legacyKey: legacyKeyB });
    expect(migrationB.migrationChecked).toBe(false);
    migrationB.runEffect();
    await drain();
    expect(renderGuard({ userId: uid, farmId: farm, legacyKey: legacyKeyB }).migrationChecked).toBe(true);
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

    const firstMount = renderGuard({ userId: uid, farmId: farm });
    expect(firstMount.migrationChecked).toBe(false);
    firstMount.runEffect();
    await drain();

    // The retry must leave the guard unchecked.
    expect(renderGuard({ userId: uid, farmId: farm }).migrationChecked).toBe(false);

    // Next mount (writes now succeed) — migration runs again.
    const secondMount = renderGuard({ userId: uid, farmId: farm });
    secondMount.runEffect();
    await drain();
    expect(renderGuard({ userId: uid, farmId: farm }).migrationChecked).toBe(true);
  });

  it("userId switch resets the guard (different sig per user)", async () => {
    const uidA = nextUid();
    const uidB = nextUid();
    const farm = nextFarm();

    asyncStore.set(
      winegbLegacyKey(farm, YEAR),
      makeLegacyWinegbValue(["Harvest Survey"]),
    );

    // User A mounts — migration runs.
    const mountA = renderGuard({ userId: uidA, farmId: farm });
    mountA.runEffect();
    await drain();
    expect(renderGuard({ userId: uidA, farmId: farm }).migrationChecked).toBe(true);

    // User B mounts on the same farm — different sig, migration runs for B.
    // (AsyncStorage would be re-read because the legacy key is farm-scoped.)
    const mountB = renderGuard({ userId: uidB, farmId: farm });
    expect(mountB.migrationChecked).toBe(false);
    mountB.runEffect();
    await drain();
    expect(renderGuard({ userId: uidB, farmId: farm }).migrationChecked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. runUiPrefBatchMigration — waits for in-flight bootstrap before reading
//    the legacy key (same ordering guarantee as runUiPrefMigration).
// ---------------------------------------------------------------------------

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

describe("WineGB prompt durable dismissal", () => {
  const YEAR = 2026;
  const SURVEY = "Fruit Set Survey";

  function renderPrefs(uid: string) {
    mockSlotIdx = 0;
    mockEffects.length = 0;
    return useUiPrefs(uid);
  }

  it("persists the dismissed survey in both the durable cache and pending queue", async () => {
    const uid = nextUid();
    const key = winegbPrefKey(SURVEY, YEAR);
    mockApiFetch.mockResolvedValue({ ok: false });

    await dismissHintDurable(uid, key);
    await drain();

    expect(JSON.parse(asyncStore.get(`ui_prefs_cache_${uid}`)!)).toMatchObject({
      [key]: true,
    });
    expect(JSON.parse(asyncStore.get(`ui_prefs_pending_${uid}`)!)).toMatchObject({
      [key]: true,
    });
  });

  it("does not offer the dismissed survey after remounting with the same user and farm", async () => {
    const uid = nextUid();
    const key = winegbPrefKey(SURVEY, YEAR);
    mockApiFetch.mockResolvedValue({ ok: false });

    await dismissHintDurable(uid, key);
    await drain();

    const remounted = renderPrefs(uid);
    expect(remounted.prefsReady).toBe(true);
    expect(remounted.isHintDismissed(key)).toBe(true);
    expect(shouldOfferWinegbSurvey({
      stageCode: "71",
      year: YEAR,
      prefsReady: remounted.prefsReady,
      migrationChecked: true,
      isHintDismissed: remounted.isHintDismissed,
    })).toBe(false);
  });

  it("rolls back the optimistic dismissal when durable storage fails", async () => {
    const uid = nextUid();
    const key = winegbPrefKey(SURVEY, YEAR);
    mockSetItem.mockRejectedValueOnce(new Error("QuotaExceededError"));

    await expect(dismissHintDurable(uid, key)).rejects.toThrow("QuotaExceededError");

    const afterFailure = renderPrefs(uid);
    expect(afterFailure.isHintDismissed(key)).toBe(false);
    expect(shouldOfferWinegbSurvey({
      stageCode: "71",
      year: YEAR,
      prefsReady: true,
      migrationChecked: true,
      isHintDismissed: afterFailure.isHintDismissed,
    })).toBe(true);
    expect(asyncStore.has(`ui_prefs_pending_${uid}`)).toBe(false);
  });

  it("removes a partial cache write when the pending-queue write fails", async () => {
    const uid = nextUid();
    const key = winegbPrefKey(SURVEY, YEAR);
    mockSetItem
      .mockImplementationOnce(async (storageKey: string, value: string) => {
        asyncStore.set(storageKey, value);
      })
      .mockRejectedValueOnce(new Error("PendingQueueWriteError"));

    await expect(dismissHintDurable(uid, key)).rejects.toThrow("PendingQueueWriteError");

    expect(JSON.parse(asyncStore.get(`ui_prefs_cache_${uid}`) ?? "{}")).not.toHaveProperty(key);
    expect(asyncStore.has(`ui_prefs_pending_${uid}`)).toBe(false);
    expect(renderPrefs(uid).isHintDismissed(key)).toBe(false);
  });
});
