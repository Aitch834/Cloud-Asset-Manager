import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

/**
 * Sentinel stored in AsyncStorage to represent the explicit "All vintages"
 * selection. Vintage years are always positive integers, so -1 is safe.
 */
const ALL_VINTAGES_SENTINEL = -1;

/**
 * Persist the selected vintage year in AsyncStorage, scoped per farm.
 *
 * Returns `[selectedVintage, setSelectedVintage, loadedForFarmId]`.
 *
 * - `selectedVintage` is `null` for "All vintages", or a positive year number.
 * - `loadedForFarmId` is the farm ID whose value is currently reflected in
 *   `selectedVintage`. It is `undefined` while a read is in progress, which
 *   lets callers know the stored value is not yet authoritative.
 * - Switching farms resets `loadedForFarmId` to `undefined` until the new
 *   farm's read completes.
 *
 * Storage distinction:
 * - Key absent / non-number stored → no preference (caller should apply its
 *   own default, e.g. most-recent vintage).
 * - Stored value === ALL_VINTAGES_SENTINEL (-1) → user explicitly chose All.
 * - Stored value > 0 → user chose that specific vintage year.
 *
 * Storage key: `bde_vine_vintage_<farmId>`
 */
export function usePersistedVintage(
  farmId: string | undefined,
): [
  /** null = "All vintages"; number = specific year; undefined = not yet loaded */
  number | null | undefined,
  (vintage: number | null) => void,
  string | undefined,
] {
  const storageKey = farmId ? `bde_vine_vintage_${farmId}` : null;

  /**
   * undefined  = read not yet finished for the current farm
   * null       = "All vintages" (stored as sentinel -1)
   * number > 0 = specific vintage year
   */
  const [selectedVintage, setSelectedVintageRaw] = useState<number | null | undefined>(undefined);
  // Farm ID whose value is reflected in selectedVintage; undefined while loading.
  const [loadedForFarmId, setLoadedForFarmId] = useState<string | undefined>(undefined);
  const loadedForFarm = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!farmId || !storageKey) {
      setSelectedVintageRaw(undefined);
      setLoadedForFarmId(undefined);
      loadedForFarm.current = undefined;
      return;
    }
    // Skip re-read if already loaded for this farm (prevents reset mid-session)
    if (loadedForFarm.current === farmId) return;

    // Mark as loading for the new farm
    setSelectedVintageRaw(undefined);
    setLoadedForFarmId(undefined);
    loadedForFarm.current = undefined;

    let cancelled = false;
    getItem<number>(storageKey).then((stored) => {
      if (cancelled) return;
      if (typeof stored === "number") {
        // Translate sentinel back to null ("All")
        setSelectedVintageRaw(stored === ALL_VINTAGES_SENTINEL ? null : stored);
      } else {
        // Key absent or corrupt — signal "no preference stored" via undefined
        setSelectedVintageRaw(undefined);
      }
      loadedForFarm.current = farmId;
      setLoadedForFarmId(farmId);
    });
    return () => {
      cancelled = true;
    };
  }, [farmId, storageKey]);

  const setSelectedVintage = useCallback(
    (vintage: number | null) => {
      setSelectedVintageRaw(vintage);
      if (storageKey) {
        // Store sentinel for null ("All") so we can distinguish it from "not set"
        setItem(storageKey, vintage === null ? ALL_VINTAGES_SENTINEL : vintage).catch(() => {
          /* ignore write failures silently */
        });
      }
    },
    [storageKey],
  );

  return [selectedVintage, setSelectedVintage, loadedForFarmId];
}
