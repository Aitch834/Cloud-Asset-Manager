/**
 * Pure gesture and display helpers for the scouting photo lightbox.
 *
 * This module deliberately has no React Native or Expo imports so the
 * lightbox contract can be regression-tested in the Node/Jest environment.
 * The scouting viewer uses the shared down-swipe and zoom bounds so its
 * gesture values stay aligned with the other vineyard photo viewers.
 */

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

/** The scouting viewer's existing horizontal swipe threshold, in pixels. */
export const SWIPE_THRESHOLD = 50;

// ---------------------------------------------------------------------------
// Counter and navigation controls
// ---------------------------------------------------------------------------

export function showCounter(photosCount: number): boolean {
  return photosCount > 1;
}

export function counterText(currentIndex: number, photosCount: number): string {
  return `${currentIndex + 1} / ${photosCount}`;
}

export function showLeftChevron(photosCount: number, currentIndex: number): boolean {
  return photosCount > 1 && currentIndex > 0;
}

export function showRightChevron(photosCount: number, currentIndex: number): boolean {
  return photosCount > 1 && currentIndex < photosCount - 1;
}

// ---------------------------------------------------------------------------
// Gesture direction and swipe outcomes
// ---------------------------------------------------------------------------

export const DIR_NONE = 0;
export const DIR_HORIZ = 1;
export const DIR_VERT = 2;

export type GestureDir = typeof DIR_NONE | typeof DIR_HORIZ | typeof DIR_VERT;

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

export function swipeDownShouldDismiss(
  translationY: number,
  threshold = SWIPE_DOWN_THRESHOLD,
): boolean {
  return translationY > threshold;
}

export type SwipeHorizResult = "prev" | "next" | "snap";

export function resolveHorizSwipe(
  translationX: number,
  threshold = SWIPE_HORIZ_THRESHOLD,
  currentIndex: number,
  totalPhotos: number,
): SwipeHorizResult {
  if (translationX < -threshold && currentIndex < totalPhotos - 1) return "next";
  if (translationX > threshold && currentIndex > 0) return "prev";
  return "snap";
}

export function navigationIndexAfterSwipe(
  result: SwipeHorizResult,
  currentIndex: number,
): number {
  if (result === "next") return currentIndex + 1;
  if (result === "prev") return currentIndex - 1;
  return currentIndex;
}

/**
 * Whether a horizontal navigation gesture should be allowed to start.
 * Deletion takes priority so a gesture cannot race with a photo removal.
 */
export function shouldAllowSwipe(deleting: boolean, dx: number, dy: number): boolean {
  return !deleting && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
}

/**
 * Resolve a completed scouting horizontal swipe.  The strict comparison
 * preserves the existing behavior at exactly the threshold.
 */
export function getSwipeDirection(
  deleting: boolean,
  dx: number,
  threshold = SWIPE_THRESHOLD,
): "next" | "previous" | null {
  if (deleting || Math.abs(dx) <= threshold) return null;
  return dx < 0 ? "next" : "previous";
}

// ---------------------------------------------------------------------------
// Delete guard and zoom bounds
// ---------------------------------------------------------------------------

/** Returns -1 when the photos array is empty, otherwise a safe index. */
export function clampIndexAfterDelete(currentIndex: number, newLength: number): number {
  if (newLength === 0) return -1;
  return Math.min(currentIndex, newLength - 1);
}

export function currentPhotoId(
  photos: ReadonlyArray<{ id: number }>,
  currentIndex: number,
): number | null {
  return photos[currentIndex]?.id ?? null;
}

/** Clamp a pinch scale to the shared lightbox range. */
export function clampScale(
  rawScale: number,
  minScale = MIN_SCALE,
  maxScale = MAX_SCALE,
): number {
  return Math.min(Math.max(rawScale, minScale), maxScale);
}