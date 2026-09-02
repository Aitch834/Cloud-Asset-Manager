import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

interface DateRange {
  from: string;
  to: string;
}

function isDateRange(value: unknown): value is DateRange {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.from === "string" && typeof candidate.to === "string";
}

/**
 * Persist a date range in storage, scoped per farm.
 *
 * Returns `[dateFrom, setDateFrom, dateTo, setDateTo]`.
 * Empty strings represent an unset boundary. Switching farms resets the
 * visible range while the new farm's preference is being read.
 *
 * Storage key: `bde_vine_scouting_date_range_<farmId>`
 */
export function usePersistedDateRange(
  farmId: string | undefined,
): [string, (value: string) => void, string, (value: string) => void] {
  const storageKey = farmId ? `bde_vine_scouting_date_range_${farmId}` : null;
  const [dateRange, setDateRangeRaw] = useState<DateRange>({ from: "", to: "" });
  const dateRangeRef = useRef<DateRange>({ from: "", to: "" });
  const loadedForFarm = useRef<string | undefined>(undefined);
  const userChangedForFarm = useRef(false);

  useEffect(() => {
    if (!farmId || !storageKey) {
      const emptyRange = { from: "", to: "" };
      dateRangeRef.current = emptyRange;
      setDateRangeRaw(emptyRange);
      loadedForFarm.current = farmId;
      userChangedForFarm.current = false;
      return;
    }
    if (loadedForFarm.current === farmId) return;

    // Do not let the previous farm's range remain active while this farm's
    // preference is loading.
    const emptyRange = { from: "", to: "" };
    dateRangeRef.current = emptyRange;
    setDateRangeRaw(emptyRange);
    loadedForFarm.current = undefined;
    userChangedForFarm.current = false;

    let cancelled = false;
    getItem<unknown>(storageKey).then((stored) => {
      if (cancelled) return;
      if (!userChangedForFarm.current) {
        const nextRange = isDateRange(stored) ? stored : emptyRange;
        dateRangeRef.current = nextRange;
        setDateRangeRaw(nextRange);
      }
      loadedForFarm.current = farmId;
    });

    return () => {
      cancelled = true;
    };
  }, [farmId, storageKey]);

  const updateRange = useCallback(
    (updates: Partial<DateRange>) => {
      userChangedForFarm.current = true;
      const nextRange = { ...dateRangeRef.current, ...updates };
      dateRangeRef.current = nextRange;
      setDateRangeRaw(nextRange);
      if (storageKey) {
        setItem(storageKey, nextRange).catch(() => {
          /* ignore write failures silently */
        });
      }
    },
    [storageKey],
  );

  const setDateFrom = useCallback((value: string) => {
    updateRange({ from: value });
  }, [updateRange]);

  const setDateTo = useCallback((value: string) => {
    updateRange({ to: value });
  }, [updateRange]);

  return [dateRange.from, setDateFrom, dateRange.to, setDateTo];
}