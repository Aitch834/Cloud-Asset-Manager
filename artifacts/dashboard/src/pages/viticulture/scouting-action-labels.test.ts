import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const viticultureDir = dirname(fileURLToPath(import.meta.url));

function readSource(path: string) {
  return readFileSync(resolve(viticultureDir, path), "utf8");
}

describe("scouting history action accessibility", () => {
  const scoutingSource = readSource("ScoutingTab.tsx");
  const sharedSource = readSource("shared.tsx");

  it("gives every icon action a contextual scouting record name", () => {
    expect(scoutingSource).toContain("getRowActionLabel={r => {");
    expect(scoutingSource).toContain("disease scouting record #${String(r.id)}");
    expect(scoutingSource).toContain("for ${blockLabel} on ${fmtDate(r.scoutDate)}, scouted by ${scoutLabel}");
    expect(scoutingSource).toContain('block?.blockName ?? "an unlinked block"');
    expect(scoutingSource).toContain('r.scoutedBy ? String(r.scoutedBy) : "an unnamed scout"');
  });

  it("uses the contextual name for View, Edit, and Delete controls", () => {
    expect(sharedSource).toContain("getRowActionLabel?: (r: Record<string, unknown>) => string;");
    expect(sharedSource).toContain('aria-label={actionLabel("View", row)}');
    expect(sharedSource).toContain('aria-label={actionLabel("Edit", row)}');
    expect(sharedSource).toContain('aria-label={actionLabel("Delete", row)}');
  });
});