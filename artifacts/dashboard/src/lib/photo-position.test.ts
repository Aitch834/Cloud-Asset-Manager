import { describe, expect, it } from "vitest";
import { formatPhotoPosition } from "./photo-position";

describe("formatPhotoPosition", () => {
  it("formats the first, middle, and last photo positions", () => {
    expect(formatPhotoPosition(0, 1)).toBe("1 of 1");
    expect(formatPhotoPosition(1, 5)).toBe("2 of 5");
    expect(formatPhotoPosition(4, 5)).toBe("5 of 5");
  });

  it("returns null when the active photo index is not valid", () => {
    expect(formatPhotoPosition(-1, 5)).toBeNull();
    expect(formatPhotoPosition(5, 5)).toBeNull();
    expect(formatPhotoPosition(0, 0)).toBeNull();
  });
});