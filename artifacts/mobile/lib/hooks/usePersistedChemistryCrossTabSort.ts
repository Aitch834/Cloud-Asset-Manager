import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

export type ChemistryCrossTabSort = {
  col: "name" | "avg" | string;
  dir: "asc" | "desc";
} | null;

function isValidSort(value: unknown): value is Exclude<ChemistryCrossTabSort, null> {
  if (!value || typeof value !== "object") return false;
  const sort = value as Record<string, unknown>;
  return (
    typeof sort.col === "string" &&
    (sort.col === "name" || sort.col === "avg" || /^\d{4}$/.test(sort.col)) &&
    (sort.dir === "asc" || sort.dir === "desc")
  );
}

/** Persist the harvest chemistry cross-tab sort preference separately for each farm. */
export function usePersistedChemistryCrossTabSort(
  farmId: string | undefined,
): [ChemistryCrossTabSort, (sort: ChemistryCrossTabSort) => void] {
  const storageKey = farmId ? `bde_vine_chemistry_cross_tab_sort_${farmId}` : null;
  const [sort, setSortRaw] = useState<ChemistryCrossTabSort>(null);
  const userToggled = useRef(false);

  useEffect(() => {
    if (!farmId || !storageKey) {
      setSortRaw(null);
      userToggled.current = false;
      return;
    }
    setSortRaw(null);
    userToggled.current = false;
    let cancelled = false;
    getItem<ChemistryCrossTabSort>(storageKey).then((stored) => {
      if (!cancelled && !userToggled.current) setSortRaw(isValidSort(stored) ? stored : null);
    });
    return () => { cancelled = true; };
  }, [farmId, storageKey]);

  const setSort = useCallback((nextSort: ChemistryCrossTabSort) => {
    userToggled.current = true;
    setSortRaw(nextSort);
    if (storageKey) setItem(storageKey, nextSort).catch(() => {});
  }, [storageKey]);

  return [sort, setSort];
}