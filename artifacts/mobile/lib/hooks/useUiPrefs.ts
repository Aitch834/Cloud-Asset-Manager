/**
 * useUiPrefs — server-synced UI hint dismissal flags, scoped by user ID.
 *
 * All AsyncStorage keys and the in-memory singleton are keyed by userId so
 * that a logout / account-switch never crosses user data boundaries.
 *
 * Loading strategy:
 *  • Non-empty AsyncStorage cache (returning user on this device) → trust
 *    immediately; `prefsReady` becomes true without waiting for the server.
 *    The server response arrives shortly after and corrects any stale flags.
 *  • Empty cache (fresh device / fresh install) → wait for the server GET
 *    before setting `prefsReady`, so we never show a hint the user already
 *    dismissed on another device.
 *  • Server unreachable when cache is empty → `prefsReady` still becomes true
 *    after the attempt so the UI doesn't hang forever (offline fallback).
 *
 * User isolation:
 *  • On every `userId` change the component's local state is reset immediately.
 *  • A per-load cancellation token (`cancelled` flag) ensures async callbacks
 *    for a prior user never update state once that user's load is no longer
 *    relevant (component unmounted OR userId changed).
 *
 * Write strategy (write-first, reconnect-flush):
 *  • Before any PATCH attempt, the key is written to the per-user pending queue
 *    in AsyncStorage, so a failed or in-flight PATCH is always visible to a
 *    concurrent GET bootstrap retry.
 *  • dismissHint flushes the entire pending queue (not just the new key) in a
 *    single PATCH.  This doubles as the reconnect mechanism: a successful write
 *    proves connectivity and clears all previously-failed dismissals without
 *    waiting for the next app restart.
 *  • After a confirmed flush, only entries that were in the queue at flush-time
 *    are removed, preserving any writes that arrived concurrently.
 *
 * Usage:
 *   const { prefsReady, isHintDismissed, dismissHint } = useUiPrefs(user?.id);
 *   if (!prefsReady) return null; // never decide hint visibility before this
 *   if (!isHintDismissed("my_key")) showHint();
 *   dismissHint("my_key");
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

type PrefsMap = Record<string, boolean>;

// ---------------------------------------------------------------------------
// Per-user AsyncStorage key helpers
// ---------------------------------------------------------------------------

const cacheKey   = (uid: string) => `ui_prefs_cache_${uid}`;
const pendingKey = (uid: string) => `ui_prefs_pending_${uid}`;

// ---------------------------------------------------------------------------
// AsyncStorage helpers
// ---------------------------------------------------------------------------

async function loadCached(uid: string): Promise<PrefsMap> {
  try { return JSON.parse((await AsyncStorage.getItem(cacheKey(uid))) ?? "{}") as PrefsMap; }
  catch { return {}; }
}

async function saveCache(uid: string, prefs: PrefsMap): Promise<void> {
  try { await AsyncStorage.setItem(cacheKey(uid), JSON.stringify(prefs)); }
  catch { /* best-effort */ }
}

async function loadPending(uid: string): Promise<PrefsMap> {
  try { return JSON.parse((await AsyncStorage.getItem(pendingKey(uid))) ?? "{}") as PrefsMap; }
  catch { return {}; }
}

async function savePending(uid: string, pending: PrefsMap): Promise<void> {
  try {
    if (Object.keys(pending).length === 0) {
      await AsyncStorage.removeItem(pendingKey(uid));
    } else {
      await AsyncStorage.setItem(pendingKey(uid), JSON.stringify(pending));
    }
  } catch { /* best-effort */ }
}

// ---------------------------------------------------------------------------
// Server helpers
// ---------------------------------------------------------------------------

async function fetchServerPrefs(): Promise<PrefsMap | null> {
  try {
    const res = await apiFetch("/api/account/ui-prefs");
    if (!res.ok) return null;
    return ((await res.json()) as { uiPrefs: PrefsMap }).uiPrefs ?? {};
  } catch { return null; }
}

async function patchServerPrefs(patch: PrefsMap): Promise<boolean> {
  try {
    const res = await apiFetch("/api/account/ui-prefs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    return res.ok;
  } catch { return false; }
}

// ---------------------------------------------------------------------------
// Per-user singleton — prevents duplicate fetches across concurrent instances.
// ---------------------------------------------------------------------------

interface UserSingleton {
  prefs: PrefsMap;
  ready: boolean;
  fetchPromise: Promise<void> | null;
  listeners: Array<() => void>;
  /**
   * Per-user write queue — a promise chain that serializes all durable
   * cache + pending-queue mutations for this user.  Every operation that
   * does a read-modify-write on the user's AsyncStorage keys must be
   * appended here so concurrent callers (e.g. two simultaneous migrations,
   * or a migration racing a dismissHint flush) never overwrite each other's
   * pending-queue entries.
   */
  writeQueue: Promise<void>;
}

const singletons = new Map<string, UserSingleton>();

function getSingleton(uid: string): UserSingleton {
  if (!singletons.has(uid)) {
    singletons.set(uid, {
      prefs: {},
      ready: false,
      fetchPromise: null,
      listeners: [],
      writeQueue: Promise.resolve(),
    });
  }
  return singletons.get(uid)!;
}

/**
 * Enqueue an async write operation in the per-user write queue.
 *
 * The supplied `work` function is called only when all previously enqueued
 * operations have settled.  Errors thrown by `work` are caught so a failed
 * write never stalls the queue for subsequent operations.
 *
 * Returns a promise that resolves with the value returned by `work` (or
 * rejects if `work` throws — callers should handle rejection).
 */
function enqueueWrite<T>(uid: string, work: () => Promise<T>): Promise<T> {
  const s = getSingleton(uid);
  const result = s.writeQueue.then(work);
  // The queue must never become permanently rejected, so we attach a no-op
  // catch to the promise we store on the singleton; the caller gets the
  // original result promise (which may reject) to handle as needed.
  s.writeQueue = result.then(
    () => { /* settled */ },
    () => { /* settled — error handled by caller */ },
  );
  return result;
}

function setUserState(uid: string, prefs: PrefsMap, ready: boolean): void {
  const s = getSingleton(uid);
  s.prefs = prefs;
  if (ready) s.ready = true;
  for (const fn of s.listeners) fn();
}

function subscribeUser(uid: string, fn: () => void): () => void {
  const s = getSingleton(uid);
  s.listeners.push(fn);
  return () => { s.listeners = s.listeners.filter((l) => l !== fn); };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUiPrefs(userId: string | null | undefined) {
  const [prefs, setPrefs] = useState<PrefsMap>(() =>
    userId ? { ...getSingleton(userId).prefs } : {},
  );
  const [prefsReady, setPrefsReady] = useState(() =>
    userId ? getSingleton(userId).ready : false,
  );
  const mounted = useRef(true);

  // ---------------------------------------------------------------------------
  // Synchronous reset on userId change (React "derived state from props" pattern)
  //
  // When userId changes from one non-null value to another, the existing effects
  // cannot reset `prefs`/`prefsReady` synchronously: effect cleanups and new
  // effect bodies run AFTER render, so any downstream initialization effects
  // (e.g. a sort-preference screen that checks `prefsReady` on mount) would
  // see stale values from the previous user during the same commit.
  //
  // The React-recommended solution is to call setState during render when a
  // tracked "previous prop" value diverges.  React will immediately restart the
  // render with the updated state, so every effect in the same commit starts
  // from the correct per-user values.
  //
  // Reference: https://react.dev/learn/you-might-not-need-an-effect
  //            (section "Adjusting some state when a prop changes")
  // ---------------------------------------------------------------------------
  const [trackedUserId, setTrackedUserId] = useState(userId);
  if (trackedUserId !== userId) {
    setTrackedUserId(userId);
    // Snapshot the new user's singleton so the re-render starts from their
    // current known state rather than a blank slate (avoids a needless spinner
    // if the new user's prefs are already cached in the singleton).
    const s = userId ? getSingleton(userId) : null;
    setPrefsReady(s?.ready ?? false);
    setPrefs(s ? { ...s.prefs } : {});
  }

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Subscribe to singleton updates so other instances' writes are reflected.
  useEffect(() => {
    if (!userId) return;
    return subscribeUser(userId, () => {
      if (!mounted.current) return;
      const s = getSingleton(userId);
      setPrefs({ ...s.prefs });
      if (s.ready) setPrefsReady(true);
    });
  }, [userId]);

  // Bootstrap prefs when userId changes (or on first mount).
  useEffect(() => {
    // Immediately reset local state when userId changes.
    if (!userId) {
      setPrefs({});
      setPrefsReady(false);
      return;
    }

    const s = getSingleton(userId);
    setPrefs({ ...s.prefs });
    if (s.ready) {
      setPrefsReady(true);
      return;
    }

    // Per-load cancellation token — set to true by cleanup (userId change or unmount).
    let cancelled = false;

    const runLoad = async () => {
      // Step 1 — AsyncStorage cache + pending queue (fast, enables offline path)
      const [cached, initialPending] = await Promise.all([
        loadCached(userId),
        loadPending(userId),
      ]);
      if (cancelled) return;

      const hasCacheData =
        Object.keys(cached).length > 0 || Object.keys(initialPending).length > 0;
      const fromCache = { ...cached, ...initialPending };
      setUserState(userId, fromCache, hasCacheData);
      if (!cancelled) {
        setPrefs({ ...fromCache });
        if (hasCacheData) setPrefsReady(true);
      }

      // Step 2 — server GET (source of truth)
      const serverPrefs = await fetchServerPrefs();
      if (cancelled) return;

      if (serverPrefs !== null) {
        // Reconcile: server base + CURRENT singleton prefs so optimistic
        // dismissals made while the GET was in-flight are preserved.
        const currentOptimistic = getSingleton(userId).prefs;
        const reconciled = { ...serverPrefs, ...currentOptimistic };
        setUserState(userId, reconciled, /* ready */ true);
        await saveCache(userId, reconciled);

        // Flush the pending queue.  Re-read from storage so we catch any
        // writes that were enqueued AFTER the bootstrap snapshot was taken
        // (e.g. dismissHint called while the GET was in-flight).
        const currentPending = await loadPending(userId);
        if (!cancelled && Object.keys(currentPending).length > 0) {
          const ok = await patchServerPrefs(currentPending);
          if (ok && !cancelled) {
            // Remove only the entries we sent; preserve any that arrived later.
            const afterFlush = await loadPending(userId);
            const remaining: PrefsMap = {};
            for (const [k, v] of Object.entries(afterFlush)) {
              if (!(k in currentPending)) remaining[k] = v;
            }
            await savePending(userId, remaining);
          }
        }

        if (!cancelled) {
          setPrefs({ ...reconciled });
          setPrefsReady(true);
        }
      } else {
        // Server unreachable — mark ready so the UI doesn't hang forever.
        setUserState(userId, fromCache, /* ready */ true);
        if (!cancelled) {
          setPrefs({ ...fromCache });
          setPrefsReady(true);
        }
      }
    };

    if (!s.fetchPromise) {
      s.fetchPromise = runLoad().finally(() => { s.fetchPromise = null; });
    } else {
      s.fetchPromise.then(() => {
        if (!cancelled) {
          const updated = getSingleton(userId);
          setPrefs({ ...updated.prefs });
          if (updated.ready) setPrefsReady(true);
        }
      });
    }

    return () => { cancelled = true; };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  const isHintDismissed = useCallback(
    (key: string): boolean => !!prefs[key],
    [prefs],
  );

  const dismissHint = useCallback(
    (key: string): void => {
      if (!userId) return;
      // Optimistic update: reflect the dismissal in UI and singleton immediately
      // so isHintDismissed returns true before any I/O completes.
      const next = { ...getSingleton(userId).prefs, [key]: true };
      setUserState(userId, next, /* ready */ true);
      setPrefs({ ...next });

      // Write-first, reconnect-flush pattern — routed through the per-user
      // write queue so this read-modify-write on the pending queue is
      // serialized against concurrent migration writes and other dismissals.
      //
      //  Queue slot: cache write + pending-queue write (durable before PATCH).
      //  After the slot: network PATCH + cleanup (outside the queue so network
      //  I/O doesn't block other enqueued writes).
      void enqueueWrite(userId, async () => {
        // Re-read singleton at write time so we capture any concurrent
        // optimistic updates that landed between the call and this slot.
        const current = { ...getSingleton(userId).prefs, [key]: true };
        await saveCache(userId, current); // best-effort (swallows errors)
        const pending = await loadPending(userId);
        await savePending(userId, { ...pending, [key]: true });
      }).then(async () => {
        // PATCH runs outside the queue — network I/O must not block writes.
        const toFlush = await loadPending(userId);
        if (Object.keys(toFlush).length === 0) return;
        const ok = await patchServerPrefs(toFlush);
        if (ok) {
          // Cleanup: remove only the keys we sent; preserve anything enqueued
          // concurrently (another dismissal, a migration, etc.).
          await enqueueWrite(userId, async () => {
            const afterFlush = await loadPending(userId);
            const remaining: PrefsMap = {};
            for (const [k, v] of Object.entries(afterFlush)) {
              if (!(k in toFlush)) remaining[k] = v;
            }
            await savePending(userId, remaining);
          });
        }
        // On PATCH failure toFlush remains in the queue for the next attempt.
      });
    },
    [userId],
  );

  /**
   * Set a pref key to any boolean value, including `false`.
   *
   * Unlike `dismissHint` (which only ever sets `true` and runs the server PATCH
   * outside the write queue), `setPref` serializes the entire operation —
   * cache write, pending-queue write, PATCH, and cleanup — through the per-user
   * `enqueueWrite` queue.  This guarantees that rapid successive calls (e.g.
   * a user toggling a sort preference twice in quick succession) always reach
   * the server in the correct order: the second enqueued slot does not start its
   * PATCH until the first slot's PATCH has settled.
   *
   * Trade-off: `setPref` holds the write queue open for the duration of the
   * network request.  This is acceptable for user-initiated toggles (rare) but
   * would be unacceptable for high-frequency writes such as migrations; those
   * should continue to use `dismissHint` or `runUiPrefMigration`.
   */
  const setPref = useCallback(
    (key: string, value: boolean): void => {
      if (!userId) return;
      // Optimistic update: reflect the new value immediately in the in-memory
      // singleton so every mounted hook instance sees it before any I/O.
      const next = { ...getSingleton(userId).prefs, [key]: value };
      setUserState(userId, next, /* ready */ true);
      setPrefs({ ...next });

      // Run the full write + PATCH cycle inside the write queue so that a
      // rapid A→B→A toggle sequence always serializes: slot N's PATCH finishes
      // before slot N+1 begins, preventing a stale PATCH from overwriting a
      // newer one on the server.
      void enqueueWrite(userId, async () => {
        // Re-read singleton at execution time to capture any concurrent
        // optimistic updates that landed after the call but before this slot ran.
        const current = { ...getSingleton(userId).prefs, [key]: value };
        await saveCache(userId, current);

        // Merge the new key into the pending queue.
        const pending = { ...(await loadPending(userId)), [key]: value };
        await savePending(userId, pending);

        // PATCH is inside the queue — this serializes it against the next toggle.
        if (Object.keys(pending).length === 0) return;
        const ok = await patchServerPrefs(pending);
        if (ok) {
          // Remove only the keys that were in this batch; preserve any writes
          // that arrived while the PATCH was in flight (shouldn't happen for
          // user-initiated toggles but is correct to handle).
          const afterFlush = await loadPending(userId);
          const remaining: PrefsMap = {};
          for (const [k, v] of Object.entries(afterFlush)) {
            if (!(k in pending)) remaining[k] = v;
          }
          await savePending(userId, remaining);
        }
        // On PATCH failure the key stays in the pending queue and will be
        // flushed by the next successful dismissHint or setPref call.
      });
    },
    [userId],
  );

  return { prefsReady, isHintDismissed, dismissHint, setPref, prefs };
}

// ---------------------------------------------------------------------------
// Migration API — exposed for one-time legacy-key migrations
// ---------------------------------------------------------------------------

/**
 * Result codes returned by `runUiPrefMigration`:
 *  - "promoted" — legacy entry was valid, durably written to cache + pending,
 *                 and the legacy key was removed.  Singleton updated.
 *  - "absent"   — no legacy entry existed (or it was expired/malformed and
 *                 cleaned up).  No retry needed.
 *  - "retry"    — a storage write failed; the legacy key was retained so the
 *                 migration can be retried on the next mount.
 */
export type UiPrefMigrationResult = "promoted" | "absent" | "retry";

/**
 * Write `prefs` to the user's cache key, propagating any storage error.
 * Unlike the internal `saveCache` helper (which silently swallows errors),
 * this variant is used by the migration path so a failure is detectable and
 * the legacy key is retained for retry.
 */
async function saveCacheDurable(uid: string, prefs: PrefsMap): Promise<void> {
  await AsyncStorage.setItem(cacheKey(uid), JSON.stringify(prefs));
}

/**
 * Write `pending` to the user's pending-queue key, propagating any storage
 * error (same rationale as `saveCacheDurable`).
 */
async function savePendingDurable(uid: string, pending: PrefsMap): Promise<void> {
  if (Object.keys(pending).length === 0) {
    await AsyncStorage.removeItem(pendingKey(uid));
  } else {
    await AsyncStorage.setItem(pendingKey(uid), JSON.stringify(pending));
  }
}

/**
 * Migrates a legacy AsyncStorage dismissal entry into the useUiPrefs system.
 *
 * This function operates entirely within useUiPrefs' own synchronization
 * model:
 *  - It waits for any in-flight bootstrap to finish before touching the
 *    singleton (prevents a concurrent reconcile snapshot from losing the
 *    migrated key).
 *  - The durable writes (cache + pending queue) are serialized through the
 *    per-user `writeQueue` so concurrent migrations (or a racing `dismissHint`
 *    flush) cannot interleave their read-modify-write cycles and overwrite
 *    each other's entries.
 *
 * Order of operations:
 *  1. Wait for any in-flight bootstrap promise on this user's singleton.
 *  2. Read and validate the legacy key (outside the write queue — read-only).
 *  3. Inside a serialized write-queue slot:
 *     a. Re-read the current singleton prefs and merge the new key.
 *     b. Update the in-memory singleton (triggers listeners).
 *     c. Write to the cache key (`saveCacheDurable` — throws on failure).
 *     d. Re-read the pending queue and merge the new key.
 *     e. Write to the pending queue (`savePendingDurable` — throws on failure).
 *     f. Remove the legacy key — only after c + e succeed.
 *     g. Best-effort server PATCH outside the queue (I/O does not block
 *        other writes; pending-queue retry handles server failures).
 *
 * Returns `"promoted"` when a valid dismissal was durably migrated,
 * `"absent"` when there was nothing to migrate (or an expired/malformed entry
 * was cleaned up), and `"retry"` when a storage write failed and the legacy
 * key was retained so the caller can try again next session.
 *
 * @param uid              The current user ID.
 * @param legacyStorageKey The old AsyncStorage key to inspect and remove.
 * @param newPrefKey       The new useUiPrefs key to set.
 * @param isValid          Returns true for raw stored values to be promoted.
 */
export async function runUiPrefMigration(
  uid: string,
  legacyStorageKey: string,
  newPrefKey: string,
  isValid: (raw: string) => boolean,
): Promise<UiPrefMigrationResult> {
  // Step 1 — wait for any active bootstrap so our singleton write can't be
  // overwritten by a concurrent reconcile that snapped currentOptimistic
  // before us.
  const s = getSingleton(uid);
  if (s.fetchPromise) {
    await s.fetchPromise;
  }

  // Step 2 — read and validate the legacy key (read-only; no serialization
  // needed for the read itself).
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(legacyStorageKey);
  } catch {
    // Cannot read AsyncStorage — leave everything in place for retry.
    return "retry";
  }

  if (raw === null) {
    return "absent"; // no legacy entry
  }

  if (!isValid(raw)) {
    // Expired or malformed — nothing to promote; best-effort cleanup.
    try { await AsyncStorage.removeItem(legacyStorageKey); } catch { /* best-effort */ }
    return "absent";
  }

  // Step 3 — durable writes, serialized through the per-user write queue so
  // concurrent migrations and dismissHint flushes can't interleave their
  // read-modify-write cycles.
  let toFlush: PrefsMap | null = null;

  try {
    const result = await enqueueWrite<UiPrefMigrationResult>(uid, async () => {
      // 3a — re-read singleton at write time so we merge, never clobber.
      const next = { ...getSingleton(uid).prefs, [newPrefKey]: true };

      // 3b — update in-memory singleton (optimistic; triggers listeners).
      setUserState(uid, next, /* ready */ true);

      // 3c — durable cache write; throws on failure.
      await saveCacheDurable(uid, next);

      // 3d-e — durable pending-queue write; throws on failure.
      const pending = await loadPending(uid);
      toFlush = { ...pending, [newPrefKey]: true };
      await savePendingDurable(uid, toFlush);

      // 3f — remove legacy key only after both durable writes confirmed.
      try { await AsyncStorage.removeItem(legacyStorageKey); } catch { /* best-effort */ }

      return "promoted" as const;
    });

    // 3g — best-effort server PATCH, outside the write queue so the queue
    // isn't held open during network I/O.  Failures are fine: the pending
    // queue entry survives and will be flushed on the next successful write.
    if (result === "promoted" && toFlush !== null) {
      const flushed = toFlush; // capture for the async closure below
      void (async () => {
        const ok = await patchServerPrefs(flushed);
        if (ok) {
          await enqueueWrite(uid, async () => {
            const afterFlush = await loadPending(uid);
            const remaining: PrefsMap = {};
            for (const [k, v] of Object.entries(afterFlush)) {
              if (!(k in flushed)) remaining[k] = v;
            }
            await savePending(uid, remaining); // best-effort; error caught by enqueueWrite
          });
        }
      })();
    }

    return result;
  } catch {
    // A durable write inside the queue threw — singleton was updated
    // optimistically which is fine; the legacy key was NOT removed so the
    // migration will retry on the next mount.
    return "retry";
  }
}

/**
 * Durable, awaitable variant of `dismissHint` for use-cases where the caller
 * must know the dismissal is persisted before proceeding (e.g. navigating away).
 *
 * Semantics:
 *  • Optimistically updates the in-memory singleton immediately (same as
 *    `dismissHint`).
 *  • Awaits the cache + pending-queue writes through the per-user write queue
 *    so the promise resolves only after both writes settle.
 *  • Server PATCH fires asynchronously after the function resolves (same
 *    write-first, reconnect-flush pattern used by `dismissHint`).
 *  • Throws if the caller passes an empty uid.
 *
 * The function is intentionally exported as a standalone (not a hook return)
 * so it can be used in `async` event handlers that run outside the render cycle.
 */
export async function dismissHintDurable(uid: string, key: string): Promise<void> {
  if (!uid) return;

  // Optimistic update — reflect the dismissal immediately.
  const next = { ...getSingleton(uid).prefs, [key]: true };
  setUserState(uid, next, /* ready */ true);

  // Await the durable writes through the write queue.
  await enqueueWrite(uid, async () => {
    const current = { ...getSingleton(uid).prefs, [key]: true };
    // Use durable helpers that throw on failure so the caller can detect
    // whether the write actually settled.
    await saveCacheDurable(uid, current);
    const pending = await loadPending(uid);
    await savePendingDurable(uid, { ...pending, [key]: true });
  });

  // Server PATCH is best-effort and runs outside the write queue.
  void (async () => {
    const toFlush = await loadPending(uid);
    if (Object.keys(toFlush).length === 0) return;
    const ok = await patchServerPrefs(toFlush);
    if (ok) {
      await enqueueWrite(uid, async () => {
        const afterFlush = await loadPending(uid);
        const remaining: PrefsMap = {};
        for (const [k, v] of Object.entries(afterFlush)) {
          if (!(k in toFlush)) remaining[k] = v;
        }
        await savePending(uid, remaining);
      });
    }
  })();
}

/**
 * Batch variant of `runUiPrefMigration` for legacy keys whose stored value
 * encodes multiple dismissals (e.g. a JSON array of strings).
 *
 * The supplied `parseKeys` function receives the raw stored string and must
 * return the new useUiPrefs keys to set.  It may throw on malformed input —
 * the error is caught and treated as "absent".
 *
 * All new keys are written atomically (within a single write-queue slot) to
 * both the cache and the pending queue before the legacy key is removed.
 * The legacy key is retained on any durable-write failure so the migration
 * can be retried on the next mount ("retry").
 *
 * Returns "promoted" / "absent" / "retry" with the same semantics as
 * `runUiPrefMigration`.
 */
export async function runUiPrefBatchMigration(
  uid: string,
  legacyStorageKey: string,
  parseKeys: (raw: string) => string[],
): Promise<UiPrefMigrationResult> {
  // Step 1 — wait for any active bootstrap so our singleton write can't be
  // overwritten by a concurrent reconcile.
  const s = getSingleton(uid);
  if (s.fetchPromise) {
    await s.fetchPromise;
  }

  // Step 2 — read the legacy key (read-only; no serialization needed).
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(legacyStorageKey);
  } catch {
    return "retry";
  }

  if (raw === null) {
    return "absent";
  }

  // Step 3 — parse the raw value into new pref keys.
  let newKeys: string[];
  try {
    newKeys = parseKeys(raw);
  } catch {
    // Malformed — clean up and treat as absent.
    try { await AsyncStorage.removeItem(legacyStorageKey); } catch { /* best-effort */ }
    return "absent";
  }

  if (newKeys.length === 0) {
    try { await AsyncStorage.removeItem(legacyStorageKey); } catch { /* best-effort */ }
    return "absent";
  }

  // Step 4 — durable writes, serialized through the per-user write queue.
  let toFlush: PrefsMap | null = null;

  try {
    const result = await enqueueWrite<UiPrefMigrationResult>(uid, async () => {
      // 4a — re-read singleton at write time so we merge, never clobber.
      const next = { ...getSingleton(uid).prefs };
      for (const k of newKeys) next[k] = true;

      // 4b — update in-memory singleton (optimistic; triggers listeners).
      setUserState(uid, next, /* ready */ true);

      // 4c — durable cache write; throws on failure → caught below → "retry".
      await saveCacheDurable(uid, next);

      // 4d–e — durable pending-queue write; throws on failure → "retry".
      const pending = await loadPending(uid);
      toFlush = { ...pending };
      for (const k of newKeys) toFlush[k] = true;
      await savePendingDurable(uid, toFlush);

      // 4f — remove legacy key only after both durable writes confirmed.
      try { await AsyncStorage.removeItem(legacyStorageKey); } catch { /* best-effort */ }

      return "promoted" as const;
    });

    // 4g — best-effort server PATCH, outside the write queue.
    if (result === "promoted" && toFlush !== null) {
      const flushed = toFlush;
      void (async () => {
        const ok = await patchServerPrefs(flushed);
        if (ok) {
          await enqueueWrite(uid, async () => {
            const afterFlush = await loadPending(uid);
            const remaining: PrefsMap = {};
            for (const [k, v] of Object.entries(afterFlush)) {
              if (!(k in flushed)) remaining[k] = v;
            }
            await savePending(uid, remaining);
          });
        }
      })();
    }

    return result;
  } catch {
    // A durable write inside the queue threw — the legacy key was NOT removed
    // so the migration will retry on the next mount.
    return "retry";
  }
}
