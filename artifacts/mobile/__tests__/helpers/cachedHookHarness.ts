/**
 * Shared test harness for hooks built with buildCachedApiHook.
 *
 * ## Why not @testing-library/react-native?
 *
 * @testing-library/react-native transitively imports ESM-only Expo modules
 * (e.g. expo/virtual/env, expo-modules-core) that crash the Jest `node` test
 * environment with "Unexpected token 'export'" errors, even with generous
 * `transformIgnorePatterns`.  Switching to a full React Native environment
 * drags in JSDom, native bridge shims, and a heavyweight setup file — overkill
 * for pure data-fetching hooks.
 *
 * Instead we drive hooks directly by replacing React's core primitives:
 *
 *   1. `jest.mock('react', ...)` provides synchronous useState/useEffect stubs
 *      that store state in a `StateStore` and capture effect callbacks.
 *   2. After calling the hook we manually fire the captured effect callback.
 *   3. We drain the microtask queue via `drainAsync` so all async work settles.
 *   4. We read final state slots directly from `StateStore.values`.
 *
 * ## Usage in a new test file
 *
 * ```ts
 * import {
 *   StateStore, drainAsync, flushPromises, runHook,
 *   type HarnessContext,
 * } from './helpers/cachedHookHarness';
 *
 * // Module-level harness — must be const so jest.mock closures and runHook
 * // share the same object references across calls.
 * const harness: HarnessContext = {
 *   store: new StateStore(),
 *   slotCounter: { value: 0 },
 *   capturedEffect: { value: null },
 * };
 *
 * // Wire React stubs before the modules under test are imported.
 * jest.mock('react', () => ({
 *   useState: (init: unknown) => {
 *     const idx = harness.slotCounter.value++;
 *     return harness.store.useState(idx, init);
 *   },
 *   useEffect: (fn: () => unknown, _deps?: unknown[]) => {
 *     // Only capture the FIRST useEffect — that is the cache/fetch driver.
 *     // Subsequent side-effect hooks (e.g. URL caching) are intentionally skipped.
 *     if (!harness.capturedEffect.value) harness.capturedEffect.value = fn;
 *   },
 *   useMemo: (fn: () => unknown, _deps?: unknown[]) => fn(),
 * }));
 *
 * beforeEach(() => {
 *   harness.capturedEffect.value = null;
 *   harness.slotCounter.value = 0;
 * });
 *
 * it('fetches and caches', async () => {
 *   const result = await runHook(myHook, farmId, harness);
 *   expect(result.items).toHaveLength(1);
 * });
 * ```
 *
 * ## Important: variable naming and jest.mock hoisting
 *
 * **Name the harness variable with a `mock` prefix** (e.g. `mockHarness`).
 * babel-jest's hoist plugin rejects any other name referenced inside a
 * `jest.mock()` factory with "not allowed to reference any out-of-scope
 * variables".  This is the same rule that forced the original code to use
 * `mockStore`, `mockSlotCounter`, and `mockCapturedEffect`.
 *
 * The closure pattern is safe despite hoisting because the mock *factory* is
 * **lazy** — it is only invoked when the mocked module is first required,
 * which happens after all module-level declarations have been evaluated.  The
 * inner stub functions (`useState`, `useEffect`, etc.) capture the harness
 * binding but do not *access* it at factory-call time.  By the time any test
 * actually invokes a hook, `mockHarness` is fully initialised.
 */

// ---------------------------------------------------------------------------
// StateStore — minimal synchronous useState replacement
// ---------------------------------------------------------------------------

/**
 * A very small state-slot tracker that replaces `useState` in tests.
 *
 * Each slot stores the current value and provides a setter.  Slots are
 * assigned in the order `useState` is first called within one run.  Calling
 * `reset()` before each run restores initial values without losing the slot
 * map, exactly mirroring React's rule that hook call order must be stable.
 */
export class StateStore {
  private slots: unknown[] = [];
  private initialized = false;

  /** Reset all slots to `initialValues` for a fresh hook run. */
  reset(initialValues: unknown[]): void {
    this.slots = [...initialValues];
    this.initialized = true;
  }

  /** All current slot values — read after `drainAsync` to inspect final state. */
  get values(): unknown[] {
    return this.slots;
  }

  /**
   * Return a `[value, setter]` pair for slot `slotIdx`, mirroring React's
   * `useState` semantics: the initialiser is only applied on the first call for
   * that slot index; later calls return the current (possibly updated) value.
   */
  useState(slotIdx: number, init: unknown): [unknown, (v: unknown) => void] {
    if (!this.initialized || this.slots.length <= slotIdx) {
      while (this.slots.length <= slotIdx) this.slots.push(undefined);
      this.slots[slotIdx] =
        typeof init === 'function' ? (init as () => unknown)() : init;
    }
    const setter = (v: unknown): void => {
      this.slots[slotIdx] =
        typeof v === 'function'
          ? (v as (prev: unknown) => unknown)(this.slots[slotIdx])
          : v;
    };
    return [this.slots[slotIdx], setter];
  }
}

// ---------------------------------------------------------------------------
// Harness context — shared mutable state owned by each test file
// ---------------------------------------------------------------------------

/** Mutable counter wrapper so the jest.mock closure and runHook share one reference. */
export interface SlotCounterRef {
  value: number;
}

/** Mutable wrapper for the captured `useEffect` callback. */
export interface CapturedEffectRef {
  value: (() => unknown) | null;
}

/**
 * The context object a test file creates once and passes to both its
 * `jest.mock('react', ...)` factory and to `runHook`.
 */
export interface HarnessContext {
  store: StateStore;
  slotCounter: SlotCounterRef;
  capturedEffect: CapturedEffectRef;
}

// ---------------------------------------------------------------------------
// Async helpers
// ---------------------------------------------------------------------------

/**
 * Yield to the event loop once (via `setImmediate`) so that one round of
 * microtasks and I/O callbacks can complete.
 */
export const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

/**
 * Drain all pending promises / microtasks by yielding to the event loop
 * `rounds` times (default 8).
 *
 * The hook's `useEffect` body is a fire-and-forget async IIFE, so we cannot
 * `await` it directly.  Multiple rounds ensure nested Promise chains
 * (kv read → fetch → kv write) all resolve before assertions run.
 */
export async function drainAsync(rounds = 8): Promise<void> {
  for (let i = 0; i < rounds; i++) await flushPromises();
}

// ---------------------------------------------------------------------------
// Hook runner
// ---------------------------------------------------------------------------

/**
 * Result returned by `runHook`.  Mirrors `CachedHookResult<T>` from
 * `buildCachedApiHook` without creating a hard import dependency on app code.
 */
export interface HookResult<T> {
  items: T[];
  loading: boolean;
  fromCache: boolean;
  lastError: string | null;
  refresh: () => void;
  updateItems: (updater: (items: T[]) => T[]) => void;
}

/**
 * Run a hook once, fire its captured `useEffect`, drain all async work, and
 * return the final state as a typed `HookResult<T>`.
 *
 * @param hookFn       The hook function to test (e.g. `useTestHook`).
 * @param farmId       Passed as the first argument to the hook.
 * @param ctx          The `HarnessContext` owned by the test file (shared with `jest.mock`).
 * @param initialSlots Initial `useState` slot values.  Defaults match the four
 *                     slots of `buildCachedApiHook`:
 *                     `[items=[], loading=true, fromCache=false, lastError=null]`.
 */
export async function runHook<T>(
  hookFn: (farmId: string | undefined) => unknown,
  farmId: string,
  ctx: HarnessContext,
  initialSlots: unknown[] = [[], true, false, null],
): Promise<HookResult<T>> {
  ctx.slotCounter.value = 0;
  ctx.store.reset(initialSlots);
  const hookResult = hookFn(farmId) as {
    refresh?: () => void;
    updateItems?: (updater: (items: T[]) => T[]) => void;
  };

  if (ctx.capturedEffect.value) ctx.capturedEffect.value();

  await drainAsync();

  const [items, loading, fromCache, lastError] = ctx.store.values as [
    T[],
    boolean,
    boolean,
    string | null,
  ];
  return {
    items,
    loading,
    fromCache,
    lastError,
    refresh: hookResult.refresh ?? (() => {}),
    updateItems: hookResult.updateItems ?? (() => {}),
  };
}
