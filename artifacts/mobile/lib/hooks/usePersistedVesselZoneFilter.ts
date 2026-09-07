import { useCallback, useEffect, useRef, useState } from "react";

import { getItem, setItem } from "@/lib/storage";

type ZoneFilterUpdater = string[] | ((current: string[]) => string[]);

/**
 * Persists the vessel-register zone selection per farm.
 *
 * An empty array represents a cleared filter and is persisted explicitly.
 * Until the active farm's value has loaded, the hook exposes an empty array so
 * a previous farm's selection can never flash during a farm switch.
 */
export function usePersistedVesselZoneFilter(
  farmId: string | undefined,
): [string[], (value: ZoneFilterUpdater) => void] {
  const storageKey = farmId ? `bde_vessel_zone_filter_${farmId}` : null;
  const [zoneFilter, setZoneFilterRaw] = useState<string[]>([]);
  const zoneFilterRef = useRef<string[]>([]);
  const loadedForFarm = useRef<string | undefined>(undefined);
  const readNonce = useRef(0);
  const farmIdRef = useRef(farmId);
  farmIdRef.current = farmId;

  useEffect(() => {
    if (loadedForFarm.current !== farmId) {
      zoneFilterRef.current = [];
      setZoneFilterRaw([]);
      loadedForFarm.current = undefined;
    }

    if (!farmId || !storageKey) return;
    if (loadedForFarm.current === farmId) return;

    let cancelled = false;
    const nonce = ++readNonce.current;

    getItem<unknown>(storageKey).then((stored) => {
      if (cancelled || readNonce.current !== nonce) return;

      const restored =
        Array.isArray(stored) && stored.every(zone => typeof zone === "string")
          ? stored
          : [];
      zoneFilterRef.current = restored;
      setZoneFilterRaw(restored);
      loadedForFarm.current = farmId;
    });

    return () => {
      cancelled = true;
    };
  }, [farmId, storageKey]);

  const setZoneFilter = useCallback((value: ZoneFilterUpdater) => {
    readNonce.current++;

    const next =
      typeof value === "function" ? value(zoneFilterRef.current) : value;
    zoneFilterRef.current = next;
    loadedForFarm.current = farmIdRef.current;
    setZoneFilterRaw(next);

    const key = farmIdRef.current
      ? `bde_vessel_zone_filter_${farmIdRef.current}`
      : null;
    if (key) {
      setItem(key, next).catch(() => {
        /* Keep the current in-memory selection if persistence fails. */
      });
    }
  }, []);

  const visibleZoneFilter =
    farmId && loadedForFarm.current === farmId ? zoneFilter : [];

  return [visibleZoneFilter, setZoneFilter];
}