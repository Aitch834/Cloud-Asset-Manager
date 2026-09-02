import type { FarmDashboardData } from "@/lib/hooks/useApiFarmDashboard";

export interface HomeModuleChecks {
  activeModuleKeys: string[];
  isViticultureActive: boolean;
  isOrganicActive: boolean;
}

export interface HomeUnlinkedCounts {
  scouting: number;
  sprayDiary: number;
  phenology: number;
  harvest: number;
  operations: number;
}

export function getHomeModuleChecks(
  dashboardData: Pick<FarmDashboardData, "activeModuleKeys"> | null | undefined,
  dashboardResolvedForCurrentFarm = true,
): HomeModuleChecks {
  const activeModuleKeys = dashboardResolvedForCurrentFarm
    ? dashboardData?.activeModuleKeys ?? []
    : [];

  return {
    activeModuleKeys,
    isViticultureActive:
      activeModuleKeys.includes("viticulture") ||
      activeModuleKeys.includes("organic-viticulture"),
    isOrganicActive: activeModuleKeys.includes("organic-compliance"),
  };
}

/**
 * Module-specific compliance data is not trustworthy until the dashboard
 * response has identified the farm's modules. A failed or still-loading
 * response therefore hides the banner rather than guessing that viticulture
 * is enabled.
 */
export function shouldShowViticultureComplianceGaps(
  dashboardData: Pick<FarmDashboardData, "activeModuleKeys"> | null | undefined,
  counts: HomeUnlinkedCounts,
  dashboardResolvedForCurrentFarm = true,
): boolean {
  const { isViticultureActive } = getHomeModuleChecks(
    dashboardData,
    dashboardResolvedForCurrentFarm,
  );
  return (
    isViticultureActive &&
    Object.values(counts).some((count) => count > 0)
  );
}