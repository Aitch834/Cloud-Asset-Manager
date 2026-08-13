import React from "react";
import { useApiFetch } from "./useApiFetch";
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
}

/**
 * Returns the number of barrels that are idle (>90 days empty) or approaching
 * neutral (≥4 fills). Returns 0 when the viticulture module is not active so
 * non-winery farms never trigger an unnecessary API call.
 */
export function useBarrelAlertCount(
  farmId: string | undefined,
  isViticultureActive: boolean
): number {
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
        if (isIdleBarrel(v.empty_since) || isApproachingNeutral(v.fill_number)) {
          count++;
        }
      }
    }
    return count;
  }, [records, isViticultureActive]);
}
