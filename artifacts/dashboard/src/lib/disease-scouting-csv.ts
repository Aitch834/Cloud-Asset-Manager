export type DiseaseScoutingCsvRecord = Record<string, unknown>;

export type DiseaseScoutingCsvBlock = Record<string, unknown>;

export type DiseaseScoutingCsvFormatters = {
  formatDate: (value: unknown) => string;
  pressureLabel: (value: number) => string;
};

export const DISEASE_SCOUTING_DETAILED_HEADERS = [
  "Scout Date",
  "Block",
  "Block Linked",
  "Scouted By",
  "Downy Mildew",
  "Powdery Mildew",
  "Botrytis",
  "Phomopsis",
  "Leafhopper",
  "Spider Mite",
  "Vine Weevil",
  "Eutypa Dieback",
  "Xylella",
  "Phytophthora viticola",
  "Next Scout Date",
  "Action Taken",
  "Notes",
  "Photos",
  "Captioned Photos",
] as const;

/**
 * Build the detailed-record section used by the Disease Scouting CSV export.
 *
 * Keeping the header and row construction together makes it harder for a
 * change to the Notes cell to get out of sync with the columns after it.
 */
export function buildDiseaseScoutingDetailedCsvRows(
  records: DiseaseScoutingCsvRecord[],
  blocks: DiseaseScoutingCsvBlock[],
  formatters: DiseaseScoutingCsvFormatters,
): unknown[][] {
  const blockName = (id: unknown) => blocks.find(block => block.id === id)?.blockName ?? id;
  const { formatDate, pressureLabel } = formatters;

  return [
    [...DISEASE_SCOUTING_DETAILED_HEADERS],
    ...records.map(record => [
      formatDate(record.scoutDate),
      String(blockName(record.blockId)),
      record.blockId ? "Yes" : "No",
      String(record.scoutedBy ?? ""),
      pressureLabel(Number(record.downyMildewPressure) || 0),
      pressureLabel(Number(record.powderyMildewPressure) || 0),
      pressureLabel(Number(record.botrytisPressure) || 0),
      pressureLabel(Number(record.phomopsisPressure) || 0),
      pressureLabel(Number(record.leafhopperPressure) || 0),
      pressureLabel(Number(record.spiderMitePressure) || 0),
      record.vineWeevilSighted ? "Yes" : "No",
      record.eutypaDiebackSighted ? "Yes" : "No",
      record.xylellaFastidiosa ? "ALERT" : "No",
      record.phytophthoraViticola ? "ALERT" : "No",
      formatDate(record.nextScoutDate),
      String(record.actionTaken ?? ""),
      String(record.notes ?? ""),
      String(Number(record.photoCount) || 0),
      String(Number(record.captionCount) || 0),
    ]),
  ];
}