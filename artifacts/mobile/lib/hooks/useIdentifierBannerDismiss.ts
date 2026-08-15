import { useCallback, useEffect, useState } from "react";
import { runUiPrefMigration, useUiPrefs } from "./useUiPrefs";

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------

function prefKey(screen: string, farmId: string | undefined): string {
  return `identifier_banner_dismissed_${screen}_${farmId ?? "unknown"}`;
}

/** Legacy AsyncStorage key format used before migration to useUiPrefs. */
function legacyKey(screen: string, farmId: string | undefined): string {
  return `identifier-banner-dismissed-${screen}-${farmId ?? "unknown"}`;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Validates a raw legacy-key value.
 * The legacy format was `JSON.stringify({ ts: Date.now() })`.
 * Returns `true` only when the entry exists, parses correctly, and is within
 * the original 30-day TTL.
 */
function isLegacyValueValid(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "ts" in parsed &&
      typeof (parsed as Record<string, unknown>).ts === "number"
    ) {
      const age = Date.now() - (parsed as { ts: number }).ts;
      return age <= THIRTY_DAYS_MS;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Module-level migration tracking
//
// A module-level Set persists for the entire app session and is synchronously
// readable at render time.  This prevents the stale-readiness problem that
// arises from useState: when userId/farmId changes, useState lags one render
// behind, so migrationChecked can remain true from the previous context and
// cause a spurious render with `dismissed = false` before the new effect fires.
//
// Key format: `${userId}:${screen}:${farmId ?? "unknown"}`
//
// A sig is added to the Set ONLY when `runUiPrefMigration` returns "promoted"
// or "absent" (i.e. the migration succeeded or there was nothing to migrate).
// A "retry" result leaves the sig absent so the effect re-runs on the next
// mount/farm-switch and attempts the migration again.
// ---------------------------------------------------------------------------

const migratedSigs = new Set<string>();

function migrationSig(
  userId: string,
  screen: string,
  farmId: string | undefined,
): string {
  return `${userId}:${screen}:${farmId ?? "unknown"}`;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Returns whether the CPH/SBI identifier banner has been dismissed for a given
 * screen and farm, backed by the server-synced `useUiPrefs` store so that a
 * dismissal on one device suppresses the banner on all of the user's devices
 * after the next prefs sync.
 *
 * Visibility guarantees:
 *  - While the one-time legacy-migration check is in progress, the banner is
 *    **conservatively treated as dismissed** (hidden). This prevents it from
 *    flashing visible during the async check window.
 *  - `migrationChecked` is read from a module-level Set so it is always
 *    accurate at render time — no single-render lag from useState on context
 *    switches (e.g. farm or user change).
 *  - The migration runs through `runUiPrefMigration` (exported from
 *    `useUiPrefs`), which waits for any active bootstrap before writing to
 *    the singleton, cache, and pending queue — so the migrated dismissal
 *    cannot be lost to a concurrent reconcile snapshot.
 *  - The legacy key is removed inside `runUiPrefMigration` only after both
 *    the cache and pending-queue writes succeed (propagating errors). On any
 *    storage failure the legacy key is retained and the sig is not added to
 *    the Set, so the migration retries on the next mount.
 *  - Migration runs for any userId, including when farmId is undefined: the
 *    old hook stored dismissals under `…-unknown` in that case, so those
 *    valid legacy entries would otherwise never be promoted.
 *  - Cancellation (unmount / context switch mid-flight) only suppresses the
 *    epoch re-render — the underlying migration always completes so durable
 *    state is never left half-written.
 *
 * @param screen  - A stable slug that uniquely identifies the screen
 *                  (e.g. "purchase", "medicine", "movement")
 * @param farmId  - The current farm ID (used to scope the key per farm;
 *                  may be undefined — treated as "unknown" in both the old
 *                  and new key formats)
 * @param userId  - The current user ID (required to scope prefs per user)
 */
export function useIdentifierBannerDismiss(
  screen: string,
  farmId: string | undefined,
  userId: string | null | undefined,
): { dismissed: boolean; dismiss: () => void } {
  const key = prefKey(screen, farmId);
  const { prefsReady, isHintDismissed, dismissHint } = useUiPrefs(userId);

  // Used only to trigger re-renders when the module-level Set is updated after
  // a migration completes.  The actual readiness is computed from the Set.
  const [, setMigrationEpoch] = useState(0);

  // Compute migration readiness synchronously from the module-level Set so it
  // is always correct at render time, even across context switches.
  //
  // When userId is absent there is nothing to migrate; treat as checked.
  // farmId may be undefined — that is a valid scope ("unknown") and must be
  // checked because the old hook stored dismissals under that scope too.
  const sig = userId ? migrationSig(userId, screen, farmId) : null;
  const migrationChecked = sig === null || migratedSigs.has(sig);

  useEffect(() => {
    // Without a user ID we have no userId-scoped legacy key to check.
    if (!userId) return;

    const currentSig = migrationSig(userId, screen, farmId);

    // Already successfully migrated this combination in this session.
    if (migratedSigs.has(currentSig)) return;

    // Whether or not this component instance is still mounted/active.
    // The migration itself always runs to completion — only the epoch
    // update (which triggers a re-render) is gated on this flag.
    let uiActive = true;

    const run = async () => {
      // runUiPrefMigration:
      //  • Waits for any active bootstrap to finish before writing.
      //  • Uses durable storage helpers that propagate errors.
      //  • Removes the legacy key only after cache + pending writes succeed.
      //  • Returns "promoted" | "absent" | "retry".
      const result = await runUiPrefMigration(
        userId,
        legacyKey(screen, farmId),
        prefKey(screen, farmId),
        isLegacyValueValid,
      );

      // Mark the sig as done only when the migration completed (promoted or
      // absent).  A "retry" result means a storage write failed and the legacy
      // key was retained — do NOT add to the Set so the migration reruns on
      // the next mount.
      if (result !== "retry") {
        migratedSigs.add(currentSig);
        if (uiActive) {
          setMigrationEpoch((e) => e + 1);
        }
      }
      // On "retry": uiActive/cancellation does not matter — we intentionally
      // do not update the epoch so the banner stays conservatively hidden and
      // the next mount will attempt migration again.
    };

    run();
    return () => { uiActive = false; };
  }, [screen, farmId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback(() => {
    dismissHint(key);
  }, [dismissHint, key]);

  // Three-way guard before concluding the banner is NOT dismissed:
  //  1. `migrationChecked` — the legacy-key migration has completed (or there
  //     was nothing to migrate) for the exact current context.  While pending,
  //     the banner is conservatively treated as dismissed to prevent flicker.
  //  2. `prefsReady` — useUiPrefs has finished its initial load.
  //  3. `isHintDismissed(key)` — the pref flag is set.
  const dismissed =
    !migrationChecked || (prefsReady && isHintDismissed(key));

  return { dismissed, dismiss };
}
