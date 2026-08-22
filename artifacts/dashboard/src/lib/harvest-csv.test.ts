import { describe, expect, it } from "vitest";
import { deriveTonnesPerHa } from "./csv";

describe("deriveTonnesPerHa", () => {
  it("derives t/ha from total kilograms and block area", () => {
    expect(deriveTonnesPerHa(1000, 2)).toBe(0.5);
  });

  it("returns null when block area is missing", () => {
    expect(deriveTonnesPerHa(1000, "")).toBeNull();
    expect(deriveTonnesPerHa(1000, null)).toBeNull();
  });

  it("returns null for zero or invalid inputs", () => {
    expect(deriveTonnesPerHa(0, 2)).toBeNull();
    expect(deriveTonnesPerHa(1000, 0)).toBeNull();
    expect(deriveTonnesPerHa(1000, "not an area")).toBeNull();
  });
});