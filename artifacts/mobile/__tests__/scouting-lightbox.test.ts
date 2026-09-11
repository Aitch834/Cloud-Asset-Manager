/**
 * Unit tests for ScoutingPhotoLightbox edge-case logic.
 *
 * All assertions exercise pure helpers extracted from the lightbox component
 * so there is no React Native dependency and the tests run in the node
 * Jest environment.
 *
 * Covered cases:
 *   1. Single photo → no chevrons, no counter
 *   2. Delete last photo → close signal (index -1)
 *   3. Delete middle photo → index clamps to adjacent photo
 *   4. Delete last photo in list (at boundary) → index clamps down
 *   5. Left chevron hidden at index 0
 *   6. Right chevron hidden at last index
 *   7. Both chevrons visible when navigating in the middle
 *   8. Counter text always reflects current position
 *   9. Share / Delete target the currently displayed photo, not the tapped one
 *  11. Auto-retry schedules at most one timer per photo view
 *  12. Navigating cancels the old retry and restores the new photo's allowance
 */

import {
  clampIndexAfterDelete,
  showLeftChevron,
  showRightChevron,
  showCounter,
  counterText,
  getPaginationItems,
  isPaginationItemActive,
  currentPhotoId,
  getSwipeDirection,
  cancelScoutingPhotoAutoRetry,
  claimDeleteConfirmation,
  mergeRefreshedPhotoCaptions,
  scheduleScoutingPhotoAutoRetry,
  updatePhotoCaption,
  shouldAllowSwipe,
} from "../lib/scoutingLightboxHelpers";
import { mergeRefreshedPhotoCover } from "../lib/photoCoverTransition";

// ---------------------------------------------------------------------------
// 1. Single photo — no chevrons, no counter
// ---------------------------------------------------------------------------

describe("single photo", () => {
  it("does not show the left chevron", () => {
    expect(showLeftChevron(1, 0)).toBe(false);
  });

  it("does not show the right chevron", () => {
    expect(showRightChevron(1, 0)).toBe(false);
  });

  it("does not show the counter", () => {
    expect(showCounter(1)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. Delete last photo → lightbox should close (index -1)
// ---------------------------------------------------------------------------

describe("clampIndexAfterDelete — delete last photo closes lightbox", () => {
  it("returns -1 (close signal) when the photos array is now empty", () => {
    expect(clampIndexAfterDelete(0, 0)).toBe(-1);
  });

  it("returns -1 regardless of which index was shown when array empties", () => {
    // Should never happen in practice (only one photo), but guard the invariant.
    expect(clampIndexAfterDelete(0, 0)).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// 3. Delete a middle photo — index clamps to adjacent photo (stays open)
// ---------------------------------------------------------------------------

describe("clampIndexAfterDelete — delete middle photo stays open on adjacent", () => {
  it("stays at the same index when a later photo is deleted (index < newLength)", () => {
    // 3 photos [A,B,C]; user is at index 0; C is deleted externally → [A,B]
    // index 0 is still valid and unchanged.
    expect(clampIndexAfterDelete(0, 2)).toBe(0);
  });

  it("clamps down when the current photo itself was deleted (index === newLength)", () => {
    // 3 photos [A,B,C]; user is at index 2; C deleted → [A,B]; newLength=2
    // index 2 is out of bounds → clamp to 1
    expect(clampIndexAfterDelete(2, 2)).toBe(1);
  });

  it("clamps down when deleted from the middle and index exceeds newLength", () => {
    // 5 photos; user at index 4 (last); 2 deleted externally → newLength=3
    expect(clampIndexAfterDelete(4, 3)).toBe(2);
  });

  it("stays at index 1 when at position 1 and list shrinks from 3 to 2", () => {
    // User at index 1 [A,B,C]; A is deleted → [B,C]; newLength=2; index 1 still valid
    expect(clampIndexAfterDelete(1, 2)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 4. Delete last item in a multi-photo list (rightmost boundary)
// ---------------------------------------------------------------------------

describe("clampIndexAfterDelete — delete rightmost photo", () => {
  it("moves back to the new last photo when the current last photo is deleted", () => {
    // 4 photos [A,B,C,D]; user at 3 (D); D deleted → [A,B,C]; newLength=3
    expect(clampIndexAfterDelete(3, 3)).toBe(2);
  });

  it("returns the only remaining photo index (0) after second-to-last deletion", () => {
    // 2 photos [A,B]; user at 1 (B); B deleted → [A]; newLength=1
    expect(clampIndexAfterDelete(1, 1)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 5 & 6. Chevron boundary visibility
// ---------------------------------------------------------------------------

describe("showLeftChevron", () => {
  it("is hidden at index 0 (first photo)", () => {
    expect(showLeftChevron(3, 0)).toBe(false);
  });

  it("is visible at index 1+", () => {
    expect(showLeftChevron(3, 1)).toBe(true);
    expect(showLeftChevron(3, 2)).toBe(true);
  });

  it("is hidden even at index > 0 when there is only one photo", () => {
    // Defensive: index should never be > 0 with one photo, but guard anyway.
    expect(showLeftChevron(1, 0)).toBe(false);
  });
});

describe("showRightChevron", () => {
  it("is hidden at the last index", () => {
    expect(showRightChevron(3, 2)).toBe(false);
    expect(showRightChevron(1, 0)).toBe(false);
  });

  it("is visible when not at the last photo", () => {
    expect(showRightChevron(3, 0)).toBe(true);
    expect(showRightChevron(3, 1)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. Both chevrons visible in the middle
// ---------------------------------------------------------------------------

describe("chevrons — middle of a multi-photo set", () => {
  it("shows both chevrons when the user is at an interior photo", () => {
    const count = 5;
    const index = 2; // interior
    expect(showLeftChevron(count, index)).toBe(true);
    expect(showRightChevron(count, index)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. Counter text always reflects current position
// ---------------------------------------------------------------------------

describe("showCounter / counterText", () => {
  it("shows counter only for multiple photos", () => {
    expect(showCounter(0)).toBe(false);
    expect(showCounter(1)).toBe(false);
    expect(showCounter(2)).toBe(true);
    expect(showCounter(10)).toBe(true);
  });

  it("formats counter as '1 / N' for the first photo", () => {
    expect(counterText(0, 5)).toBe("1 / 5");
  });

  it("formats counter as 'N / N' for the last photo", () => {
    expect(counterText(4, 5)).toBe("5 / 5");
  });

  it("reflects the correct position after navigation", () => {
    expect(counterText(2, 7)).toBe("3 / 7");
  });

  it("updates correctly after index clamp (delete last photo in list)", () => {
    // Was at index 4 of 5, deleted last → clamp to 3 of 4
    const newIndex = clampIndexAfterDelete(2, 2);
    expect(counterText(newIndex, 4)).toBe("4 / 4");
  });
});

// ---------------------------------------------------------------------------
// 9. Bounded pagination indicators keep the active position visible
// ---------------------------------------------------------------------------

describe("getPaginationItems", () => {
  it("shows every position for a small multi-photo set", () => {
    expect(getPaginationItems(5, 2)).toEqual([0, 1, 2, 3, 4]);
  });

  it("bounds a large set while keeping both ends and the active position", () => {
    const items = getPaginationItems(7, newIndex);

    expect(items).toEqual([0, "leading-ellipsis", 49, 50, 51, "trailing-ellipsis", 99]);
    expect(items).toHaveLength(7);
    expect(items).toContain(50);
  });

  it("moves the active window after navigation", () => {
    const beforeSwipe = getPaginationItems(100, 50);
    const afterSwipe = getPaginationItems(100, 51);

    expect(beforeSwipe.filter((item) => isPaginationItemActive(item, 50))).toEqual([50]);
    expect(afterSwipe.filter((item) => isPaginationItemActive(item, 51))).toEqual([51]);
    expect(beforeSwipe).toContain(49);
    expect(afterSwipe).not.toContain(49);
    expect(afterSwipe).toContain(52);
  });

  it("clamps the active position into the bounded list after deletion", () => {
    const newIndex = clampIndexAfterDelete(2, 2);
    const items = getPaginationItems(7, newIndex);

    expect(newIndex).toBe(6);
    expect(items).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(items.filter((item) => isPaginationItemActive(item, newIndex))).toEqual([6]);
  });
});

// ---------------------------------------------------------------------------
// 10. Share / Delete target the currently displayed photo, not the tapped one
// ---------------------------------------------------------------------------

describe("currentPhotoId — always targets the displayed photo", () => {
  const photos = [
    { id: 101 },
    { id: 202 },
    { id: 303 },
  ];

  it("returns the id of the photo at currentIndex", () => {
    expect(currentPhotoId(photos, 0)).toBe(101);
    expect(currentPhotoId(photos, 1)).toBe(202);
    expect(currentPhotoId(photos, 2)).toBe(303);
  });

  it("returns the navigated-to photo id, not the originally tapped one", () => {
    // Grower taps photo at index 0 (id 101), then swipes to index 2 (id 303).
    // Share / Delete must target 303, not 101.
    const originalTapIndex = 0;
    const navigatedIndex = 2;
    expect(currentPhotoId(photos, originalTapIndex)).toBe(101); // stale tap
    expect(currentPhotoId(photos, navigatedIndex)).toBe(303);   // correct target
  });

  it("returns null when the photos array is empty", () => {
    expect(currentPhotoId([], 0)).toBeNull();
  });

  it("returns null when index is out of range", () => {
    expect(currentPhotoId(photos, 5)).toBeNull();
  });

  it("returns the correct id after a delete clamps the index", () => {
    // 3 photos; user at 2; photo 303 deleted → newLength=2; clamp to 1 → id 202
    const newIndex = clampIndexAfterDelete(2, 2);
    expect(currentPhotoId(photos.slice(0, 2), newIndex)).toBe(202);
  });
});

// ---------------------------------------------------------------------------
// 11. Caption save stays associated with its photo while navigating
// ---------------------------------------------------------------------------

describe("updatePhotoCaption — caption save while the lightbox navigates", () => {
  type TestPhoto = {
    id: number;
    isCover: boolean;
    downloadUrl: string;
  };

  const initialPhotos: TestPhoto[] = [
    { id: 101, caption: "First photo" },
    { id: 202, caption: "Second photo" },
    { id: 303, caption: "Third photo" },
  ];

  it("keeps photo 2's caption visible after saving photo 1 and swiping immediately", () => {
    // The save response may arrive after currentIndex has moved to photo 2.
    const photosAfterSave = updatePhotoCaption(initialPhotos, 101, "Updated first photo");
    const currentIndexAfterSwipe = 1;

    expect(photosAfterSave[currentIndexAfterSwipe].caption).toBe("Second photo");
  });

  it("shows the saved caption when swiping back to photo 1", () => {
    const photosAfterSave = updatePhotoCaption(initialPhotos, 101, "Updated first photo");
    const currentIndexAfterSwipingBack = 0;

    expect(photosAfterSave[currentIndexAfterSwipingBack].caption).toBe("Updated first photo");
  });

  it("does not change other photos when applying a caption save by ID", () => {
    const photosAfterSave = updatePhotoCaption(initialPhotos, 101, "Updated first photo");

    expect(photosAfterSave).toEqual([
      { id: 101, caption: "Updated first photo" },
      { id: 202, caption: "Second photo" },
      { id: 303, caption: "Third photo" },
    ]);
  });
});

describe("mergeRefreshedPhotoCaptions — refresh and caption save ordering", () => {
  type TestPhoto = {
    id: number;
    isCover: boolean;
    downloadUrl: string;
  };

  it("keeps the newly selected cover when an older refresh completes after the save", () => {
    const staleServerResponse: TestPhoto[] = [
      { id: 101, isCover: true, downloadUrl: "fresh-url-101" },
      { id: 202, isCover: false, downloadUrl: "fresh-url-202" },
    ];
    const localPhotosAfterSave: TestPhoto[] = [
      { id: 101, isCover: false, downloadUrl: "old-url-101" },
      { id: 202, isCover: true, downloadUrl: "old-url-202" },
    ];

    const merged = mergeRefreshedPhotoCover(
      staleServerResponse,
      localPhotosAfterSave,
      0,
      1,
    );

    const refreshed = [
      { id: 101, isCover: true, downloadUrl: "fresh-url-101" },
      { id: 202, isCover: false, downloadUrl: "fresh-url-202" },
    ];

    expect(merged[0].caption).toBe("Server caption");
  });

  it("preserves a newly cleared caption as well as non-empty captions", () => {
    const merged = mergeRefreshedPhotoCover(
      staleServerResponse,
      localPhotosAfterSave,
      0,
      1,
    );

    const refreshed = [
      { id: 101, isCover: true, downloadUrl: "fresh-url-101" },
      { id: 202, isCover: false, downloadUrl: "fresh-url-202" },
    ];

    expect(merged[0].caption).toBe("Server caption");
  });

  it("preserves a newly cleared caption as well as non-empty captions", () => {
    const merged = mergeRefreshedPhotoCover(
      staleServerResponse,
      localPhotosAfterSave,
      0,
      1,
    );

    const refreshed = [
      { id: 101, isCover: true, downloadUrl: "fresh-url-101" },
      { id: 202, isCover: false, downloadUrl: "fresh-url-202" },
    ];
      const autoRetried = { current: false };
    const scheduledCallbacks: Array<() => void | Promise<void>> = [];
    const schedule = jest.fn(
      (
        callback: () => void | Promise<void>,
        _delayMs: number,
      ) => {
        scheduledCallbacks.push(callback);
        return 1 as ReturnType<typeof setTimeout>;
      },
    );
    const retry = jest.fn().mockRejectedValue(new Error("presigned URL expired"));
    expect(
      scheduleScoutingPhotoAutoRetry(autoRetried, schedule, retry),
    ).not.toBeNull();
    expect(autoRetried.current).toBe(true);
    expect(schedule).toHaveBeenCalledTimes(1);
    expect(schedule).toHaveBeenLastCalledWith(expect.any(Function), 2000);

    // Simulate the first timer firing and the URL refresh failing. The
    // component keeps autoRetried.current set for the rest of this view.
    await expect(scheduledCallbacks[0]()).rejects.toThrow(
      "presigned URL expired",
    );

    expect(
      scheduleScoutingPhotoAutoRetry(autoRetried, schedule, retry),
    ).toBeNull();
    expect(schedule).toHaveBeenCalledTimes(1);
  });

  it("cancels the old photo's timer on navigation and gives the new photo one retry", () => {
    jest.useFakeTimers();
    try {
      const autoRetried = { current: false };
      const autoRetryTimer = {
        current: null as ReturnType<typeof setTimeout> | null,
      };
      const reloadOldPhoto = jest.fn();
      const reloadNewPhoto = jest.fn();

      autoRetryTimer.current = scheduleScoutingPhotoAutoRetry(
        autoRetried,
        setTimeout,
        reloadOldPhoto,
      );
      expect(autoRetryTimer.current).not.toBeNull();
      expect(autoRetried.current).toBe(true);

      // Navigation runs the displayed-photo cleanup before the first timer
      // fires. The old photo must never be reloaded.
      cancelScoutingPhotoAutoRetry(autoRetryTimer, autoRetried, clearTimeout);
      jest.advanceTimersByTime(2000);
      expect(reloadOldPhoto).not.toHaveBeenCalled();
      expect(autoRetryTimer.current).toBeNull();
      expect(autoRetried.current).toBe(false);

      // The reset belongs to the newly displayed photo, which may still claim
      // exactly one automatic retry of its own.
      autoRetryTimer.current = scheduleScoutingPhotoAutoRetry(
        autoRetried,
        setTimeout,
        reloadNewPhoto,
      );
      expect(autoRetryTimer.current).not.toBeNull();
      expect(autoRetried.current).toBe(true);

      jest.advanceTimersByTime(2000);
      expect(reloadNewPhoto).toHaveBeenCalledTimes(1);
      expect(reloadOldPhoto).not.toHaveBeenCalled();
      expect(
        scheduleScoutingPhotoAutoRetry(autoRetried, setTimeout, reloadNewPhoto),
      ).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// 13. Swipe navigation is blocked while deleting
// ---------------------------------------------------------------------------

describe("shouldAllowSwipe — deletion takes priority over gestures", () => {
  it.each([
    [20, 0],
    [-20, 0],
    [100, 10],
    [0, 0],
    [5, 1],
    [1000, -1000],
  ])("returns false while deleting for dx=%s and dy=%s", (dx, dy) => {
    expect(shouldAllowSwipe(true, dx, dy)).toBe(false);
  });

  it("allows a sufficiently horizontal gesture when not deleting", () => {
    expect(shouldAllowSwipe(false, 20, 5)).toBe(true);
  });

  it("rejects gestures that are too short or too vertical when not deleting", () => {
    expect(shouldAllowSwipe(false, 10, 0)).toBe(false);
    expect(shouldAllowSwipe(false, 20, 20)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 14. Completed swipes cannot navigate after deletion starts
// ---------------------------------------------------------------------------

describe("getSwipeDirection — deletion takes priority at release", () => {
  it.each([
    [-51, "next"],
    [51, "previous"],
  ])("returns the expected direction when not deleting (dx=%s)", (dx, direction) => {
    expect(getSwipeDirection(false, dx)).toBe(direction);
  });

  it.each([-51, 51, -500, 500])(
    "returns null when a gesture releases after deletion starts (dx=%s)",
    (dx) => {
      // The gesture may have started before deletion, but the release must
      // not navigate once deletion is active.
      expect(getSwipeDirection(true, dx)).toBeNull();
    },
  );

  it("returns null at or below the swipe threshold", () => {
    expect(getSwipeDirection(false, 50)).toBeNull();
    expect(getSwipeDirection(false, -50)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 15. Repeated delete taps cannot queue duplicate confirmations
// ---------------------------------------------------------------------------

describe("claimDeleteConfirmation", () => {
  it("allows only the first claim while a confirmation is open", () => {
      const lock = { current: false };

    expect(claimDeleteConfirmation(lock)).toBe(true);
    expect(claimDeleteConfirmation(lock)).toBe(false);
    expect(lock.current).toBe(true);
  });

  it.each(["cancellation", "failed request"])(
    "allows a retry after %s releases the confirmation",
    () => {
      const lock = { current: false };

      expect(claimDeleteConfirmation(lock)).toBe(true);
      lock.current = false;
      expect(claimDeleteConfirmation(lock)).toBe(true);
    },
  );
});
