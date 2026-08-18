/**
 * Gesture threshold constants shared by every photo lightbox in the app.
 *
 * Both vine-block-photos.tsx and vine-spray-diary.tsx import from here so that
 * a single threshold change automatically updates all lightbox implementations
 * simultaneously — no silent drift between viewers.
 *
 * The unit tests in __tests__/vine-block-lightbox-gestures.test.ts also import
 * from here, so a threshold change updates the test expectations at the same time
 * as the production behaviour.
 */

/** Minimum downward translation (px) required to dismiss the lightbox. */
export const SWIPE_DOWN_THRESHOLD = 120;

/** Minimum horizontal translation (px) required to navigate between photos. */
export const SWIPE_HORIZ_THRESHOLD = 60;

/** Minimum scale factor (identity / no zoom). */
export const MIN_SCALE = 1;

/** Maximum pinch-to-zoom scale factor. */
export const MAX_SCALE = 5;
