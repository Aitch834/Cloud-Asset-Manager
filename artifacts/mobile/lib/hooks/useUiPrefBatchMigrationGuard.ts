import { useEffect, useState } from "react";
import { runUiPrefBatchMigration } from "./useUiPrefs";

type ParseKeys = (raw: string) => string[];

// A module-level Set persists for the entire app session and is synchronously
// readable at render time. This avoids a one-render lag when the user or farm
// changes while a migration is still being checked.
//
// The legacy key is part of the signature so separate one-time migrations
// cannot accidentally suppress one another for the same user and farm.
const migratedSigs = new Set<string>();

function migrationSig(
  userId: string,
  farmId: string,
  legacyKey: string,
): string {
  return `${userId}:${farmId}:${legacyKey}`;
}

/**
 * Runs a one-time batch UI-preference migration for a user and farm.
 *
 * While the migration is pending, this returns false so callers can
 * conservatively hide UI that depends on the migrated preferences. The
 * signature is marked complete only when the migration returns "promoted" or
 * "absent"; "retry" deliberately remains unmarked for the next mount.
 */
export function useUiPrefBatchMigrationGuard(
  userId: string | null | undefined,
  farmId: string | null | undefined,
  legacyKey: string,
  parseKeys: ParseKeys,
): boolean {
  // This state exists only to re-render after the module-level Set changes.
  const [, setMigrationEpoch] = useState(0);

  // Read readiness synchronously so a context switch cannot reuse the previous
  // user's or farm's completed state for one render.
  const sig = userId && farmId ? migrationSig(userId, farmId, legacyKey) : null;
  const migrationChecked = sig === null || migratedSigs.has(sig);

  useEffect(() => {
    if (!userId || !farmId) return;

    const currentSig = migrationSig(userId, farmId, legacyKey);
    if (migratedSigs.has(currentSig)) return;

    let uiActive = true;

    // `parseKeys` is intentionally not a dependency: callers commonly pass
    // an inline parser, and the migration identity is the legacy key itself.
    // The parser captured by this effect is the one paired with that key.
    void runUiPrefBatchMigration(userId, legacyKey, parseKeys).then((result) => {
      // A retry means durable storage failed and the legacy key was retained.
      // Leave the signature absent so the next mount can try again.
      if (result !== "retry") {
        migratedSigs.add(currentSig);
        if (uiActive) setMigrationEpoch((epoch) => epoch + 1);
      }
    });

    // The migration itself always completes; cancellation only suppresses the
    // re-render for an inactive screen instance.
    return () => { uiActive = false; };
  }, [farmId, legacyKey, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return migrationChecked;
}