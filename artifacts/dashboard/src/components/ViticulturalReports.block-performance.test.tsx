import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  BlockPerformanceYieldCell,
  type BlockPerformanceYieldCellValue,
} from "./ViticulturalReports";

function renderCell(cell: BlockPerformanceYieldCellValue | null) {
  return renderToStaticMarkup(<BlockPerformanceYieldCell cell={cell} />);
}

describe("Block Performance yield confidence indicators", () => {
  it("shows the amber 1 pick badge for a one-pick cell on screen and in print", () => {
    const html = renderCell({ value: 2.4, records: 1 });

    expect(html).toContain("1 pick");
    expect(html).toContain("bg-amber-100");
    expect(html).toContain("print:inline-flex");
  });

  it.each([2, 3])(
    "shows the amber confidence dot for a %i-pick cell on screen and in print",
    records => {
      const html = renderCell({ value: 4.8, records });

      expect(html).toContain(`aria-label="Based on ${records} picks"`);
      expect(html).toContain("bg-amber-500");
      expect(html).toContain("print:inline-block");
      expect(html).not.toContain("1 pick");
    },
  );

  it("shows no confidence marker for a four-plus-pick cell", () => {
    const html = renderCell({ value: 6.2, records: 4 });

    expect(html).toContain("6.2");
    expect(html).not.toContain("pick");
    expect(html).not.toContain("bg-amber");
  });

  it("shows an empty-cell dash when no picks exist", () => {
    const html = renderCell(null);

    expect(html).toContain("—");
    expect(html).not.toContain("pick");
    expect(html).not.toContain("bg-amber");
  });
});