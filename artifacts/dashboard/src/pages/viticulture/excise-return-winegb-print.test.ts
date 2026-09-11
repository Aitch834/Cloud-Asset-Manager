import { afterEach, describe, expect, it, vi } from "vitest";
import { printExciseReturn } from "./shared";

const exciseReturnFixture = {
  periodStart: "2026-07-01",
  periodEnd: "2026-07-31",
  status: "draft",
  openingStockL: 1200,
  totalLitresProduced: 450,
  totalLitresRemovedUK: 125,
  totalLitresExported: 40,
  totalLitresDomesticConsumption: 5,
  totalLitresTastings: 2,
  closingStockL: 1478,
  nominalAbvPct: 12,
  annualProductionL: 5400,
  dutyRatePer100L: 342,
  totalDutyPayable: 451.44,
};

const farmFixture = {
  address: "1 Vineyard Lane, Kent",
  vatNumber: "GB123456789",
  appaRef: "APPA-123",
  fsaWineProductionRef: "FSA-WP-123",
  winegbMembershipNumber: "WGB-98765",
};

function captureExciseReturnHtml(farmMeta: Record<string, unknown>) {
  let html = "";
  const printWindow = {
    document: {
      write: vi.fn((value: string) => {
        html = value;
      }),
      close: vi.fn(),
    },
    onload: null as (() => void) | null,
    print: vi.fn(),
  };

  vi.stubGlobal("window", {
    open: vi.fn(() => printWindow),
  });

  printExciseReturn(
    exciseReturnFixture,
    "Test Vineyard",
    "WINERY-123",
    farmMeta,
    "2026-06-01",
  );

  return html;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Excise Return WineGB print header", () => {
  it("prints the farm fixture's WineGB Membership No in the header", () => {
    const html = captureExciseReturnHtml(farmFixture);

    expect(html).toContain(
      "WineGB Membership No: <strong>WGB-98765</strong>",
    );
    expect(html).not.toContain("WineGB Membership No not set");
  });

  it.each([undefined, null, "", "   \t\n"])(
    "names WineGB Membership No in the missing-header warning when blank (%s)",
    (winegbMembershipNumber) => {
      const html = captureExciseReturnHtml({
        ...farmFixture,
        winegbMembershipNumber,
      });

      expect(html).toContain("Missing header information");
      expect(html).toContain("WineGB Membership No not set");
      expect(html).toMatch(
        /field\(s\) marked below \(WineGB Membership No\) have not been set/,
      );
    },
  );
});

describe("Excise Return blocked print window", () => {
  it("reports that the print window did not open when the browser blocks it", () => {
    vi.stubGlobal("window", {
      open: vi.fn(() => null),
    });

    const opened = printExciseReturn(
      exciseReturnFixture,
      "Test Vineyard",
      "WINERY-123",
      farmFixture,
      "2026-06-01",
    );

    expect(opened).toBe(false);
    expect(window.open).toHaveBeenCalledWith("", "_blank", "width=820,height=1060");
  });
});