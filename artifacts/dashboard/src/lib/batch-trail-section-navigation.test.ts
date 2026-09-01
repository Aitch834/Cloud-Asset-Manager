import { afterEach, describe, expect, it, vi } from "vitest";
import {
  restoreStoredTrailSection,
  scrollToTrailSection,
  TRAIL_STICKY_NAV_CLASSNAME,
} from "./batch-trail-section-navigation";

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("restoreStoredTrailSection", () => {
  it("restores a saved later section without replacing the stored value", () => {
    const sectionKey = "bt-trail-section:42:BATCH-2026";
    const storage = createMemoryStorage();
    storage.setItem(sectionKey, "bt-bottling");
    vi.stubGlobal("localStorage", storage);

    const target = {
      getBoundingClientRect: () => ({ top: 460 }),
    } as unknown as HTMLElement;
    const contentBody = {
      querySelector: vi.fn((selector: string) => selector === "#bt-bottling" ? target : null),
    } as unknown as HTMLElement;
    const scrollBy = vi.fn();
    const scrollContainer = {
      getBoundingClientRect: () => ({ top: 100 }),
      scrollBy,
    } as unknown as HTMLElement;

    expect(restoreStoredTrailSection(sectionKey, contentBody, scrollContainer)).toBe("bt-bottling");
    expect(scrollBy).toHaveBeenCalledWith({ top: 352, behavior: "instant" });
    expect(storage.getItem(sectionKey)).toBe("bt-bottling");
  });

  it("clears a saved section that is no longer rendered", () => {
    const sectionKey = "bt-trail-section:42:BATCH-2026";
    const storage = createMemoryStorage();
    storage.setItem(sectionKey, "bt-bottling");
    vi.stubGlobal("localStorage", storage);

    const contentBody = {
      querySelector: vi.fn(() => null),
    } as unknown as HTMLElement;
    const scrollBy = vi.fn();
    const scrollContainer = {
      getBoundingClientRect: () => ({ top: 100 }),
      scrollBy,
    } as unknown as HTMLElement;

    expect(restoreStoredTrailSection(sectionKey, contentBody, scrollContainer)).toBeNull();
    expect(scrollBy).not.toHaveBeenCalled();
    expect(storage.getItem(sectionKey)).toBeNull();
  });
});

describe("Batch Trail jump navigation", () => {
  it("stays pinned while the dialog scrolls and can jump back from a lower section", () => {
    expect(TRAIL_STICKY_NAV_CLASSNAME.split(/\s+/)).toEqual(expect.arrayContaining(["sticky", "top-0"]));

    const targets: Record<string, HTMLElement> = {
      "#bt-bottling": {
        getBoundingClientRect: () => ({ top: 860 }),
      } as unknown as HTMLElement,
      "#bt-fermentation": {
        getBoundingClientRect: () => ({ top: -240 }),
      } as unknown as HTMLElement,
    };
    const contentBody = {
      querySelector: vi.fn((selector: string) => targets[selector] ?? null),
    } as unknown as HTMLElement;
    const scrollBy = vi.fn();
    const scrollContainer = {
      getBoundingClientRect: () => ({ top: 100 }),
      scrollBy,
    } as unknown as HTMLElement;

    expect(scrollToTrailSection("bt-bottling", contentBody, scrollContainer, "smooth", 40)).toBe(true);
    expect(scrollToTrailSection("bt-fermentation", contentBody, scrollContainer, "smooth", 40)).toBe(true);
    expect(scrollBy).toHaveBeenNthCalledWith(1, { top: 712, behavior: "smooth" });
    expect(scrollBy).toHaveBeenNthCalledWith(2, { top: -388, behavior: "smooth" });
  });
});