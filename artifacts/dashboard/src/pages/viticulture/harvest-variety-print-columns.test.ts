import { afterEach, describe, expect, it, vi } from "vitest";

import { printHarvest } from "./shared";

type VarietyChemistryColumns = {
  avgBrix: boolean;
  avgPh: boolean;
  avgTa: boolean;
  avgPa: boolean;
};

const records: Record<string, unknown>[] = [
  {
    blockId: 1,
    harvestDate: "2025-09-10",
    yieldKg: 1000,
    brix: 18,
    ph: 3.11,
    titratableAcidityGl: 7.2,
    potentialAlcohol: 10.4,
  },
  {
    blockId: 2,
    harvestDate: "2025-09-11",
    yieldKg: 2000,
    brix: 20,
    ph: 3.33,
    titratableAcidityGl: 8.4,
    potentialAlcohol: 11.6,
  },
];

const blocks: Record<string, unknown>[] = [
  { id: 1, name: "Chalk", variety: "Chardonnay", areaHa: 1 },
  { id: 2, name: "Clay", variety: "Pinot Noir", areaHa: 2 },
];

function capturePrintDocument() {
  const writes: string[] = [];
  const printWindow = {
    document: {
      open: vi.fn(),
      write: vi.fn((content: string) => writes.push(content)),
      close: vi.fn(),
    },
    onload: null as (() => void) | null,
    print: vi.fn(),
  };

  vi.stubGlobal("window", { open: vi.fn(() => printWindow) });
  return () => writes.at(-1) ?? "";
}

function textContent(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&deg;/g, "°")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function cells(rowHtml: string) {
  return [...rowHtml.matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map((match) =>
    textContent(match[1]),
  );
}

function yieldByVarietyTable(html: string) {
  const section = html.match(/>Yield by Variety<\/h2>\s*(<table[\s\S]*?<\/table>)/);
  expect(section, "Yield by Variety table should be present in the print report").not.toBeNull();

  const table = section![1];
  const header = table.match(/<thead><tr>([\s\S]*?)<\/tr><\/thead>/);
  const body = table.match(/<tbody>\s*(?:<tr>([\s\S]*?)<\/tr>)/);
  const footer = table.match(/<tfoot><tr>([\s\S]*?)<\/tr><\/tfoot>/);

  expect(header).not.toBeNull();
  expect(body).not.toBeNull();
  expect(footer).not.toBeNull();

  return {
    header: cells(header![1]),
    body: cells(body![1]),
    footer: cells(footer![1]),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Yield by Variety print column alignment", () => {
  it.each([
    {
      name: "all chemistry columns visible",
      visibility: { avgBrix: true, avgPh: true, avgTa: true, avgPa: true },
      headers: [
        "Variety",
        "Area (ha)",
        "Total Yield (kg)",
        "Yield (t/ha)",
        "Avg Brix °",
        "Avg pH",
        "Avg TA (g/L)",
        "Avg Pot. Alc %",
      ],
      body: ["Chardonnay", "1.00", "1000", "1.00", "18.0 °", "3.11", "7.2", "10.4"],
      footer: ["All Varieties", "3.00", "3000", "1.00", "19.0 °", "3.22", "7.8", "11.0"],
    },
    {
      name: "some chemistry columns hidden",
      visibility: { avgBrix: false, avgPh: true, avgTa: false, avgPa: true },
      headers: [
        "Variety",
        "Area (ha)",
        "Total Yield (kg)",
        "Yield (t/ha)",
        "Avg pH",
        "Avg Pot. Alc %",
      ],
      body: ["Chardonnay", "1.00", "1000", "1.00", "3.11", "10.4"],
      footer: ["All Varieties", "3.00", "3000", "1.00", "3.22", "11.0"],
    },
    {
      name: "all chemistry columns hidden",
      visibility: { avgBrix: false, avgPh: false, avgTa: false, avgPa: false },
      headers: ["Variety", "Area (ha)", "Total Yield (kg)", "Yield (t/ha)"],
      body: ["Chardonnay", "1.00", "1000", "1.00"],
      footer: ["All Varieties", "3.00", "3000", "1.00"],
    },
  ])("keeps header, body, and footer aligned when $name", async ({
    visibility,
    headers,
    body,
    footer,
  }) => {
    const finalHtml = capturePrintDocument();

    await printHarvest(
      records,
      "Test Vineyard",
      undefined,
      blocks,
      undefined,
      "2025",
      undefined,
      visibility as VarietyChemistryColumns,
    );

    const table = yieldByVarietyTable(finalHtml());
    expect(table.header).toEqual(headers);
    expect(table.body).toEqual(body);
    expect(table.footer).toEqual(footer);
    expect(table.body).toHaveLength(table.header.length);
    expect(table.footer).toHaveLength(table.header.length);
  });
});