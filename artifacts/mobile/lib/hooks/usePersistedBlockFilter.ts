import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

/**
 * Persist a multi-block filter selection in AsyncStorage, scoped per farm.
 *
 * Returns `[selectedIds, setSelectedIds, loadedForFarmId]`.
 * - An empty array means "all blocks shown" (no filter applied).
 * - `loadedForFarmId` identifies the farm whose selection is currently exposed;
 *   it is undefined while a new farm's value is loading.
 * - Switching farms re-reads that farm's stored selection.
 * - Saving an empty array explicitly records the cleared state so stale
 *   selections don't reappear on the next visit.
 *
 * Storage key: `bde_vine_block_filter_<farmId>`
 */
export function usePersistedBlockFilter(
  farmId: string | undefined,
): [number[], (ids: number[]) => void, string | undefined] {
  const storageKey = farmId ? `bde_vine_block_filter_${farmId}` : null;

  const [selectedIds, setSelectedIdsRaw] = useState<number[]>([]);
  const [loadedForFarmId, setLoadedForFarmId] = useState<string | undefined>(undefined);
  // Track which farm we last loaded for so we reset when switching farms
  const loadedForFarm = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!farmId || !storageKey) {
      setSelectedIdsRaw([]);
      setLoadedForFarmId(undefined);
      loadedForFarm.current = undefined;
      return;
    }
    // Skip re-read if already loaded for this farm (prevents reset mid-session)
    if (loadedForFarm.current === farmId) return;

    setSelectedIdsRaw([]);
    setLoadedForFarmId(undefined);
    loadedForFarm.current = undefined;

    let cancelled = false;
    getItem<number[]>(storageKey).then((stored) => {
      if (cancelled) return;
      if (
        Array.isArray(stored) &&
        stored.every((x) => typeof x === "number")
      ) {
        setSelectedIdsRaw(stored);
      } else {
        setSelectedIdsRaw([]);
      }
      loadedForFarm.current = farmId;
      setLoadedForFarmId(farmId);
    });
    return () => {
      cancelled = true;
    };
  }, [farmId, storageKey]);

  const setSelectedIds = useCallback(
    (ids: number[]) => {
      setSelectedIdsRaw(ids);
      if (storageKey) {
        setItem(storageKey, ids).catch(() => {
          /* ignore write failures silently */
        });
      }
    },
    [storageKey],
  );

  return [selectedIds, setSelectedIds, loadedForFarmId];
}
