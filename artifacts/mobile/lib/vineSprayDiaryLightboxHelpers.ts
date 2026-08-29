/**
 * Pure logic helpers for the VineSprayDiaryPhotoLightbox component.
 *
 * Kept in a separate file so they can be unit-tested without importing any
 * React Native or Expo modules.
 *
 * IMPORTANT: vine-spray-diary.tsx should import the threshold constants and
 * direction-lock values from this file.  The unit tests in
 * __tests__/vine-spray-diary-lightbox-gestures.test.ts also import from here.
 * Changing a constant here therefore simultaneously updates both the
 * component's runtime behaviour and the test expectations — no silent drift.
 *
 * The gesture thresholds and helper logic intentionally mirror
 * vineBlockLightboxHelpers.ts so that both photo viewers behave identically.
 * If the vine-block thresholds are ever tuned, update this file in lockstep.
 */

// ---------------------------------------------------------------------------
// Gesture threshold constants — canonical source is lightboxGestureConstants.ts
// ---------------------------------------------------------------------------

import {
  SWIPE_DOWN_THRESHOLD,
  SWIPE_HORIZ_THRESHOLD,
  MIN_SCALE,
  MAX_SCALE,
} from "./lightboxGestureConstants";

export {
  SWIPE_DOWN_THRESHOLD,
  SWIPE_HORIZ_THRESHOLD,
  MIN_SCALE,
  MAX_SCALE,
};

// ---------------------------------------------------------------------------
// Counter display
// ---------------------------------------------------------------------------

/**
 * Whether the "X / N" counter should be shown.
 * Only rendered when there are multiple photos.
 */
export function showCounter(photosCount: number): boolean {
  return photosCount > 1;
}

/**
 * Human-readable counter label, e.g. "2 / 5".
 */
export function counterText(currentIndex: number, photosCount: number): string {
  return `${currentIndex + 1} / ${photosCount}`;
}

// ---------------------------------------------------------------------------
// Gesture direction lock
// ---------------------------------------------------------------------------

/** Axis not yet determined (not enough movement). */
export const DIR_NONE = 0;
/** Gesture is predominantly horizontal (navigation / pan-while-zoomed). */
export const DIR_HORIZ = 1;
/** Gesture is predominantly vertical (swipe-down-to-dismiss). */
export const DIR_VERT = 2;

export type GestureDir = typeof DIR_NONE | typeof DIR_HORIZ | typeof DIR_VERT;

/**
 * Decide the gesture direction lock from the accumulated translation on the
 * first frame that exceeds the movement threshold (8 px in the component).
 *
 * Returns DIR_NONE when movement is still below the threshold so the caller
 * can skip locking until there is enough signal.
 */
export function resolveGestureDir(
  translationX: number,
  translationY: number,
  movementThreshold = 8,
): GestureDir {
  const absX = Math.abs(translationX);
  const absY = Math.abs(translationY);
  if (absX < movementThreshold && absY < movementThreshold) return DIR_NONE;
  return absX >= absY ? DIR_HORIZ : DIR_VERT;
}

// ---------------------------------------------------------------------------
// Swipe-down dismiss
// ---------------------------------------------------------------------------

/**
 * Whether a vertical swipe is strong enough to dismiss the lightbox.
 *
 * Only downward swipes (positive translationY) can dismiss; an upward swipe
 * always snaps back.
 */
export function swipeDownShouldDismiss(
  translationY: number,
  threshold = SWIPE_DOWN_THRESHOLD,
): boolean {
  return translationY > threshold;
}

// ---------------------------------------------------------------------------
// Horizontal swipe navigation
// ---------------------------------------------------------------------------

export type SwipeHorizResult = "prev" | "next" | "snap";

/**
 * Resolve the outcome of a horizontal swipe gesture.
 *
 * - "next" : swipe-left past threshold and a next photo exists
 * - "prev" : swipe-right past threshold and a previous photo exists
 * - "snap" : below threshold, or at a boundary — snap back to current photo
 *
 * @param translationX  Final horizontal translation (negative = swipe left).
 * @param threshold     Minimum absolute translation to trigger navigation (60 px).
 * @param currentIndex  Zero-based index of the currently displayed photo.
 * @param totalPhotos   Total number of photos in the gallery.
 */
export function resolveHorizSwipe(
  translationX: number,
  threshold: number,
  currentIndex: number,
  totalPhotos: number,
): SwipeHorizResult {
  if (translationX < -threshold && currentIndex < totalPhotos - 1) return "next";
  if (translationX > threshold && currentIndex > 0) return "prev";
  return "snap";
}

/**
 * New zero-based photo index after a resolved horizontal swipe.
 * Returns the unchanged index when the result is "snap".
 */
export function navigationIndexAfterSwipe(
  result: SwipeHorizResult,
  currentIndex: number,
): number {
  if (result === "next") return currentIndex + 1;
  if (result === "prev") return currentIndex - 1;
  return currentIndex;
}

// ---------------------------------------------------------------------------
// Delete / shrink guard (mirrors PhotoLightbox's useEffect)
// ---------------------------------------------------------------------------

/**
 * Clamp or close the lightbox when the photos array shrinks.
 *
 * Returns -1 (close signal) when the array is empty, otherwise returns the
 * clamped index that keeps the lightbox open on the nearest remaining photo.
 */
export function clampIndexAfterDelete(
  currentIndex: number,
  newLength: number,
): number {
  if (newLength === 0) return -1;
  return Math.min(currentIndex, newLength - 1);
}

/**
 * Resolve the displayed index after the photo array changes.
 *
 * When the displayed photo still exists, follow its stable ID because deleting
 * an earlier photo shifts its index. When that ID was deleted, preserve the
 * last displayed index and clamp it into the new array so the next photo in
 * that slot is shown (or the previous photo when the old last photo was
 * deleted). Returns -1 when no photos remain.
 */
export function displayedIndexAfterPhotosChange(
  photos: ReadonlyArray<{ id: number }>,
  displayedPhotoId: number | null,
  lastDisplayedIndex: number,
): number {
  if (photos.length === 0) return -1;
  if (displayedPhotoId != null) {
    const survivingIndex = photos.findIndex((photo) => photo.id === displayedPhotoId);
    if (survivingIndex >= 0) return survivingIndex;
  }
  return clampIndexAfterDelete(lastDisplayedIndex, photos.length);
}

// ---------------------------------------------------------------------------
// Share / Delete photo targeting
// ---------------------------------------------------------------------------

/**
 * Derive the id of the photo that Share / Delete should target.
 *
 * Always resolves from the current display index so that navigating between
 * photos before confirming an action targets the shown photo, not the one
 * originally tapped to open the lightbox.
 *
 * Returns null when the photos array is empty or the index is out of range.
 */
export function currentPhotoId(
  photos: ReadonlyArray<{ id: number }>,
  currentIndex: number,
): number | null {
  return photos[currentIndex]?.id ?? null;
}

// ---------------------------------------------------------------------------
// Pinch-to-zoom boundary
// ---------------------------------------------------------------------------

/**
 * Clamp a pinch scale value to the allowed range [MIN_SCALE, MAX_SCALE].
 * Mirrors the `clamp()` worklet used inside the component.
 */
export function clampScale(
  rawScale: number,
  minScale = MIN_SCALE,
  maxScale = MAX_SCALE,
): number {
  return Math.min(Math.max(rawScale, minScale), maxScale);
}
