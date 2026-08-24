/**
 * Shared variety → colour palette for harvest analytics charts.
 *
 * Both the on-screen Recharts charts (ViticulturalReports.tsx) and the
 * printed SVG charts (HarvestTab.tsx) must import from here so that a given
 * variety (e.g. "Chardonnay") is always assigned the same hue regardless of
 * which chart is being rendered.
 *
 * Palette slot assignment is deterministic: variety names are sorted
 * alphabetically before slots are allocated, so insertion/encounter order
 * can never cause the same variety to receive a different colour in different
 * contexts.
 */

export const YIELD_CHART_COLORS: readonly string[] = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6",
  "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#84cc16",
];

/**
 * Build a deterministic variety → colour map from an iterable of variety
 * names. Varieties are sorted case-insensitively before slot assignment so
 * the result is independent of the order in which varieties are encountered.
 *
 * @param varieties - all variety strings present in the dataset (may contain
 *   duplicates and empty strings; both are handled internally)
 * @returns a map from non-empty variety name → hex colour string
 */
export function buildVarietyColorMap(varieties: Iterable<string>): Record<string, string> {
  const unique = [...new Set([...varieties].map(v => v.trim()).filter(Boolean))];
  unique.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const map: Record<string, string> = {};
  unique.forEach((v, i) => { map[v] = YIELD_CHART_COLORS[i % YIELD_CHART_COLORS.length]; });
  return map;
}

/**
 * Given a variety → colour map (from buildVarietyColorMap) and a block-name
 * → variety map, return a block-name → colour map. Blocks with no known
 * variety receive fallback colours from the remaining palette slots so they
 * are still visually distinct from named-variety blocks.
 *
 * @param blockNames - ordered list of block names to assign colours to
 * @param blockVarietyByName - block name → variety (empty string = unknown)
 * @param varietyColorMap - output of buildVarietyColorMap
 */
export function buildBlockColorMap(
  blockNames: string[],
  blockVarietyByName: Record<string, string>,
  varietyColorMap: Record<string, string>,
): Record<string, string> {
  const usedColors = new Set(Object.values(varietyColorMap));
  const fallbackPalette = YIELD_CHART_COLORS.filter(c => !usedColors.has(c));
  let fbIdx = 0;
  const map: Record<string, string> = {};
  for (const bname of blockNames) {
    const v = (blockVarietyByName[bname] ?? "").trim();
    map[bname] = v
      ? (varietyColorMap[v] ?? YIELD_CHART_COLORS[0])
      : (fallbackPalette[fbIdx++ % (fallbackPalette.length || YIELD_CHART_COLORS.length)] ?? YIELD_CHART_COLORS[0]);
  }
  return map;
}

// ─── Internal HSL helpers ─────────────────────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    default: h = ((r - g) / d + 4) / 6; break;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100;
  const ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * sl;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0; let g = 0; let b = 0;
  if (h < 60)       { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Build a per-block colour map that assigns **every block a unique colour**,
 * even when multiple blocks share the same variety. Blocks of the same variety
 * are grouped under the same base hue but receive distinct lightness steps so
 * they are individually distinguishable on screen.
 *
 * - Single block per variety → base palette colour (no stepping needed).
 * - Multiple blocks per variety → lightness varies from base−12% to base+12%,
 *   evenly distributed across the block count, clamped to [28, 76].
 *
 * The variety anchor colours remain unchanged (use `varietyColorMap` for
 * legend strips that show the variety key).
 *
 * @param blockNames - ordered list of block names to assign colours to
 * @param blockVarietyByName - block name → variety (empty string = unknown)
 * @param varietyColorMap - output of buildVarietyColorMap
 */
export function buildUniqueBlockColorMap(
  blockNames: string[],
  blockVarietyByName: Record<string, string>,
  varietyColorMap: Record<string, string>,
): Record<string, string> {
  // Group blocks by variety key (preserving block order within each group)
  const varietyBlockList: Record<string, string[]> = {};
  for (const bname of blockNames) {
    const v = (blockVarietyByName[bname] ?? "").trim();
    const key = v || "__unlinked__";
    if (!varietyBlockList[key]) varietyBlockList[key] = [];
    varietyBlockList[key].push(bname);
  }

  // Fallback palette for blocks without a variety (colours not used by any variety)
  const usedColors = new Set(Object.values(varietyColorMap));
  const fallbackPalette = YIELD_CHART_COLORS.filter(c => !usedColors.has(c));
  let fbIdx = 0;

  const map: Record<string, string> = {};

  for (const [varietyKey, blocksInGroup] of Object.entries(varietyBlockList)) {
    const isUnlinked = varietyKey === "__unlinked__";
    const n = blocksInGroup.length;

    if (isUnlinked) {
      // Each unlinked block gets its own fallback palette slot
      for (const bname of blocksInGroup) {
        map[bname] = fallbackPalette[fbIdx++ % (fallbackPalette.length || YIELD_CHART_COLORS.length)] ?? YIELD_CHART_COLORS[0];
      }
      continue;
    }

    const baseHex = varietyColorMap[varietyKey] ?? YIELD_CHART_COLORS[0];

    if (n === 1) {
      // Only one block for this variety — use the base colour directly
      map[blocksInGroup[0]] = baseHex;
      continue;
    }

    // Multiple blocks: step lightness from base−12% to base+12% evenly
    const { h, s, l } = hexToHsl(baseHex);
    blocksInGroup.forEach((bname, idx) => {
      // t goes from 0 (darkest) to 1 (lightest) across the block group
      const t = n === 1 ? 0.5 : idx / (n - 1);
      const lShift = (t - 0.5) * 24; // ±12%
      const newL = Math.max(28, Math.min(76, l + lShift));
      // Slightly reduce saturation for lighter blocks so they stay readable
      const sShift = (t - 0.5) * -8;
      const newS = Math.max(45, Math.min(95, s + sShift));
      map[bname] = hslToHex(h, newS, newL);
    });
  }

  return map;
}
