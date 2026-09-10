export type CoverPhoto = {
  id: number;
  isCover: boolean;
};

/**
 * Accept refreshed photo data without allowing a response that started before
 * a successful cover change to restore stale cover flags.
 */
export function mergeRefreshedPhotoCover<T extends CoverPhoto>(
  refreshedPhotos: T[],
  currentPhotos: T[],
  refreshStartedAtRevision: number,
  currentCoverRevision: number,
): T[] {
  if (currentCoverRevision <= refreshStartedAtRevision) return refreshedPhotos;

  const currentCoverById = new Map(
    currentPhotos.map((photo) => [photo.id, photo.isCover]),
  );
  return refreshedPhotos.map((photo) => ({
    ...photo,
    isCover: currentCoverById.get(photo.id) ?? photo.isCover,
  }));
}