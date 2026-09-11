import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

const DEFAULT_OPEN = true;

/**
 * Persist the open/closed state of the harvest "Yield by Variety" panel in
 * AsyncStorage, scoped per farm.
 *
 * Returns `[isOpen, setIsOpen]`.
 * - Defaults to open.
 * - Switching farms re-reads that farm's stored state.
 * - The state survives app restarts.
 *
 * Storage key: `bde_vine_variety_table_open_<farmId>`
 */
export function usePersistedVarietyTableOpen(
  farmId: string | undefined,
): [boolean, (open: boolean | ((previous: boolean) => boolean)) => void] {
  const storageKey = farmId ? `bde_vine_variety_table_open_${farmId}` : null;

  const [isOpen, setIsOpenRaw] = useState<boolean>(DEFAULT_OPEN);
  const userToggled = useRef(false);

  useEffect(() => {
    if (!farmId || !storageKey) {
      setIsOpenRaw(DEFAULT_OPEN);
      userToggled.current = false;
      return;
    }

    // Do not show the previous farm's preference while this farm hydrates.
    setIsOpenRaw(DEFAULT_OPEN);
    userToggled.current = false;

    let cancelled = false;
    getItem<boolean>(storageKey)
      .then((stored) => {
        if (cancelled || userToggled.current) return;
        if (typeof stored === "boolean") setIsOpenRaw(stored);
      })
      .catch(() => {
        /* Keep the safe default when preference storage cannot be read. */
      });

    return () => {
      cancelled = true;
    };
  }, [farmId, storageKey]);

  const setIsOpen = useCallback(
    (open: boolean | ((previous: boolean) => boolean)) => {
      userToggled.current = true;
      setIsOpenRaw((previous) => {
        const next = typeof open === "function" ? open(previous) : open;
        if (storageKey) {
          setItem(storageKey, next).catch(() => {
            /* best-effort */
          });
        }
        return next;
      });
    },
    [storageKey],
  );

  return [isOpen, setIsOpen];
}