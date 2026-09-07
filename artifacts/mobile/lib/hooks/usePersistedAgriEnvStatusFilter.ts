import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, removeItem, setItem, STORAGE_KEYS } from "@/lib/storage";

export type AgriEnvStatusFilter = "active" | "pending" | "completed" | null;

const DEFAULT_STATUS_FILTER: AgriEnvStatusFilter = null;
const PERSISTED_STATUS_FILTERS: readonly Exclude<AgriEnvStatusFilter, null>[] = [
  "active",
  "pending",
  "completed",
];

function isAgriEnvStatusFilter(value: unknown): value is Exclude<AgriEnvStatusFilter, null> {
  return (
    typeof value === "string" &&
    PERSISTED_STATUS_FILTERS.includes(value as Exclude<AgriEnvStatusFilter, null>)
  );
}

function statusFilterKey(farmId: string | number): string {
  return `${STORAGE_KEYS.AGRI_ENV_STATUS_FILTER}_${farmId}`;
}

/**
 * Persist the agri-environment project status filter in storage, scoped per farm.
 *
 * The filter defaults to All. Selecting All removes the saved preference so a
 * later visit also defaults to All.
 */
export function usePersistedAgriEnvStatusFilter(
  farmId: string | number | undefined,
): [AgriEnvStatusFilter, (value: AgriEnvStatusFilter) => void] {
  const storageKey = farmId === undefined ? null : statusFilterKey(farmId);
  const [statusFilter, setStatusFilterRaw] =
    useState<AgriEnvStatusFilter>(DEFAULT_STATUS_FILTER);
  const loadedForFarm = useRef<string | number | undefined>(undefined);
  const userChangedForFarm = useRef(false);

  useEffect(() => {
    if (farmId === undefined || !storageKey) {
      setStatusFilterRaw(DEFAULT_STATUS_FILTER);
      loadedForFarm.current = farmId;
      userChangedForFarm.current = false;
      return;
    }
    if (loadedForFarm.current === farmId) return;

    // Reset while the new farm's preference is loading so another farm's
    // filter cannot remain visible during a farm switch.
    setStatusFilterRaw(DEFAULT_STATUS_FILTER);
    loadedForFarm.current = undefined;
    userChangedForFarm.current = false;

    let cancelled = false;
    getItem<unknown>(storageKey)
      .then((stored) => {
        if (cancelled) return;
        if (!userChangedForFarm.current) {
          setStatusFilterRaw(isAgriEnvStatusFilter(stored) ? stored : DEFAULT_STATUS_FILTER);
        }
        loadedForFarm.current = farmId;
      })
      .catch(() => {
        // An unreadable preference is equivalent to no saved preference.
        if (!cancelled) loadedForFarm.current = farmId;
      });

    return () => {
      cancelled = true;
    };
  }, [farmId, storageKey]);

  const setStatusFilter = useCallback(
    (value: AgriEnvStatusFilter) => {
      userChangedForFarm.current = true;
      setStatusFilterRaw(value);
      if (!storageKey) return;

      const write = value === null
        ? removeItem(storageKey)
        : setItem<Exclude<AgriEnvStatusFilter, null>>(storageKey, value);
      write.catch(() => {
        /* best-effort preference persistence */
      });
    },
    [storageKey],
  );

  return [statusFilter, setStatusFilter];
}