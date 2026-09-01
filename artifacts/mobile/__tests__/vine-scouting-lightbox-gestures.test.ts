/**
 * Gesture regression tests for the scouting photo lightbox used by
 * vine-scouting.tsx through ScoutingPhotoSection.
 *
 * These assertions target pure helpers so they run without React Native.
 */

import {
  MAX_SCALE,
  MIN_SCALE,
  SWIPE_DOWN_THRESHOLD,
  SWIPE_HORIZ_THRESHOLD,
  SWIPE_THRESHOLD,
  clampIndexAfterDelete,
  clampScale,
  counterText,
  getSwipeDirection,
  navigationIndexAfterSwipe,
  resolveHorizSwipe,
  showCounter,
  shouldAllowSwipe,
  swipeDownShouldDismiss,
} from "../lib/vineScoutingLightboxHelpers";

describe("scouting lightbox counter display", () => {
  it("only shows the counter for multiple photos", () => {
    expect(showCounter(0)).toBe(false);
    expect(showCounter(1)).toBe(false);
    expect(showCounter(2)).toBe(true);
  });

  it("formats the current one-based position", () => {
    expect(counterText(0, 3)).toBe("1 / 3");
    expect(counterText(2, 3)).toBe("3 / 3");
  });
});

describe(`scouting lightbox swipe-down threshold (${SWIPE_DOWN_THRESHOLD}px)`, () => {
  it("requires a downward drag beyond the shared threshold", () => {
    expect(swipeDownShouldDismiss(SWIPE_DOWN_THRESHOLD)).toBe(false);
    expect(swipeDownShouldDismiss(SWIPE_DOWN_THRESHOLD + 1)).toBe(true);
    expect(swipeDownShouldDismiss(-SWIPE_DOWN_THRESHOLD - 1)).toBe(false);
  });
});

describe("scouting lightbox horizontal navigation", () => {
  it("preserves the existing PanResponder threshold", () => {
    expect(getSwipeDirection(false, -SWIPE_THRESHOLD)).toBeNull();
    expect(getSwipeDirection(false, -(SWIPE_THRESHOLD + 1))).toBe("next");
    expect(getSwipeDirection(false, SWIPE_THRESHOLD + 1)).toBe("previous");
  });

  it("uses gallery boundaries when resolving shared horizontal gestures", () => {
    expect(resolveHorizSwipe(-(SWIPE_HORIZ_THRESHOLD + 1), SWIPE_HORIZ_THRESHOLD, 0, 3)).toBe("next");
    expect(resolveHorizSwipe(SWIPE_HORIZ_THRESHOLD + 1, SWIPE_HORIZ_THRESHOLD, 2, 3)).toBe("prev");
    expect(resolveHorizSwipe(SWIPE_HORIZ_THRESHOLD + 1, SWIPE_HORIZ_THRESHOLD, 0, 3)).toBe("snap");
    expect(resolveHorizSwipe(-(SWIPE_HORIZ_THRESHOLD + 1), SWIPE_HORIZ_THRESHOLD, 2, 3)).toBe("snap");
  });

  it("updates the counter after a resolved navigation swipe", () => {
    const result = resolveHorizSwipe(-80, SWIPE_HORIZ_THRESHOLD, 0, 3);
    const nextIndex = navigationIndexAfterSwipe(result, 0);
    expect(nextIndex).toBe(1);
    expect(counterText(nextIndex, 3)).toBe("2 / 3");
  });
});

describe("scouting lightbox delete guard", () => {
  it("closes when no photos remain and clamps to a surviving photo otherwise", () => {
    expect(clampIndexAfterDelete(0, 0)).toBe(-1);
    expect(clampIndexAfterDelete(2, 2)).toBe(1);
    expect(clampIndexAfterDelete(1, 2)).toBe(1);
  });

  it("blocks gesture start and release while deletion is active", () => {
    expect(shouldAllowSwipe(true, -100, 0)).toBe(false);
    expect(getSwipeDirection(true, -100)).toBeNull();
    expect(shouldAllowSwipe(false, -100, 0)).toBe(true);
  });
});

describe(`scouting lightbox zoom clamping [${MIN_SCALE}, ${MAX_SCALE}]`, () => {
  it("clamps scales below and above the shared lightbox bounds", () => {
    expect(clampScale(MIN_SCALE - 1)).toBe(MIN_SCALE);
    expect(clampScale(2.5)).toBe(2.5);
    expect(clampScale(MAX_SCALE + 1)).toBe(MAX_SCALE);
  });
});