/**
 * Pure logic helpers for the ScoutingPhotoLightbox component.
 * Kept in a separate file so they can be unit-tested without importing
 * any React Native modules.
 */

// Keep the pre-existing import path stable for current screens and tests while
// the gesture/display contract lives in the scouting-specific module.
export {
  clampIndexAfterDelete,
  showLeftChevron,
  showRightChevron,
  showCounter,
  counterText,
  currentPhotoId,
  shouldAllowSwipe,
  getSwipeDirection,
} from "./vineScoutingLightboxHelpers";

export type ScoutingPaginationItem = number | "leading-ellipsis" | "trailing-ellipsis";

/**
 * Synchronously claim the delete confirmation for a photo view.
 * React state updates are not immediate, so a ref-backed claim prevents rapid
 * repeated taps from opening or queueing more than one confirmation.
 */
export function claimDeleteConfirmation(lock: { current: boolean }): boolean {
  if (lock.current) return false;
  lock.current = true;
  return true;
}

/**
 * Derive the id of the photo that Share / Delete should target.
 * Always resolves from the current display index so that navigating
 * between photos before confirming an action targets the shown photo,
 * not the one originally tapped to open the lightbox.
 */
/**
 * Claim the one automatic retry allowed for a photo view and schedule it.
 * Returns null when a retry has already been claimed, even if the first
 * scheduled attempt subsequently fails.
 */
export function scheduleScoutingPhotoAutoRetry(
  autoRetried: { current: boolean },
  schedule: (
    callback: () => void | Promise<void>,
    delayMs: number,
  ) => ReturnType<typeof setTimeout>,
  callback: () => void | Promise<void>,
  delayMs = 2000,
): ReturnType<typeof setTimeout> | null {
  if (autoRetried.current) return null;
  autoRetried.current = true;
  return schedule(callback, delayMs);
}

/**
 * Apply a caption save to the matching photo without relying on its array
 * position.  The lightbox index can change while the PATCH is in flight, so
 * caption updates must follow the stable photo ID rather than the current
 * display index.
 */
export function updatePhotoCaption<T extends { id: number; caption: string | null }>(
  photos: ReadonlyArray<T>,
  photoId: number,
  caption: string | null,
): T[] {
  return photos.map((photo) =>
    photo.id === photoId ? { ...photo, caption } : photo,
  );
}

/**
 * Apply a full-list refresh without letting a response that started before a
 * caption save replace that newer local caption. Other server fields still
 * refresh normally.
 */
export function mergeRefreshedPhotoCaptions<T extends { id: number; caption: string | null }>(
  refreshedPhotos: ReadonlyArray<T>,
  currentPhotos: ReadonlyArray<T>,
  captionRevisions: ReadonlyMap<number, number>,
  refreshStartedAtRevision: number,
): T[] {
  const currentById = new Map(currentPhotos.map((photo) => [photo.id, photo]));

  return refreshedPhotos.map((photo) => {
    const captionRevision = captionRevisions.get(photo.id) ?? 0;
    const currentPhoto = currentById.get(photo.id);
    if (captionRevision <= refreshStartedAtRevision || !currentPhoto) return photo;
    return { ...photo, caption: currentPhoto.caption };
  });
}
export function isPaginationItemActive(
  item: ScoutingPaginationItem,
  currentIndex: number,
): boolean {
  return typeof item === "number" && item === currentIndex;
}

/**
 * Return a bounded set of photo positions for the lightbox pagination row.
 * The active position and both ends remain visible while ellipses represent
 * skipped positions in larger photo sets.
 */
export function getPaginationItems(
  photosCount: number,
  currentIndex: number,
): ScoutingPaginationItem[] {
  if (photosCount <= 0) return [];

  const safeIndex = Math.min(Math.max(currentIndex, 0), photosCount - 1);
  const maxItems = 7;
  if (photosCount <= maxItems) {
    return Array.from({ length: photosCount }, (_, index) => index);
  }

  const lastIndex = photosCount - 1;
  if (safeIndex <= 2) {
    return [
      ...Array.from({ length: maxItems - 2 }, (_, index) => index),
      "trailing-ellipsis",
      lastIndex,
    ];
  }

  if (safeIndex >= photosCount - 3) {
    return [
      0,
      "leading-ellipsis",
      ...Array.from({ length: maxItems - 2 }, (_, index) => lastIndex - (maxItems - 3) + index),
    ];
  }

  return [
    0,
    "leading-ellipsis",
    safeIndex - 1,
    safeIndex,
    safeIndex + 1,
    "trailing-ellipsis",
    lastIndex,
  ];
}
