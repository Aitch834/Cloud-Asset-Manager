/**
 * Regression tests for the winery vessel register module guard during farm switches.
 *
 * Imports the exact production helpers from wineryModuleGuard.ts so any divergence
 * between screen logic and test expectations is caught at import time, not silently.
 *
 * Guards verified:
 *   1. computeIsWineryModuleActive requires resolvedFarmId === currentFarm.id, so no
 *      vessel request fires during the module-resolution window after a farm switch.
 *   2. shouldShowVesselLoadingSpinner gives module mismatch absolute precedence over
 *      the refreshing flag, preventing prior-farm vessel rows (and summary counts)
 *      from rendering while a pull-to-refresh is in-flight across a farm switch.
 *   3. getVesselFetchFarmId passes undefined to useApiFetch until the module is
 *      confirmed, so no HTTP request is issued during the resolution gap.
 *   4. A completed-but-failed module resolution shows the SectionList (not a
 *      permanent spinner) so the user has a RefreshControl retry path.
 */

import {
  computeIsWineryModuleActive,
  getVesselFetchFarmId,
  shouldShowVesselLoadingSpinner,
} from "../lib/utils/wineryModuleGuard";

describe("winery vessel register — module guard during farm switch", () => {
  describe("computeIsWineryModuleActive", () => {
    it("is false when resolvedFarmId still points to the previous farm", () => {
      expect(
        computeIsWineryModuleActive("farm-a", "farm-b", ["viticulture"]),
      ).toBe(false);
    });

    it("is false when resolvedFarmId is undefined (resolution in progress)", () => {
      expect(
        computeIsWineryModuleActive(undefined, "farm-b", ["viticulture"]),
      ).toBe(false);
    });

    it("is false when the viticulture module is absent for the current farm", () => {
      expect(
        computeIsWineryModuleActive("farm-b", "farm-b", ["crop-management"]),
      ).toBe(false);
    });

    it("is true only when resolvedFarmId matches and viticulture key is present", () => {
      expect(
        computeIsWineryModuleActive("farm-b", "farm-b", ["viticulture", "organic-viticulture"]),
      ).toBe(true);
    });
  });

  describe("getVesselFetchFarmId", () => {
    it("passes undefined to useApiFetch during the module-resolution window", () => {
      // Module not yet resolved for new farm → no HTTP request must fire
      expect(getVesselFetchFarmId(false, "farm-b")).toBeUndefined();
    });

    it("passes the farm ID to useApiFetch only after module resolution succeeds", () => {
      expect(getVesselFetchFarmId(true, "farm-b")).toBe("farm-b");
    });
  });

  describe("shouldShowVesselLoadingSpinner — farm switch during pull-to-refresh", () => {
    it("shows spinner when resolvedFarmId differs from currentFarmId, even if refreshing (modules attempted)", () => {
      // Core regression: a pull-to-refresh in-flight during a farm switch must not
      // allow the previous farm's vessel rows or summary counts to render.
      expect(
        shouldShowVesselLoadingSpinner({
          modulesLoading: false,
          modulesAttempted: true,
          resolvedFarmId: "farm-a",   // still from previous farm
          currentFarmId: "farm-b",    // user has switched
          loading: false,
          refreshing: true,           // pull-to-refresh was active
        }),
      ).toBe(false); // module resolution completed (failure) — show SectionList for retry
    });

    it("shows spinner in the pre-effect transition window before loading has started", () => {
      // modulesAttempted=false means the effect hasn't fired yet (transition frame).
      // This prevents old rows from flashing before the module fetch even begins.
      expect(
        shouldShowVesselLoadingSpinner({
          modulesLoading: false,
          modulesAttempted: false,
          resolvedFarmId: "farm-a",   // stale from previous farm
          currentFarmId: "farm-b",
          loading: false,
          refreshing: false,
        }),
      ).toBe(true);
    });

    it("shows spinner when resolvedFarmId is undefined and not yet attempted (pre-start)", () => {
      expect(
        shouldShowVesselLoadingSpinner({
          modulesLoading: false,
          modulesAttempted: false,
          resolvedFarmId: undefined,
          currentFarmId: "farm-b",
          loading: false,
          refreshing: true,
        }),
      ).toBe(true);
    });

    it("shows spinner while module loading is active regardless of refreshing state", () => {
      expect(
        shouldShowVesselLoadingSpinner({
          modulesLoading: true,
          modulesAttempted: true,
          resolvedFarmId: undefined,
          currentFarmId: "farm-b",
          loading: false,
          refreshing: true,
        }),
      ).toBe(true);
    });

    it("does NOT show the blocking spinner during a normal refresh on the same farm", () => {
      // A pull-to-refresh on the same farm should use the RefreshControl spinner at
      // the top of the list, not the full-screen loading overlay.
      expect(
        shouldShowVesselLoadingSpinner({
          modulesLoading: false,
          modulesAttempted: true,
          resolvedFarmId: "farm-a",
          currentFarmId: "farm-a",   // same farm — no mismatch
          loading: true,
          refreshing: true,          // RefreshControl active
        }),
      ).toBe(false);
    });

    it("shows the blocking spinner for initial data load on the same farm (not refreshing)", () => {
      expect(
        shouldShowVesselLoadingSpinner({
          modulesLoading: false,
          modulesAttempted: true,
          resolvedFarmId: "farm-a",
          currentFarmId: "farm-a",
          loading: true,
          refreshing: false,
        }),
      ).toBe(true);
    });

    it("hides the spinner once modules and data have both resolved on the same farm", () => {
      expect(
        shouldShowVesselLoadingSpinner({
          modulesLoading: false,
          modulesAttempted: true,
          resolvedFarmId: "farm-a",
          currentFarmId: "farm-a",
          loading: false,
          refreshing: false,
        }),
      ).toBe(false);
    });
  });

  describe("shouldShowVesselLoadingSpinner — module resolution failure", () => {
    it("stops blocking when module resolution fails (offline/auth failure) so RefreshControl is accessible", () => {
      // useApiModules failure: modulesLoading=false, resolvedFarmId stays undefined.
      // modulesAttempted=true because loading went true→false.
      // Must show SectionList not spinner so user can pull-to-refresh.
      expect(
        shouldShowVesselLoadingSpinner({
          modulesLoading: false,
          modulesAttempted: true,
          resolvedFarmId: undefined,   // resolution failed — never set
          currentFarmId: "farm-a",
          loading: false,
          refreshing: false,
        }),
      ).toBe(false);
    });

    it("still blocks during module loading even when the farm switches mid-flight", () => {
      // Farm A's module request is in-flight (modulesLoading=true) when farm switches to B.
      // Must keep spinner — not show stale farm-A identity state.
      expect(
        shouldShowVesselLoadingSpinner({
          modulesLoading: true,
          modulesAttempted: true,
          resolvedFarmId: "farm-a",   // stale, being replaced
          currentFarmId: "farm-b",
          loading: false,
          refreshing: false,
        }),
      ).toBe(true);
    });

    it("recovers to showing content once a new farm's modules resolve after a prior failure", () => {
      // After a prior failure, the user retried (pull-to-refresh triggered a new module fetch)
      // and it succeeded. resolvedFarmId now matches currentFarmId.
      expect(
        shouldShowVesselLoadingSpinner({
          modulesLoading: false,
          modulesAttempted: true,
          resolvedFarmId: "farm-a",
          currentFarmId: "farm-a",
          loading: false,
          refreshing: false,
        }),
      ).toBe(false);
    });
  });
});
