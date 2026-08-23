/**
 * Regression test: prior-farm organic-vit derogation response must not update
 * state when the user switches farms before the in-flight fetch completes.
 *
 * Tests the `isResponseCurrentForFarm` guard extracted into farmRequestGuard.ts,
 * which is used in the load callback of organic-vit-derogations.tsx to discard
 * stale responses after a farm switch.
 */

import { isResponseCurrentForFarm } from "../lib/utils/farmRequestGuard";

describe("organic-vit derogations — farm-switch request guard", () => {
  describe("isResponseCurrentForFarm", () => {
    it("returns false when the farm changed between request start and response", () => {
      // Simulates: request initiated for farm A, farm switched to B before response
      const capturedFarmId = "farm-a";
      const activeFarmId = "farm-b"; // user has switched
      expect(isResponseCurrentForFarm(capturedFarmId, activeFarmId)).toBe(false);
    });

    it("returns false when capturedFarmId is undefined (guard should not apply)", () => {
      expect(isResponseCurrentForFarm(undefined, "farm-b")).toBe(false);
    });

    it("returns false when activeFarmId is undefined (farm was cleared)", () => {
      expect(isResponseCurrentForFarm("farm-a", undefined)).toBe(false);
    });

    it("returns true when the same farm is still active at response time", () => {
      expect(isResponseCurrentForFarm("farm-a", "farm-a")).toBe(true);
    });
  });

  describe("async request race simulation", () => {
    it("discards prior-farm setCases call when farm switches during in-flight fetch", async () => {
      // Simulate the exact race described in the screen:
      //   1. load() is called for farm A — it captures farmA as myFarmId
      //   2. User switches to farm B — activeFarmId changes
      //   3. Farm A's response arrives — guard check discards it

      let activeFarmId = "farm-a";
      const setCases = jest.fn();

      // Simulate a fetch that resolves after the farm switches
      const fetchPromise = Promise.resolve({ cases: [{ id: 1, inputName: "Farm A case" }] });

      // Simulate the load() body for farm A
      const myFarmId = activeFarmId; // captured at request start

      // --- farm switches to B before fetch completes ---
      activeFarmId = "farm-b";

      // Fetch resolves — guard must prevent setCases being called
      const data = await fetchPromise;
      if (isResponseCurrentForFarm(myFarmId, activeFarmId)) {
        setCases(data.cases);
      }

      expect(setCases).not.toHaveBeenCalled();
    });

    it("applies the response when the farm has not changed", async () => {
      let activeFarmId = "farm-a";
      const setCases = jest.fn();

      const fetchPromise = Promise.resolve({ cases: [{ id: 1, inputName: "Farm A case" }] });
      const myFarmId = activeFarmId;

      // No farm switch — activeFarmId stays the same
      const data = await fetchPromise;
      if (isResponseCurrentForFarm(myFarmId, activeFarmId)) {
        setCases(data.cases);
      }

      expect(setCases).toHaveBeenCalledWith([{ id: 1, inputName: "Farm A case" }]);
    });

    it("discards a late-arriving response even if another farm's request is already in flight", async () => {
      let activeFarmId = "farm-a";
      const setCases = jest.fn();

      // Request for farm A starts
      const farmAFetch = Promise.resolve({ cases: [{ id: 1, inputName: "Farm A case" }] });
      const myFarmIdA = activeFarmId;

      // Farm switches to B and immediately starts its own request
      activeFarmId = "farm-b";
      const farmBFetch = Promise.resolve({ cases: [{ id: 2, inputName: "Farm B case" }] });
      const myFarmIdB = activeFarmId;

      // Farm A resolves first — must be discarded
      const dataA = await farmAFetch;
      if (isResponseCurrentForFarm(myFarmIdA, activeFarmId)) {
        setCases(dataA.cases);
      }
      expect(setCases).not.toHaveBeenCalled();

      // Farm B resolves — must be applied
      const dataB = await farmBFetch;
      if (isResponseCurrentForFarm(myFarmIdB, activeFarmId)) {
        setCases(dataB.cases);
      }
      expect(setCases).toHaveBeenCalledWith([{ id: 2, inputName: "Farm B case" }]);
    });
  });
});
