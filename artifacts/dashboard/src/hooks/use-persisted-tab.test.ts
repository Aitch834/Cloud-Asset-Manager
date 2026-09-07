import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  persistedTabStorageKey,
  resolvePersistedTabValue,
} from "./use-persisted-tab";

const grantsTabs = ["capital", "agrienv"] as const;

describe("Grants section restoration", () => {
  it("keeps the Grants page wired to the per-farm persisted sections and tab query", () => {
    const source = readFileSync(
      new URL("../pages/GrantsPage.tsx", import.meta.url),
      "utf8",
    );
    const grantsPersistence = source.match(
      /usePersistedTab<"capital" \| "agrienv">\(\{([\s\S]*?)\}\);/,
    )?.[1];

    expect(grantsPersistence).toBeTruthy();
    expect(grantsPersistence).toContain('page: "grants"');
    expect(grantsPersistence).toContain("farmId");
    expect(grantsPersistence).toContain('validIds: ["capital", "agrienv"]');
    expect(grantsPersistence).toContain('defaultTab: "capital"');
    expect(grantsPersistence).toContain('.get("tab")');
  });

  it("keeps Capital grants and Agri-environment Schemes separate per farm", () => {
    const savedTabs = new Map<string, string>([
      [persistedTabStorageKey("grants", 41), "capital"],
      [persistedTabStorageKey("grants", 72), "agrienv"],
    ]);

    expect(
      resolvePersistedTabValue(
        savedTabs.get(persistedTabStorageKey("grants", 41)) ?? null,
        grantsTabs,
        "capital",
      ),
    ).toBe("capital");
    expect(
      resolvePersistedTabValue(
        savedTabs.get(persistedTabStorageKey("grants", 72)) ?? null,
        grantsTabs,
        "capital",
      ),
    ).toBe("agrienv");
  });

  it("lets a valid agrienv direct link override the stored section for that visit", () => {
    expect(
      resolvePersistedTabValue("capital", grantsTabs, "capital", "agrienv"),
    ).toBe("agrienv");

    // The override is only an input to restoration; the saved value is unchanged.
    expect(resolvePersistedTabValue("capital", grantsTabs, "capital")).toBe("capital");
  });

  it("falls back to Capital grants for missing and invalid stored values", () => {
    expect(resolvePersistedTabValue(null, grantsTabs, "capital")).toBe("capital");
    expect(resolvePersistedTabValue("expired-section", grantsTabs, "capital")).toBe("capital");
    expect(
      resolvePersistedTabValue("agrienv", grantsTabs, "capital", "not-a-tab"),
    ).toBe("agrienv");
  });
});