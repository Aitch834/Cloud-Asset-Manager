import { deriveTonnesPerHa, sanitiseCsvCell } from "./csv";

type HarvestCsvRow = Record<string, unknown>;
type HarvestCsvBlock = Record<string, unknown>;

function cell(value: unknown): string {
  const safe = sanitiseCsvCell(value == null ? "" : String(value));
  return `"${safe.replace(/"/g, '""')}"`;
}

export function buildHarvestChemistryCsvSection(
  rows: HarvestCsvRow[],
  vintages: string[],
  blockIds: unknown[],
  blockLabel: (blockId: unknown) => string,
  title: string,
  avgLabel: string,
  extractor: (row: HarvestCsvRow) => number | null,
  precision: number,
): string[] {
  const lookup: Record<string, Record<string, HarvestCsvRow[]>> = {};
  for (const row of rows) {
    const blockId = String(row.blockId ?? "");
    const vintage = String(row.vintageYear ?? "");
    if (!lookup[blockId]) lookup[blockId] = {};
    if (!lookup[blockId][vintage]) lookup[blockId][vintage] = [];
    lookup[blockId][vintage].push(row);
  }

  const average = (metricRows: HarvestCsvRow[]) => {
    const values = metricRows
      .map(extractor)
      .filter((value): value is number => value !== null && !isNaN(value));
    return values.length > 0
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null;
  };

  const header = [cell("Block"), ...vintages.map(cell), cell(avgLabel)].join(",");
  const blockRows = blockIds.map(blockId => {
    const blockLookup = lookup[String(blockId)] ?? {};
    const vintageCells = vintages.map(vintage => {
      const value = average(blockLookup[vintage] ?? []);
      return cell(value != null ? value.toFixed(precision) : "");
    });
    const rowAverage = average(Object.values(blockLookup).flat());
    return [
      cell(blockLabel(blockId)),
      ...vintageCells,
      cell(rowAverage != null ? rowAverage.toFixed(precision) : ""),
    ].join(",");
  });

  const vintageFooterCells = vintages.map(vintage => {
    const value = average(rows.filter(row => String(row.vintageYear ?? "") === vintage));
    return cell(value != null ? value.toFixed(precision) : "");
  });
  const grandAverage = average(rows);
  const averageFooter = [
    cell("All blocks"),
    ...vintageFooterCells,
    cell(grandAverage != null ? grandAverage.toFixed(precision) : ""),
  ].join(",");

  const picksByVintage = vintages.map(vintage => {
    const count = blockIds.reduce<number>(
      (total, blockId) => total + (lookup[String(blockId)]?.[vintage]?.length ?? 0),
      0,
    );
    return cell(count === 1 ? "1 (single pick)" : count > 0 ? String(count) : "");
  });
  const totalPicks = blockIds.reduce<number>(
    (total, blockId) => total + Object.values(lookup[String(blockId)] ?? {}).flat().length,
    0,
  );
  const picksFooter = [
    cell("Picks"),
    ...picksByVintage,
    cell(totalPicks > 0 ? String(totalPicks) : ""),
  ].join(",");

  return ["", cell(title), header, ...blockRows, averageFooter, picksFooter];
}

/**
 * Build the Yield by Variety section used by both harvest export modes.
 *
 * The area for a variety is the sum of each linked block's area once, while
 * yield is the sum of all picks for that variety. This keeps the displayed
 * t/ha calculation consistent with the on-screen variety summary.
 */
export function buildHarvestYieldByVarietyCsvSection(
  rows: HarvestCsvRow[],
  blocks: HarvestCsvBlock[],
): string[] {
  const avgOf = (values: number[]) => values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
  const unknownKey = "Unknown / Not linked";
  const varietyMap: Record<string, {
    totalKg: number;
    totalHa: number;
    blockIds: Set<unknown>;
    brixVals: number[];
    phVals: number[];
    taVals: number[];
    paVals: number[];
  }> = {};

  for (const row of rows) {
    const block = row.blockId != null
      ? blocks.find(candidate => String(candidate.id) === String(row.blockId))
      : null;
    const variety = block ? String(block.variety ?? "").trim() : "";
    const key = variety || unknownKey;
    if (!varietyMap[key]) {
      varietyMap[key] = {
        totalKg: 0,
        totalHa: 0,
        blockIds: new Set(),
        brixVals: [],
        phVals: [],
        taVals: [],
        paVals: [],
      };
    }

    const entry = varietyMap[key];
    entry.totalKg += parseFloat(String(row.yieldKg ?? 0)) || 0;
    if (block && row.blockId != null && !entry.blockIds.has(row.blockId)) {
      entry.blockIds.add(row.blockId);
      const areaHa = parseFloat(String(block.areaHa ?? block.area ?? ""));
      if (!isNaN(areaHa) && areaHa > 0) entry.totalHa += areaHa;
    }

    const brix = parseFloat(String(row.brix ?? ""));
    if (!isNaN(brix)) entry.brixVals.push(brix);
    const ph = parseFloat(String(row.ph ?? ""));
    if (!isNaN(ph)) entry.phVals.push(ph);
    const ta = parseFloat(String(row.titratableAcidityGl ?? ""));
    if (!isNaN(ta)) entry.taVals.push(ta);
    const pa = parseFloat(String(row.potentialAlcohol ?? ""));
    if (!isNaN(pa)) entry.paVals.push(pa);
  }

  const namedVarietyKeys = Object.keys(varietyMap).filter(key => key !== unknownKey);
  if (namedVarietyKeys.length < 2) return [];

  const sortedEntries = Object.entries(varietyMap).sort(([a], [b]) => {
    if (a === unknownKey) return 1;
    if (b === unknownKey) return -1;
    return a.localeCompare(b);
  });

  const header = [
    cell("Variety"),
    cell("Area (ha)"),
    cell("Total Yield (kg)"),
    cell("Yield (t/ha)"),
    cell("Avg Brix °"),
    cell("Avg pH"),
    cell("Avg TA (g/L)"),
    cell("Avg Pot. Alc %"),
  ].join(",");

  const varietyHasArealessBlocks = sortedEntries.some(([, entry]) =>
    entry.totalKg > 0 && entry.blockIds.size > 0 && entry.totalHa === 0
  );
  const dataRows = sortedEntries.map(([variety, entry]) => {
    const tonnesPerHa = deriveTonnesPerHa(entry.totalKg, entry.totalHa);
    const hasArealessBlocks = entry.totalKg > 0 && entry.blockIds.size > 0 && entry.totalHa === 0;
    return [
      cell(variety),
      cell(entry.totalHa > 0 ? entry.totalHa.toFixed(2) : ""),
      cell(entry.totalKg > 0 ? entry.totalKg.toFixed(1) : ""),
      cell(tonnesPerHa != null ? tonnesPerHa.toFixed(2) : hasArealessBlocks ? "†" : ""),
      cell(avgOf(entry.brixVals) != null ? avgOf(entry.brixVals)!.toFixed(1) : ""),
      cell(avgOf(entry.phVals) != null ? avgOf(entry.phVals)!.toFixed(2) : ""),
      cell(avgOf(entry.taVals) != null ? avgOf(entry.taVals)!.toFixed(2) : ""),
      cell(avgOf(entry.paVals) != null ? avgOf(entry.paVals)!.toFixed(2) : ""),
    ].join(",");
  });

  const rowsWithArea = sortedEntries.filter(([, entry]) => entry.totalHa > 0);
  const grandHa = rowsWithArea.reduce((sum, [, entry]) => sum + entry.totalHa, 0);
  const grandKgForArea = rowsWithArea.reduce((sum, [, entry]) => sum + entry.totalKg, 0);
  const grandTonnesPerHa = deriveTonnesPerHa(grandKgForArea, grandHa);
  const grandKg = sortedEntries.reduce((sum, [, entry]) => sum + entry.totalKg, 0);
  const allBrix = rows.map(row => parseFloat(String(row.brix ?? ""))).filter(value => !isNaN(value));
  const allPh = rows.map(row => parseFloat(String(row.ph ?? ""))).filter(value => !isNaN(value));
  const allTa = rows.map(row => parseFloat(String(row.titratableAcidityGl ?? ""))).filter(value => !isNaN(value));
  const allPa = rows.map(row => parseFloat(String(row.potentialAlcohol ?? ""))).filter(value => !isNaN(value));

  const footer = [
    cell("TOTAL"),
    cell(grandHa > 0 ? grandHa.toFixed(2) : ""),
    cell(grandKg > 0 ? grandKg.toFixed(1) : ""),
    cell(grandTonnesPerHa != null ? grandTonnesPerHa.toFixed(2) : ""),
    cell(avgOf(allBrix) != null ? avgOf(allBrix)!.toFixed(1) : ""),
    cell(avgOf(allPh) != null ? avgOf(allPh)!.toFixed(2) : ""),
    cell(avgOf(allTa) != null ? avgOf(allTa)!.toFixed(2) : ""),
    cell(avgOf(allPa) != null ? avgOf(allPa)!.toFixed(2) : ""),
  ].join(",");

  return [
    "",
    cell("Yield by Variety"),
    header,
    ...dataRows,
    footer,
    ...(varietyHasArealessBlocks
      ? [cell("† Block area not set — add it in Block Settings to see yield per hectare")]
      : []),
  ];
}

export type HarvestExportSections = {
  warningLine: string;
  lowPickWarningLine: string;
  summaryTitle: string;
  summaryHeader: string;
  summaryRows: string[];
  crossTabLines: string[];
  varietyLines: string[];
  detailHeader?: string;
  detailBody?: string;
};

/**
 * Assemble the shared summary portion of the harvest CSV in either export
 * mode. Keeping the variety section in this common path prevents it drifting
 * out of one of the summary/full branches.
 */
export function buildHarvestCsvContent(
  mode: "full" | "summary",
  sections: HarvestExportSections,
): string {
  const lines = [
    cell(sections.summaryTitle),
    sections.summaryHeader,
    ...sections.summaryRows,
    ...sections.crossTabLines,
    ...sections.varietyLines,
  ];

  if (mode === "full") {
    lines.push(
      "",
      cell("Detail Records"),
      sections.detailHeader ?? "",
      sections.detailBody ?? "",
    );
  }

  return sections.warningLine + sections.lowPickWarningLine + lines.join("\n");
}