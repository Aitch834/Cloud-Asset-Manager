import { afterEach, describe, expect, it, vi } from "vitest";
import { readStoredOffers, type StoredOffer } from "./PhenologyTab";

const farmId = 42;

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null,
    removeItem: (key: string) => { entries.delete(key); },
    setItem: (key: string, value: string) => { entries.set(key, value); },
  };
}

function offerFor(year: number): StoredOffer {
  return {
    surveyName: "Bud Burst Survey",
    label: "bud burst",
    surveyKey: "bud_burst",
    year,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("readStoredOffers", () => {
  it("removes a malformed offer without preventing a valid current-year offer from loading", () => {
    const year = new Date().getFullYear();
    const currentOffer = offerFor(year);
    const malformedKey = `winegb-offer:${farmId}:flowering:${year}`;
    const validKey = `winegb-offer:${farmId}:bud_burst:${year}`;
    const storage = createMemoryStorage();
    storage.setItem(malformedKey, "{not valid JSON");
    storage.setItem(validKey, JSON.stringify(currentOffer));
    vi.stubGlobal("localStorage", storage);

    let offers: StoredOffer[] = [];
    expect(() => {
      offers = readStoredOffers(farmId);
    }).not.toThrow();

    expect(offers).toEqual([currentOffer]);
    expect(storage.getItem(malformedKey)).toBeNull();
    expect(storage.getItem(validKey)).toBe(JSON.stringify(currentOffer));
  });

  it.each([
    ["null", null],
    ["an array", []],
    ["a missing survey name", { label: "flowering", surveyKey: "flowering", year: new Date().getFullYear() }],
    ["a blank label", { surveyName: "Flowering Survey", label: "  ", surveyKey: "flowering", year: new Date().getFullYear() }],
    ["an unknown survey key", { surveyName: "Flowering Survey", label: "flowering", surveyKey: "unknown", year: new Date().getFullYear() }],
    ["a non-numeric year", { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering", year: "2026" }],
    ["a fractional year", { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering", year: 2026.5 }],
  ])("silently removes parseable malformed reminder shape: %s", (_description, malformedOffer) => {
    const year = new Date().getFullYear();
    const malformedKey = `winegb-offer:${farmId}:flowering:${year}`;
    const validKey = `winegb-offer:${farmId}:bud_burst:${year}`;
    const currentOffer = offerFor(year);
    const storage = createMemoryStorage();
    storage.setItem(malformedKey, JSON.stringify(malformedOffer));
    storage.setItem(validKey, JSON.stringify(currentOffer));
    vi.stubGlobal("localStorage", storage);

    expect(() => readStoredOffers(farmId)).not.toThrow();
    expect(readStoredOffers(farmId)).toEqual([currentOffer]);
    expect(storage.getItem(malformedKey)).toBeNull();
    expect(storage.getItem(validKey)).toBe(JSON.stringify(currentOffer));
  });

  it("silently removes an offer from the previous calendar year", () => {
    const year = new Date().getFullYear();
    const staleOffer = offerFor(year - 1);
    const key = `winegb-offer:${farmId}:bud_burst:${year - 1}`;
    const storage = createMemoryStorage();
    storage.setItem(key, JSON.stringify(staleOffer));
    vi.stubGlobal("localStorage", storage);

    expect(readStoredOffers(farmId)).toEqual([]);
    expect(storage.getItem(key)).toBeNull();
  });

  it("returns a current-year offer intact and keeps it stored", () => {
    const year = new Date().getFullYear();
    const currentOffer = offerFor(year);
    const key = `winegb-offer:${farmId}:bud_burst:${year}`;
    const storage = createMemoryStorage();
    storage.setItem(key, JSON.stringify(currentOffer));
    vi.stubGlobal("localStorage", storage);

    expect(readStoredOffers(farmId)).toEqual([currentOffer]);
    expect(storage.getItem(key)).toBe(JSON.stringify(currentOffer));
  });
});