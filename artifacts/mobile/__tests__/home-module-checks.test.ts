import {
  getDairyHomeShortcut,
  getHomeModuleChecks,
  shouldShowViticultureComplianceGaps,
} from "../lib/homeModuleChecks";

const unlinkedCounts = {
  scouting: 1,
  sprayDiary: 0,
  phenology: 0,
  harvest: 0,
  operations: 0,
};

describe("home module checks", () => {
  it("keeps viticulture compliance-gap banners hidden while the dashboard is loading", () => {
    expect(getHomeModuleChecks(null)).toMatchObject({
      activeModuleKeys: [],
      isViticultureActive: false,
    });
    expect(shouldShowViticultureComplianceGaps(null, unlinkedCounts)).toBe(false);
  });

  it("shows viticulture compliance-gap banners after the dashboard resolves", () => {
    const dashboardData = { activeModuleKeys: ["viticulture"] };

    expect(getHomeModuleChecks(dashboardData, true).isViticultureActive).toBe(true);
    expect(
      shouldShowViticultureComplianceGaps(dashboardData, unlinkedCounts, true),
    ).toBe(true);
  });

  it("hides stale module-specific banners during a reload or after failure", () => {
    const previousDashboardData = { activeModuleKeys: ["viticulture"] };

    expect(
      shouldShowViticultureComplianceGaps(
        previousDashboardData,
        unlinkedCounts,
        false,
      ),
    ).toBe(false);
  });

  it("hides the previous farm's module checks during a farm switch", () => {
    const previousFarmDashboardData = {
      activeModuleKeys: ["organic-viticulture"],
    };

    expect(getHomeModuleChecks(previousFarmDashboardData, false)).toMatchObject({
      activeModuleKeys: [],
      isViticultureActive: false,
      isOrganicActive: false,
    });
  });

  it("refreshes the Mastitis History shortcut across dairy farm switches", () => {
    const dairyDashboard = { activeModuleKeys: ["dairy-management"] };
    const nonDairyDashboard = { activeModuleKeys: ["livestock-management"] };

    const dairyModules = getHomeModuleChecks(dairyDashboard, true);
    expect(getDairyHomeShortcut(dairyModules.activeModuleKeys)).toEqual({
      title: "Mastitis History",
      route: "/mastitis-history",
    });

    const switchingModules = getHomeModuleChecks(dairyDashboard, false);
    expect(getDairyHomeShortcut(switchingModules.activeModuleKeys)).toBeNull();

    const nonDairyModules = getHomeModuleChecks(nonDairyDashboard, true);
    expect(getDairyHomeShortcut(nonDairyModules.activeModuleKeys)).toBeNull();

    const switchingBackModules = getHomeModuleChecks(nonDairyDashboard, false);
    expect(getDairyHomeShortcut(switchingBackModules.activeModuleKeys)).toBeNull();

    const refreshedDairyModules = getHomeModuleChecks(dairyDashboard, true);
    expect(getDairyHomeShortcut(refreshedDairyModules.activeModuleKeys)).toEqual({
      title: "Mastitis History",
      route: "/mastitis-history",
    });
  });
});
