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
}

const singletons = new Map<string, UserSingleton>();

function getSingleton(uid: string): UserSingleton {
  if (!singletons.has(uid)) {
    singletons.set(uid, { prefs: {}, ready: false, fetchPromise: null, listeners: [] });
  }
  return singletons.get(uid)!;
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
      // Optimistic update: reflect the dismissal in UI and cache immediately.
      const next = { ...getSingleton(userId).prefs, [key]: true };
      setUserState(userId, next, /* ready */ true);
      setPrefs({ ...next });
      saveCache(userId, next);

      // Write-first, reconnect-flush pattern:
      //  1. Add this key to the pending queue BEFORE any PATCH attempt.
      //     This ensures the dismissal is durable and visible to any
      //     concurrent GET bootstrap retry — even if PATCH fails or the
      //     app crashes mid-flight.
      //  2. Flush the ENTIRE pending queue in one PATCH (not just this key).
      //     A successful flush proves we are online and clears all previously
      //     failed dismissals, acting as the reconnect-retry mechanism without
      //     needing a separate connectivity event.
      const enqueueAndFlush = async () => {
        const pending = await loadPending(userId);
        const toFlush = { ...pending, [key]: true };
        await savePending(userId, toFlush); // durable before any network call

        const ok = await patchServerPrefs(toFlush);
        if (ok) {
          // Remove only entries we sent; preserve anything queued concurrently.
          const afterFlush = await loadPending(userId);
          const remaining: PrefsMap = {};
          for (const [k, v] of Object.entries(afterFlush)) {
            if (!(k in toFlush)) remaining[k] = v;
          }
          await savePending(userId, remaining);
        }
        // On failure toFlush remains in the queue for the next flush attempt.
      };

      enqueueAndFlush();
    },
    [userId],
  );

  return { prefsReady, isHintDismissed, dismissHint, prefs };
}
