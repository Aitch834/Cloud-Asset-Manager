/**
 * Unit tests for VineBlockPhotoLightbox gesture and counter logic.
 *
 * All assertions target pure helpers in lib/vineBlockLightboxHelpers.ts so
 * there is no React Native dependency and the tests run in the plain Node/Jest
 * environment.
 *
 * Covered behaviours (mirroring the component constants in vine-block-photos.tsx):
 *
 *   SWIPE_DOWN_THRESHOLD  = 120 px
 *   SWIPE_HORIZ_THRESHOLD =  60 px
 *   Direction-lock threshold =  8 px
 *   MIN_SCALE = 1, MAX_SCALE = 5
 *
 * Sections:
 *   1. Counter display (showCounter / counterText)
 *   2. Gesture direction lock (resolveGestureDir)
 *   3. Swipe-down dismiss (swipeDownShouldDismiss)
 *   4. Horizontal swipe navigation (resolveHorizSwipe / navigationIndexAfterSwipe)
 *   5. Delete / shrink guard (clampIndexAfterDelete)
 *   6. Pinch-to-zoom clamping (clampScale)
 *   7. End-to-end swipe sequences
 */

import {
  showCounter,
  counterText,
  DIR_NONE,
  DIR_HORIZ,
  DIR_VERT,
  resolveGestureDir,
  swipeDownShouldDismiss,
  resolveHorizSwipe,
  navigationIndexAfterSwipe,
  clampIndexAfterDelete,
  clampScale,
  SWIPE_DOWN_THRESHOLD,
  SWIPE_HORIZ_THRESHOLD,
  MIN_SCALE,
  MAX_SCALE,
} from "../lib/vineBlockLightboxHelpers";
// NOTE: vine-block-photos.tsx imports these same constants from this module.
// Changing SWIPE_DOWN_THRESHOLD, SWIPE_HORIZ_THRESHOLD, MIN_SCALE, or
// MAX_SCALE in vineBlockLightboxHelpers.ts therefore updates both the
// component behaviour and these test expectations simultaneously.

// ===========================================================================
// 1. Counter display
// ===========================================================================

describe("showCounter", () => {
  it("is hidden for 0 photos", () => {
    expect(showCounter(0)).toBe(false);
  });

  it("is hidden for exactly 1 photo", () => {
    expect(showCounter(1)).toBe(false);
  });

  it("is shown for 2 photos", () => {
    expect(showCounter(2)).toBe(true);
  });

  it("is shown for many photos", () => {
    expect(showCounter(10)).toBe(true);
  });
});

describe("counterText", () => {
  it("formats the first photo as '1 / N'", () => {
    expect(counterText(0, 3)).toBe("1 / 3");
  });

  it("formats the last photo as 'N / N'", () => {
    expect(counterText(2, 3)).toBe("3 / 3");
  });

  it("reflects an interior position correctly", () => {
    expect(counterText(1, 3)).toBe("2 / 3");
  });

  it("updates after swiping to photo 2", () => {
    // User is on photo 1 (index 0), swipes left → index 1
    const nextIndex = 0 + 1;
    expect(counterText(nextIndex, 5)).toBe("2 / 5");
  });

  it("updates after swiping back to photo 1", () => {
    // User is on photo 2 (index 1), swipes right → index 0
    const prevIndex = 1 - 1;
    expect(counterText(prevIndex, 5)).toBe("1 / 5");
  });
});

// ===========================================================================
// 2. Gesture direction lock
// ===========================================================================

describe("resolveGestureDir — below movement threshold", () => {
  it("returns DIR_NONE when both axes are below the 8 px threshold", () => {
    expect(resolveGestureDir(0, 0)).toBe(DIR_NONE);
    expect(resolveGestureDir(7, 0)).toBe(DIR_NONE);
    expect(resolveGestureDir(0, 7)).toBe(DIR_NONE);
    expect(resolveGestureDir(5, 5)).toBe(DIR_NONE);
  });

  it("returns DIR_NONE with a custom threshold not yet met", () => {
    expect(resolveGestureDir(9, 9, 10)).toBe(DIR_NONE);
  });
});

describe("resolveGestureDir — horizontal lock", () => {
  it("locks horizontal when |translationX| > |translationY|", () => {
    expect(resolveGestureDir(20, 5)).toBe(DIR_HORIZ);
  });

  it("locks horizontal when |translationX| === |translationY| (tie goes horizontal)", () => {
    // The component uses >= so equal magnitudes resolve to horizontal
    expect(resolveGestureDir(15, 15)).toBe(DIR_HORIZ);
  });

  it("locks horizontal for a pure left swipe", () => {
    expect(resolveGestureDir(-80, 3)).toBe(DIR_HORIZ);
  });

  it("locks horizontal for a pure right swipe", () => {
    expect(resolveGestureDir(90, -2)).toBe(DIR_HORIZ);
  });
});

describe("resolveGestureDir — vertical lock", () => {
  it("locks vertical when |translationY| > |translationX|", () => {
    expect(resolveGestureDir(5, 20)).toBe(DIR_VERT);
  });

  it("locks vertical for a pure downward drag", () => {
    expect(resolveGestureDir(1, 150)).toBe(DIR_VERT);
  });

  it("locks vertical for an upward drag (negative Y)", () => {
    // Upward drags are still classified as vertical; the dismiss guard
    // separately checks that translationY > 0.
    expect(resolveGestureDir(2, -60)).toBe(DIR_VERT);
  });
});

// ===========================================================================
// 3. Swipe-down dismiss (SWIPE_DOWN_THRESHOLD = 120)
// ===========================================================================

describe(`swipeDownShouldDismiss — default threshold ${SWIPE_DOWN_THRESHOLD}`, () => {
  it("does NOT dismiss at exactly the threshold (must exceed, not equal)", () => {
    expect(swipeDownShouldDismiss(SWIPE_DOWN_THRESHOLD)).toBe(false);
  });

  it("dismisses at threshold + 1 px", () => {
    expect(swipeDownShouldDismiss(SWIPE_DOWN_THRESHOLD + 1)).toBe(true);
  });

  it("dismisses well above the threshold", () => {
    expect(swipeDownShouldDismiss(400)).toBe(true);
  });

  it("does NOT dismiss below the threshold", () => {
    expect(swipeDownShouldDismiss(SWIPE_DOWN_THRESHOLD - 1)).toBe(false);
    expect(swipeDownShouldDismiss(50)).toBe(false);
  });

  it("does NOT dismiss for an upward swipe (negative translationY)", () => {
    expect(swipeDownShouldDismiss(-150)).toBe(false);
  });

  it("does NOT dismiss at zero movement", () => {
    expect(swipeDownShouldDismiss(0)).toBe(false);
  });
});

describe("swipeDownShouldDismiss — custom threshold", () => {
  it("respects a custom threshold value", () => {
    expect(swipeDownShouldDismiss(50, 50)).toBe(false);
    expect(swipeDownShouldDismiss(51, 50)).toBe(true);
  });
});

// ===========================================================================
// 4. Horizontal swipe navigation (SWIPE_HORIZ_THRESHOLD = 60)
// ===========================================================================

describe(`resolveHorizSwipe — snap-back cases (threshold ${SWIPE_HORIZ_THRESHOLD})`, () => {
  it("snaps back when movement is below the threshold", () => {
    expect(resolveHorizSwipe(-(SWIPE_HORIZ_THRESHOLD - 1), SWIPE_HORIZ_THRESHOLD, 1, 5)).toBe("snap");
    expect(resolveHorizSwipe(SWIPE_HORIZ_THRESHOLD - 1, SWIPE_HORIZ_THRESHOLD, 1, 5)).toBe("snap");
  });

  it("snaps back at exactly the threshold (must exceed, not equal)", () => {
    expect(resolveHorizSwipe(-SWIPE_HORIZ_THRESHOLD, SWIPE_HORIZ_THRESHOLD, 1, 5)).toBe("snap");
    expect(resolveHorizSwipe(SWIPE_HORIZ_THRESHOLD, SWIPE_HORIZ_THRESHOLD, 1, 5)).toBe("snap");
  });

  it("snaps back at the first photo when swiping right (no previous)", () => {
    expect(resolveHorizSwipe(90, SWIPE_HORIZ_THRESHOLD, 0, 5)).toBe("snap");
  });

  it("snaps back at the last photo when swiping left (no next)", () => {
    expect(resolveHorizSwipe(-90, SWIPE_HORIZ_THRESHOLD, 4, 5)).toBe("snap");
  });

  it("snaps back for zero movement", () => {
    expect(resolveHorizSwipe(0, SWIPE_HORIZ_THRESHOLD, 2, 5)).toBe("snap");
  });
});

describe("resolveHorizSwipe — advance to next photo", () => {
  it("returns 'next' when swipe-left exceeds threshold and next photo exists", () => {
    expect(resolveHorizSwipe(-(SWIPE_HORIZ_THRESHOLD + 1), SWIPE_HORIZ_THRESHOLD, 0, 3)).toBe("next");
    expect(resolveHorizSwipe(-200, SWIPE_HORIZ_THRESHOLD, 1, 3)).toBe("next");
  });

  it("returns 'next' from the first photo in a three-photo gallery", () => {
    expect(resolveHorizSwipe(-80, SWIPE_HORIZ_THRESHOLD, 0, 3)).toBe("next");
  });

  it("returns 'next' from the middle of a gallery", () => {
    expect(resolveHorizSwipe(-80, SWIPE_HORIZ_THRESHOLD, 1, 3)).toBe("next");
  });
});

describe("resolveHorizSwipe — go back to previous photo", () => {
  it("returns 'prev' when swipe-right exceeds threshold and previous photo exists", () => {
    expect(resolveHorizSwipe(SWIPE_HORIZ_THRESHOLD + 1, SWIPE_HORIZ_THRESHOLD, 1, 3)).toBe("prev");
    expect(resolveHorizSwipe(200, SWIPE_HORIZ_THRESHOLD, 2, 3)).toBe("prev");
  });

  it("returns 'prev' from the last photo in a three-photo gallery", () => {
    expect(resolveHorizSwipe(80, SWIPE_HORIZ_THRESHOLD, 2, 3)).toBe("prev");
  });
});

describe("navigationIndexAfterSwipe", () => {
  it("increments index on 'next'", () => {
    expect(navigationIndexAfterSwipe("next", 0)).toBe(1);
    expect(navigationIndexAfterSwipe("next", 1)).toBe(2);
  });

  it("decrements index on 'prev'", () => {
    expect(navigationIndexAfterSwipe("prev", 2)).toBe(1);
    expect(navigationIndexAfterSwipe("prev", 1)).toBe(0);
  });

  it("leaves index unchanged on 'snap'", () => {
    expect(navigationIndexAfterSwipe("snap", 0)).toBe(0);
    expect(navigationIndexAfterSwipe("snap", 3)).toBe(3);
  });
});

// ===========================================================================
// 5. Delete / shrink guard (mirrors PhotoLightbox useEffect)
// ===========================================================================

describe("clampIndexAfterDelete — empty gallery closes lightbox", () => {
  it("returns -1 (close signal) when the photos array is now empty", () => {
    expect(clampIndexAfterDelete(0, 0)).toBe(-1);
  });
});

describe("clampIndexAfterDelete — stays open on surviving photos", () => {
  it("returns 0 when only 1 photo remains after deletion", () => {
    expect(clampIndexAfterDelete(1, 1)).toBe(0);
  });

  it("stays at the current index when the deleted photo was after it", () => {
    // 3 photos [A,B,C]; viewing B (index 1); C deleted → [A,B]; newLength=2
    expect(clampIndexAfterDelete(1, 2)).toBe(1);
  });

  it("clamps down when the current photo is deleted", () => {
    // 3 photos [A,B,C]; viewing C (index 2); C deleted → [A,B]; newLength=2
    expect(clampIndexAfterDelete(2, 2)).toBe(1);
  });

  it("clamps down when deleted from the boundary", () => {
    // 5 photos; at index 4 (last); photo deleted → newLength=4
    expect(clampIndexAfterDelete(4, 4)).toBe(3);
  });
});

// ===========================================================================
// 6. Pinch-to-zoom clamping (MIN_SCALE=1, MAX_SCALE=5)
// ===========================================================================

describe(`clampScale — default bounds [${MIN_SCALE}, ${MAX_SCALE}]`, () => {
  it("allows MIN_SCALE (identity / not zoomed)", () => {
    expect(clampScale(MIN_SCALE)).toBe(MIN_SCALE);
  });

  it("clamps below MIN_SCALE to MIN_SCALE", () => {
    expect(clampScale(MIN_SCALE - 0.5)).toBe(MIN_SCALE);
    expect(clampScale(0)).toBe(MIN_SCALE);
    expect(clampScale(-2)).toBe(MIN_SCALE);
  });

  it("allows scale up to MAX_SCALE", () => {
    expect(clampScale(MAX_SCALE)).toBe(MAX_SCALE);
    expect(clampScale(2.5)).toBe(2.5);
  });

  it("clamps above MAX_SCALE to MAX_SCALE", () => {
    expect(clampScale(MAX_SCALE + 1)).toBe(MAX_SCALE);
    expect(clampScale(100)).toBe(MAX_SCALE);
  });
});

describe("clampScale — custom bounds", () => {
  it("respects custom min/max", () => {
    expect(clampScale(0.5, 0.5, 3)).toBe(0.5);
    expect(clampScale(4, 0.5, 3)).toBe(3);
  });
});

// ===========================================================================
// 7. End-to-end swipe sequences
//    Simulate realistic user journeys through a 3-photo gallery.
// ===========================================================================

describe("3-photo gallery — full navigation sequence", () => {
  const TOTAL = 3;
  const HORIZ_THRESHOLD = SWIPE_HORIZ_THRESHOLD;

  it("swipe-left twice walks from photo 1 → 2 → 3, then snaps at the end", () => {
    let index = 0;

    // Swipe left from photo 1 → 2
    const r1 = resolveHorizSwipe(-80, HORIZ_THRESHOLD, index, TOTAL);
    expect(r1).toBe("next");
    index = navigationIndexAfterSwipe(r1, index); // 1
    expect(counterText(index, TOTAL)).toBe("2 / 3");

    // Swipe left from photo 2 → 3
    const r2 = resolveHorizSwipe(-80, HORIZ_THRESHOLD, index, TOTAL);
    expect(r2).toBe("next");
    index = navigationIndexAfterSwipe(r2, index); // 2
    expect(counterText(index, TOTAL)).toBe("3 / 3");

    // Swipe left from photo 3 — boundary, must snap back
    const r3 = resolveHorizSwipe(-80, HORIZ_THRESHOLD, index, TOTAL);
    expect(r3).toBe("snap");
    index = navigationIndexAfterSwipe(r3, index); // still 2
    expect(counterText(index, TOTAL)).toBe("3 / 3");
  });

  it("swipe-right from photo 1 snaps back (at start boundary)", () => {
    let index = 0;
    const r = resolveHorizSwipe(80, HORIZ_THRESHOLD, index, TOTAL);
    expect(r).toBe("snap");
    index = navigationIndexAfterSwipe(r, index);
    expect(counterText(index, TOTAL)).toBe("1 / 3");
  });

  it("insufficient swipe keeps the counter unchanged", () => {
    // Grower barely moves a finger (30 px) — should snap back
    let index = 1;
    const r = resolveHorizSwipe(-30, HORIZ_THRESHOLD, index, TOTAL);
    expect(r).toBe("snap");
    index = navigationIndexAfterSwipe(r, index);
    expect(counterText(index, TOTAL)).toBe("2 / 3");
  });
});

describe("swipe-down dismiss at various positions", () => {
  it("dismisses from the first photo on a strong downward swipe", () => {
    expect(swipeDownShouldDismiss(150)).toBe(true);
  });

  it("dismisses from a mid-gallery photo on a strong downward swipe", () => {
    // index doesn't affect the dismiss threshold — purely based on translationY
    expect(swipeDownShouldDismiss(200)).toBe(true);
  });

  it("does NOT dismiss on a gentle downward scroll (e.g. 80 px)", () => {
    expect(swipeDownShouldDismiss(80)).toBe(false);
  });

  it("direction lock prevents a diagonal from triggering dismiss", () => {
    // A user drags at roughly 45° but X > Y — locked to horizontal
    const dir = resolveGestureDir(50, 40);
    expect(dir).toBe(DIR_HORIZ);
    // In horizontal lock, the component does NOT call swipeDownShouldDismiss
    // so even translationY=200 would not dismiss — we verify by checking lock.
    expect(dir).not.toBe(DIR_VERT);
  });
});

describe("zoom state prevents navigation swipe", () => {
  it("scale above 1 means pan applies, not navigation — direction lock irrelevant", () => {
    // When scale > 1 the component enters free-pan mode and returns early from
    // the direction-lock logic.  Verify the scale boundary is correctly clamped.
    const zoomedIn = clampScale(2.0);
    expect(zoomedIn).toBeGreaterThan(1);
    // At this scale the navigation swipe would NOT fire.
    // The helper validates only the scale boundary; component logic guards the rest.
  });
});
