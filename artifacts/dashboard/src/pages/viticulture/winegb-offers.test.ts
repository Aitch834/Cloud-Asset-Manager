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