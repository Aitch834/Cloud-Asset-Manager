import { useState, useEffect, useRef } from "react";
import { useFarm } from "@/lib/context/FarmContext";
import { apiFetch } from "@/lib/apiFetch";

export type AlertLevel = "national" | "regional" | "notice";

export interface DiseaseAlertData {
  active: boolean;
  level?: AlertLevel;
  message?: string;
  issuedAt?: string;
  date?: string;
}

export type DiseaseAlertSector = "beef" | "dairy" | "sheep" | "goat" | "pig";

/**
 * Fetches the sector disease alert from /api/{sector}-alert and returns the
 * active alert data, or null when inactive or the fetch fails.
 * Callers treat null as "no banner to show". Fails silently; alerts are advisory.
 *
 * Safety: clears the previous farm's alert immediately when farmId/sector
 * changes, and guards the async response with a request-identity counter so
 * only the current farm's response can update state. Switching farms while a
 * fetch is in-flight will never display the prior farm's alert.
 */
export function useDiseaseAlert(sector: DiseaseAlertSector): DiseaseAlertData | null {
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;
  const [alert, setAlert] = useState<DiseaseAlertData | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    // Immediately clear so no prior farm's banner lingers
    setAlert(null);

    if (!farmId) return;

    const requestId = ++requestIdRef.current;

    void (async () => {
      try {
        const res = await apiFetch(`/api/${sector}-alert?farmId=${farmId}`);
        if (!res.ok) return;
        const data = (await res.json()) as DiseaseAlertData;
        // Only commit if this is still the active request for the current farm
        if (requestId === requestIdRef.current) {
          setAlert(data?.active ? data : null);
        }
      } catch {
        // Advisory only — fail silently; null state already cleared above
      }
    })();

    return () => {
      // Invalidate any in-flight request when farmId or sector changes
      requestIdRef.current++;
    };
  }, [farmId, sector]);

  return alert;
}
