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
