import React from "react";
import { useBarrelAlertContext } from "../context/BarrelAlertContext";
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
 *
 * Subscribes to BarrelAlertContext so the badge re-evaluates immediately after
 * a successful barrel fill or maintenance write without requiring an app restart.
 */
export function useBarrelAlertCount(
  farmId: string | undefined,
  isViticultureActive: boolean,
  idleBarrelDays?: number | null,
  approachingNeutralFills?: number | null,
): number {
  const { refreshKey } = useBarrelAlertContext();
  const thresholds = useBarrelAlertThresholds(
    idleBarrelDays,
    approachingNeutralFills,
    isViticultureActive,
  );
  // Pass undefined farmId when viticulture is inactive to skip the fetch entirely
  const { records, refresh } = useApiFetch<WineryVesselSummary>(
    isViticultureActive ? farmId : undefined,
    "/api/farms/:farmId/winery-vessels"
  );

  // Trigger a re-fetch whenever a barrel write succeeds, skipping the initial mount.
  const isFirstMount = React.useRef(true);
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

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
