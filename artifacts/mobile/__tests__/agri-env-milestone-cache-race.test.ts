import { canApplyMilestoneLoad } from "../lib/agriEnvMilestoneCache";

interface CachedMilestone {
  id: number;
  evidenceNotes: string | null;
  status: string;
}

describe("agri-environment milestone detail cache refresh", () => {
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