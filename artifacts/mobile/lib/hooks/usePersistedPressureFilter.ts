import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

export type PressureFilter = "__all__" | "1" | "2" | "3";

const ALL_PRESSURE_FILTER: PressureFilter = "__all__";
const PRESSURE_FILTERS: readonly PressureFilter[] = ["__all__", "1", "2", "3"];

function isPressureFilter(value: unknown): value is PressureFilter {
  return typeof value === "string" && PRESSURE_FILTERS.includes(value as PressureFilter);
}

/**
 * Persist the selected disease pressure filter in storage, scoped per farm.
 *
 * The filter defaults to "All pressure" when there is no saved preference or
 * when the stored value is invalid. Switching farms resets to that default
 * while the new farm's preference is being read.
 *
 * Storage key: `bde_vine_scouting_pressure_filter_<farmId>`
 */
export function usePersistedPressureFilter(
  farmId: string | undefined,
): [PressureFilter, (value: PressureFilter) => void] {
  const storageKey = farmId ? `bde_vine_scouting_pressure_filter_${farmId}` : null;
  const [pressureFilter, setPressureFilterRaw] = useState<PressureFilter>(ALL_PRESSURE_FILTER);
  const loadedForFarm = useRef<string | undefined>(undefined);
  const userChangedForFarm = useRef(false);

  useEffect(() => {
    if (!farmId || !storageKey) {
      setPressureFilterRaw(ALL_PRESSURE_FILTER);
      loadedForFarm.current = farmId;
      return;
    }
    if (loadedForFarm.current === farmId) return;

    // Do not let the previous farm's filter remain active while this farm
    // preference is loading.
    setPressureFilterRaw(ALL_PRESSURE_FILTER);
    loadedForFarm.current = undefined;
    userChangedForFarm.current = false;

    let cancelled = false;
    getItem<unknown>(storageKey).then((stored) => {
      if (cancelled) return;
      if (!userChangedForFarm.current) {
        setPressureFilterRaw(isPressureFilter(stored) ? stored : ALL_PRESSURE_FILTER);
      }
      loadedForFarm.current = farmId;
    });

    return () => {
      cancelled = true;
    };
  }, [farmId, storageKey]);

  const setPressureFilter = useCallback(
    (value: PressureFilter) => {
      userChangedForFarm.current = true;
      setPressureFilterRaw(value);
      if (storageKey) {
        setItem(storageKey, value).catch(() => {
          /* ignore write failures silently */
        });
      }
    },
    [storageKey],
  );

  return [pressureFilter, setPressureFilter];
}