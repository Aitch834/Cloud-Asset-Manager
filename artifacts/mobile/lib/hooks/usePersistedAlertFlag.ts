import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

type AlertFlag = "idle" | "approaching-neutral" | "no-fills";

const VALID_FLAGS: AlertFlag[] = ["idle", "approaching-neutral", "no-fills"];

/**
 * Persist the barrel alert-flag filter selection in local storage, scoped per
 * farm.
 *
 * Returns `[alertFlag, setAlertFlag]`.
 * - `null` means no filter is active.
 * - Switching farms resets state immediately (no stale filter flash) then
 *   re-reads that farm's stored selection.
 * - Setting `null` explicitly records the cleared state so a previous
 *   selection does not reappear the next time the same farm is visited.
 *
 * Race safety:
 *   Every async read snapshots `readNonce.current` at start. User calls to
 *   `setAlertFlag` and farm-change reads both increment the nonce, so a slow
 *   read that resolves after a user tap (or a concurrent farm-switch read)
 *   silently discards its result rather than overwriting the newer state.
 *
 * Storage key: `bde_vessel_alert_flag_<farmId>`
 */
export function usePersistedAlertFlag(
  farmId: string | undefined,
): [AlertFlag | null, (flag: AlertFlag | null) => void] {
  const storageKey = farmId ? `bde_vessel_alert_flag_${farmId}` : null;

  const [alertFlag, setAlertFlagRaw] = useState<AlertFlag | null>(null);

  // The farm whose persisted value is currently reflected in state.
  const loadedForFarm = useRef<string | undefined>(undefined);

  // Monotonic counter. Snapshot at the start of each async read; incremented
  // by user writes and new reads. A read whose nonce no longer matches the
  // current value is stale and must be discarded.
  const readNonce = useRef(0);

  // Mirror farmId so the stable setAlertFlag callback can reference it without
  // being recreated on every render.
  const farmIdRef = useRef(farmId);
  farmIdRef.current = farmId;

  useEffect(() => {
    // Immediately reset to null when the farm changes — don't let the caller
    // briefly see the previous farm's filter while the async read is in-flight.
    // Also clear loadedForFarm so that navigating back to a previous farm
    // always triggers a fresh read (state was cleared, so it must be restored).
    if (loadedForFarm.current !== farmId) {
      setAlertFlagRaw(null);
      loadedForFarm.current = undefined;
    }

    if (!farmId || !storageKey) {
      return;
    }

    // Already hydrated for this farm — skip the read to avoid mid-session resets.
    if (loadedForFarm.current === farmId) return;

    let cancelled = false;
    // Snapshot nonce *after* any prior reads so this read can invalidate them,
    // and so user writes that arrive while we are awaiting will invalidate us.
    const nonce = ++readNonce.current;

    getItem<AlertFlag | null>(storageKey).then((stored) => {
      if (cancelled) return;
      // A user write (or a newer farm-change read) happened after this read
      // started — discard rather than overwriting the newer state.
      if (readNonce.current !== nonce) return;

      if (stored !== null && VALID_FLAGS.includes(stored as AlertFlag)) {
        setAlertFlagRaw(stored as AlertFlag);
      } else {
        setAlertFlagRaw(null);
      }
      loadedForFarm.current = farmId;
    });

    return () => {
      cancelled = true;
    };
  // storageKey is derived from farmId; listing both is redundant but explicit.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId, storageKey]);

  const setAlertFlag = useCallback(
    (flag: AlertFlag | null) => {
      // Invalidate any in-flight read so it cannot overwrite this selection.
      readNonce.current++;
      // Mark this farm as loaded so the effect guard doesn't re-issue a read
      // after the user has already made a choice.
      loadedForFarm.current = farmIdRef.current;

      setAlertFlagRaw(flag);

      const key = farmIdRef.current
        ? `bde_vessel_alert_flag_${farmIdRef.current}`
        : null;
      if (key) {
        setItem(key, flag).catch(() => {
          /* ignore write failures silently */
        });
      }
    },
    // No deps: farmIdRef and readNonce are refs; storageKey is derived inside.
    [],
  );

  return [alertFlag, setAlertFlag];
}
