import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

/**
 * Persist a multi-block filter selection in AsyncStorage, scoped per farm.
 *
 * Returns `[selectedIds, setSelectedIds]`.
 * - An empty array means "all blocks shown" (no filter applied).
 * - Switching farms re-reads that farm's stored selection.
 * - Saving an empty array explicitly records the cleared state so stale
 *   selections don't reappear on the next visit.
 *
 * Storage key: `bde_vine_block_filter_<farmId>`
 */
export function usePersistedBlockFilter(
  farmId: string | undefined,
): [number[], (ids: number[]) => void] {
  const storageKey = farmId ? `bde_vine_block_filter_${farmId}` : null;

  const [selectedIds, setSelectedIdsRaw] = useState<number[]>([]);
  // Track which farm we last loaded for so we reset when switching farms
  const loadedForFarm = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!farmId || !storageKey) {
      setSelectedIdsRaw([]);
      loadedForFarm.current = farmId;
      return;
    }
    // Skip re-read if already loaded for this farm (prevents reset mid-session)
    if (loadedForFarm.current === farmId) return;

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

  return [selectedIds, setSelectedIds];
}
