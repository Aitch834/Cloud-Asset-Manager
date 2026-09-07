/**
 * A detail fetch must not apply after a confirmed milestone mutation has
 * advanced the cache version. This keeps a delayed GET from replacing the
 * server-confirmed detail and offline-cache values with an older snapshot.
 */
export function canApplyMilestoneLoad(
  requestMutationVersion: number,
  currentMutationVersion: number,
): boolean {
  return requestMutationVersion === currentMutationVersion;
}

export function mergeMilestone<T extends { id: number }>(
  milestones: T[],
  updated: T,
): T[] {
  return milestones.some((milestone) => milestone.id === updated.id)
    ? milestones.map((milestone) =>
        milestone.id === updated.id ? { ...milestone, ...updated } : milestone,
      )
    : [...milestones, updated];
}

interface PersistMilestoneCacheUpdateOptions<T extends { id: number }> {
  updated: T;
  projectMilestones: T[];
  allMilestones: T[] | null;
  persistProjectMilestones: (milestones: T[]) => Promise<void>;
  persistAllMilestones: (milestones: T[]) => Promise<void>;
  hydrateAllMilestones?: () => Promise<T[]>;
  canApplyHydration?: () => boolean;
}

interface PersistMilestoneCacheUpdateResult {
  hydration: Promise<void> | null;
}

interface ConfirmedMilestoneSaveResult<T> {
  milestone: T;
  offlineAvailable: boolean;
}

/**
 * Keep a successful server save authoritative even when the device cannot
 * persist the matching offline cache entry.
 */
export async function confirmMilestoneSave<T>(
  milestone: T,
  persistCache: (milestone: T) => Promise<void>,
): Promise<ConfirmedMilestoneSaveResult<T>> {
  try {
    await persistCache(milestone);
    return { milestone, offlineAvailable: true };
  } catch {
    return { milestone, offlineAvailable: false };
  }
}

/**
 * Persist the confirmed edit before starting any optional network hydration.
 * This ordering is what makes a force-quit during hydration safe.
 */
export async function persistMilestoneCacheUpdate<T extends { id: number }>(
  options: PersistMilestoneCacheUpdateOptions<T>,
): Promise<PersistMilestoneCacheUpdateResult> {
  const updatedProjectMilestones = mergeMilestone(
    options.projectMilestones,
    options.updated,
  );
  const immediateAllMilestones = mergeMilestone(
    options.allMilestones ?? updatedProjectMilestones,
    options.updated,
  );

  await Promise.all([
    options.persistProjectMilestones(updatedProjectMilestones),
    options.persistAllMilestones(immediateAllMilestones),
  ]);

  if (options.allMilestones || !options.hydrateAllMilestones) {
    return { hydration: null };
  }

  const hydration = options
    .hydrateAllMilestones()
    .then(async (freshMilestones) => {
      if (options.canApplyHydration && !options.canApplyHydration()) return;
      await options.persistAllMilestones(
        mergeMilestone(freshMilestones, options.updated),
      );
    })
    .catch(() => {
      // The immediate project-scoped fallback is already durable.
    });

  return { hydration };
}