import { shouldShowModuleLoading } from "../lib/utils/moduleLoadingGuard";

describe("module loading farm-switch guard", () => {
  it.each([
    ["water-irrigation direct form", "water-irrigation"],
    ["organic-livestock record cards", "organic-livestock"],
  ])("hides %s on the first render after switching from a settled farm", (_label, _moduleKey) => {
    expect(
      shouldShowModuleLoading({
        currentFarmId: "farm-b",
        attemptedFarmId: "farm-a",
        resolvedFarmId: "farm-a",
        modulesLoading: false,
      }),
    ).toBe(true);
  });

  it("continues blocking while the current farm request is loading", () => {
    expect(
      shouldShowModuleLoading({
        currentFarmId: "farm-b",
        attemptedFarmId: "farm-b",
        resolvedFarmId: undefined,
        modulesLoading: true,
      }),
    ).toBe(true);
  });

  it("shows the current farm after module resolution succeeds", () => {
    expect(
      shouldShowModuleLoading({
        currentFarmId: "farm-b",
        attemptedFarmId: "farm-b",
        resolvedFarmId: "farm-b",
        modulesLoading: false,
      }),
    ).toBe(false);
  });

  it("preserves the offline fallback after the current farm attempt fails", () => {
    expect(
      shouldShowModuleLoading({
        currentFarmId: "farm-b",
        attemptedFarmId: "farm-b",
        resolvedFarmId: undefined,
        modulesLoading: false,
      }),
    ).toBe(false);
  });
});