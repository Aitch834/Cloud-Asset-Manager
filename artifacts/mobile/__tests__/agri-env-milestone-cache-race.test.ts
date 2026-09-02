import {
  canApplyMilestoneLoad,
  mergeMilestone,
  persistMilestoneCacheUpdate,
} from "../lib/agriEnvMilestoneCache";

interface CachedMilestone {
  id: number;
  evidenceNotes: string | null;
  status: string;
}

describe("agri-environment milestone detail cache refresh", () => {
  it("merges a saved response into a freshly fetched farm-wide list", () => {
    const farmMilestones = [
      {
        id: 17,
        status: "pending",
        completionDate: null,
        claimAmountPence: null,
        evidenceNotes: "Original evidence note",
      },
      {
        id: 23,
        status: "paid",
        completionDate: "2026-08-01",
        claimAmountPence: 25000,
        evidenceNotes: "Already paid",
      },
    ];
    const savedMilestone = {
      id: 17,
      status: "submitted",
      completionDate: "2026-09-02",
      claimAmountPence: 123456,
      evidenceNotes: "Updated on site",
    };

    expect(mergeMilestone(farmMilestones, savedMilestone)).toEqual([
      savedMilestone,
      farmMilestones[1],
    ]);
  });

  it("creates a readable fallback list when the farm-wide cache was absent", () => {
    const savedMilestone = {
      id: 17,
      status: "paid",
      completionDate: "2026-09-02",
      claimAmountPence: 123456,
      evidenceNotes: "Force-quit persistence check",
    };

    expect(mergeMilestone([], savedMilestone)).toEqual([savedMilestone]);
  });

  it("persists both caches before an absent-list bootstrap GET resolves", async () => {
    const savedMilestone = {
      id: 17,
      status: "paid",
      completionDate: "2026-09-02",
      claimAmountPence: 123456,
      evidenceNotes: "Force-quit persistence check",
    };
    const projectWrites: typeof savedMilestone[][] = [];
    const allWrites: typeof savedMilestone[][] = [];
    let resolveHydration!: (milestones: typeof savedMilestone[]) => void;
    const pendingHydration = new Promise<typeof savedMilestone[]>((resolve) => {
      resolveHydration = resolve;
    });

    const result = await persistMilestoneCacheUpdate({
      updated: savedMilestone,
      projectMilestones: [],
      allMilestones: null,
      persistProjectMilestones: async (milestones) => {
        projectWrites.push(milestones);
      },
      persistAllMilestones: async (milestones) => {
        allWrites.push(milestones);
      },
      hydrateAllMilestones: () => pendingHydration,
    });

    expect(projectWrites).toEqual([[savedMilestone]]);
    expect(allWrites).toEqual([[savedMilestone]]);

    resolveHydration([
      savedMilestone,
      { ...savedMilestone, id: 23, evidenceNotes: "Another project" },
    ]);
    await result.hydration;
    expect(allWrites[1]).toHaveLength(2);
  });

  it("keeps the confirmed save when a pre-save GET resolves afterwards", async () => {
    const staleMilestones: CachedMilestone[] = [{
      id: 17,
      evidenceNotes: "Original evidence note",
      status: "pending",
    }];
    const savedMilestones: CachedMilestone[] = [{
      id: 17,
      evidenceNotes: "Updated on site",
      status: "submitted",
    }];

    let currentMutationVersion = 0;
    const preSaveRequestVersion = currentMutationVersion;
    let cachedMilestones = staleMilestones;
    let resolveDelayedGet!: (milestones: CachedMilestone[]) => void;
    const delayedGet = new Promise<CachedMilestone[]>((resolve) => {
      resolveDelayedGet = resolve;
    });

    const applyDelayedGet = delayedGet.then((milestones) => {
      if (canApplyMilestoneLoad(preSaveRequestVersion, currentMutationVersion)) {
        cachedMilestones = milestones;
      }
    });

    // A successful PUT advances the version and writes the confirmed response.
    currentMutationVersion += 1;
    cachedMilestones = savedMilestones;

    // The older GET completes last and must not overwrite the saved cache.
    resolveDelayedGet(staleMilestones);
    await applyDelayedGet;

    expect(cachedMilestones).toEqual(savedMilestones);
  });
});