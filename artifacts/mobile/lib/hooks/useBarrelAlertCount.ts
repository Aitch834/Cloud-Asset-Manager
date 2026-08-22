import React from "react";
import { useApiFetch } from "./useApiFetch";
import { useBarrelAlertThresholds } from "./useBarrelAlertThresholds";
import {
  isBarrelType,
  isIdleBarrel,
  isApproachingNeutral,
} from "../utils/vesselAlerts";

interface WineryVesselSummary {
  vessel_type: string | null;
  status: string | null;
  empty_since: string | null;
  fill_number: number | null;
  fill_count: number | null;
}

/**
 * Returns the total number of barrels that are idle (empty for longer than the
 * resolved farm or platform idle threshold), approaching neutral (at or above
 * the resolved farm or platform neutral-fill threshold), or have no fills logged.
 * Returns 0 when the viticulture module is not active so non-winery farms never
 * trigger an unnecessary API call.
 */
export function useBarrelAlertCount(
  farmId: string | undefined,
  isViticultureActive: boolean,
  idleBarrelDays?: number | null,
  approachingNeutralFills?: number | null,
): number {
  const thresholds = useBarrelAlertThresholds(
    idleBarrelDays,
    approachingNeutralFills,
    isViticultureActive,
  );
  // Pass undefined farmId when viticulture is inactive to skip the fetch entirely
  const { records } = useApiFetch<WineryVesselSummary>(
    isViticultureActive ? farmId : undefined,
    "/api/farms/:farmId/winery-vessels"
  );

  return React.useMemo(() => {
    if (!isViticultureActive) return 0;
    let count = 0;
    for (const v of records) {
      if (isBarrelType(v.vessel_type) && String(v.status ?? "active") === "active") {
        if (
          isIdleBarrel(v.empty_since, thresholds.idleBarrelDays) ||
          isApproachingNeutral(v.fill_number, thresholds.approachingNeutralFills) ||
          Number(v.fill_count ?? 0) === 0
        ) {
          count++;
        }
      }
    }
    return count;
  }, [records, isViticultureActive, thresholds.idleBarrelDays, thresholds.approachingNeutralFills]);
}
