import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

export type VineRegisterStatusFilter = "all" | "active" | "removed";

const DEFAULT_STATUS_FILTER: VineRegisterStatusFilter = "active";
const STATUS_FILTERS: readonly VineRegisterStatusFilter[] = [
  "all",
  "active",
  "removed",
];

function isVineRegisterStatusFilter(
  value: unknown,
): value is VineRegisterStatusFilter {
  return (
    typeof value === "string" &&
    STATUS_FILTERS.includes(value as VineRegisterStatusFilter)
  );
}

/**
 * Persist the selected Vine Register status filter in storage, scoped per farm.
 *
 * The filter defaults to Active when there is no saved preference or when the
 * stored value is invalid. Switching farms resets to Active while the new
 * farm's preference is being read.
 *
 * Storage key: `bde_vine_register_status_filter_<farmId>`
 */
export function usePersistedVineRegisterStatusFilter(
  farmId: string | undefined,
): [VineRegisterStatusFilter, (value: VineRegisterStatusFilter) => void] {
  const storageKey = farmId
    ? `bde_vine_register_status_filter_${farmId}`
    : null;
  const [statusFilter, setStatusFilterRaw] =
    useState<VineRegisterStatusFilter>(DEFAULT_STATUS_FILTER);
  const loadedForFarm = useRef<string | undefined>(undefined);
  const userChangedForFarm = useRef(false);

  useEffect(() => {
    if (!farmId || !storageKey) {
      setStatusFilterRaw(DEFAULT_STATUS_FILTER);
      loadedForFarm.current = farmId;
      return;
    }
    if (loadedForFarm.current === farmId) return;

    // Do not keep the previous farm's filter active while this preference loads.
    setStatusFilterRaw(DEFAULT_STATUS_FILTER);
    loadedForFarm.current = undefined;
    userChangedForFarm.current = false;

    let cancelled = false;
    getItem<unknown>(storageKey).then((stored) => {
      if (cancelled) return;
      if (!userChangedForFarm.current) {
        setStatusFilterRaw(
          isVineRegisterStatusFilter(stored)
            ? stored
            : DEFAULT_STATUS_FILTER,
        );
      }
      loadedForFarm.current = farmId;
    });

    return () => {
      cancelled = true;
    };
  }, [farmId, storageKey]);

  const setStatusFilter = useCallback(
    (value: VineRegisterStatusFilter) => {
      userChangedForFarm.current = true;
      setStatusFilterRaw(value);
      if (storageKey) {
        setItem(storageKey, value).catch(() => {
          /* ignore write failures silently */
        });
      }
    },
    [storageKey],
  );

  return [statusFilter, setStatusFilter];
}