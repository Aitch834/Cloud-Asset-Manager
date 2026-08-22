import { useEffect, useState } from "react";

import { getApiBase } from "@/lib/uploadPhoto";
import {
  APPROACHING_NEUTRAL_FILLS,
  IDLE_BARREL_DAYS,
  resolveBarrelAlertThreshold,
} from "../utils/vesselAlerts";

type PlatformBarrelDefaults = {
  idleBarrelDays: unknown;
  approachingNeutralFills: unknown;
};

let cachedPlatformBarrelDefaults: PlatformBarrelDefaults | null = null;
let platformDefaultsRequest: Promise<PlatformBarrelDefaults | null> | null = null;

async function loadPlatformBarrelDefaults(): Promise<PlatformBarrelDefaults | null> {
  if (cachedPlatformBarrelDefaults) return cachedPlatformBarrelDefaults;
  if (platformDefaultsRequest) return platformDefaultsRequest;

  const apiBase = getApiBase();
  if (!apiBase) return null;

  platformDefaultsRequest = fetch(`${apiBase}/api/platform-config`)
    .then(async (response) => {
      if (!response.ok) return null;
      const data = await response.json() as { config?: Record<string, unknown> };
      const defaults = {
        idleBarrelDays: data.config?.barrel_idle_days_default,
        approachingNeutralFills: data.config?.barrel_neutral_fills_default,
      };
      cachedPlatformBarrelDefaults = defaults;
      return defaults;
    })
    .catch(() => null)
    .finally(() => {
      platformDefaultsRequest = null;
    });

  return platformDefaultsRequest;
}

/**
 * Resolves winery barrel-alert thresholds consistently on mobile:
 * farm override → cached platform default → built-in offline fallback.
 */
export function useBarrelAlertThresholds(
  idleBarrelDaysOverride?: number | null,
  approachingNeutralFillsOverride?: number | null,
  enabled = true,
): { idleBarrelDays: number; approachingNeutralFills: number } {
  const [platformDefaults, setPlatformDefaults] = useState<PlatformBarrelDefaults | null>(
    cachedPlatformBarrelDefaults,
  );

  useEffect(() => {
    if (!enabled) return;
    let isMounted = true;
    void loadPlatformBarrelDefaults().then((defaults) => {
      if (isMounted && defaults) setPlatformDefaults(defaults);
    });
    return () => {
      isMounted = false;
    };
  }, [enabled]);

  return {
    idleBarrelDays: resolveBarrelAlertThreshold(
      idleBarrelDaysOverride,
      platformDefaults?.idleBarrelDays,
      IDLE_BARREL_DAYS,
    ),
    approachingNeutralFills: resolveBarrelAlertThreshold(
      approachingNeutralFillsOverride,
      platformDefaults?.approachingNeutralFills,
      APPROACHING_NEUTRAL_FILLS,
    ),
  };
}