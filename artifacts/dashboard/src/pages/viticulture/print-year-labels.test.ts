import { afterEach, describe, expect, it, vi } from "vitest";

import { printDiseaseScouting, printSprayRecords } from "./shared";

function capturePrintDocument() {
  const writes: string[] = [];
  const printWindow = {
    document: {
      open: vi.fn(),
      write: vi.fn((content: string) => {
        writes.push(content);
      }),
      close: vi.fn(),
    },
    onload: null as (() => void) | null,
    print: vi.fn(),
  };

  vi.stubGlobal("window", {
    open: vi.fn(() => printWindow),
  });

  return {
    finalHtml: () => writes.at(-1) ?? "",
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("viticulture print year labels", () => {
  it("includes the selected block in the Disease Scouting header", async () => {
    const printDocument = capturePrintDocument();

    await printDiseaseScouting([], "Test Farm", undefined, undefined, undefined, "North Field");

    expect(printDocument.finalHtml()).toContain("Block: <strong>North Field</strong>");
  });

  it("omits the Block line from the all-blocks Disease Scouting header", async () => {
    const printDocument = capturePrintDocument();

    await printDiseaseScouting([], "Test Farm");

    expect(printDocument.finalHtml()).not.toMatch(/Block:\s*<strong>/);
  });

  it("includes the selected year in the Disease Scouting header", async () => {
    const printDocument = capturePrintDocument();

    await printDiseaseScouting([], "Test Farm", undefined, undefined, undefined, undefined, "2024");

    expect(printDocument.finalHtml()).toContain("Year: <strong>2024</strong>");
  });

  it("omits the Year line from the all-years Disease Scouting header", async () => {
    const printDocument = capturePrintDocument();

    await printDiseaseScouting([], "Test Farm");

    expect(printDocument.finalHtml()).not.toMatch(/Year:\s*<strong>/);
  });

  it("includes the selected block in the Spray Diary header", async () => {
    const printDocument = capturePrintDocument();

    await printSprayRecords([], "Test Farm", undefined, undefined, undefined, "North Field");

    expect(printDocument.finalHtml()).toContain("Block: <strong>North Field</strong>");
  });

  it("omits the Block line from the all-blocks Spray Diary header", async () => {
    const printDocument = capturePrintDocument();

    await printSprayRecords([], "Test Farm");

    expect(printDocument.finalHtml()).not.toMatch(/Block:\s*<strong>/);
  });

  it("includes the selected year in the Spray Diary header", async () => {
    const printDocument = capturePrintDocument();

    await printSprayRecords([], "Test Farm", undefined, undefined, undefined, undefined, "2024");

    expect(printDocument.finalHtml()).toContain("Year: <strong>2024</strong>");
  });

  it("omits the Year line from the all-years Spray Diary header", async () => {
    const printDocument = capturePrintDocument();

    await printSprayRecords([], "Test Farm");

    expect(printDocument.finalHtml()).not.toMatch(/Year:\s*<strong>/);
  });
});