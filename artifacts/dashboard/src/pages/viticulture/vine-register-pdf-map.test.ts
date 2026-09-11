import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pdfMocks = vi.hoisted(() => ({
  addImage: vi.fn(),
  save: vi.fn(),
  autoTable: vi.fn(),
}));

vi.mock("jspdf", () => {
  class MockJsPdf {
    internal = {
      pageSize: {
        getWidth: () => 297,
        getHeight: () => 210,
      },
      getNumberOfPages: () => 1,
    };

    setFillColor = vi.fn();
    rect = vi.fn();
    setFontSize = vi.fn();
    setFont = vi.fn();
    setTextColor = vi.fn();
    text = vi.fn();
    roundedRect = vi.fn();
    setDrawColor = vi.fn();
    addImage = pdfMocks.addImage;
    setPage = vi.fn();
    save = pdfMocks.save;
  }

  return { jsPDF: MockJsPdf, default: MockJsPdf };
});

vi.mock("jspdf-autotable", () => ({ default: pdfMocks.autoTable }));

import { downloadVineRegisterPdf } from "./shared";

const records = [{
  blockId: 7,
  registeredVariety: "Bacchus",
  registeredAreaHa: "1.25",
  dateRegistered: "2026-01-15",
}];

const blocks = [{ id: 7, blockName: "North Block" }];

const mappedBoundaries = [{
  blockId: 7,
  polygonPoints: [
    { lat: 51.100, lng: -0.300 },
    { lat: 51.101, lng: -0.298 },
    { lat: 51.099, lng: -0.297 },
  ],
}];

class LoadingImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

describe("Vine Register PDF block map", () => {
  beforeEach(() => {
    pdfMocks.addImage.mockClear();
    pdfMocks.save.mockClear();
    pdfMocks.autoTable.mockClear();

    vi.stubGlobal("Image", LoadingImage);
    vi.stubGlobal("document", {
      createElement: vi.fn((tagName: string) => {
        if (tagName !== "canvas") throw new Error(`Unexpected element: ${tagName}`);
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({ drawImage: vi.fn() })),
          toDataURL: vi.fn(() => "data:image/png;base64,BLOCK_MAP"),
        };
      }),
    });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:block-map"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("converts mapped block boundaries and adds the PNG to the PDF", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ boundaries: mappedBoundaries }),
    }));

    await downloadVineRegisterPdf(records, "Test Vineyard", "FSA-123", 42, blocks);

    expect(fetch).toHaveBeenCalledWith(
      "/api/farms/42/vineyard-blocks/boundaries",
      { credentials: "include" },
    );
    expect(pdfMocks.addImage).toHaveBeenCalledWith(
      "data:image/png;base64,BLOCK_MAP",
      "PNG",
      17,
      expect.any(Number),
      82,
      49,
    );
    expect(pdfMocks.save).toHaveBeenCalledWith("vine-register.pdf");
  });

  it("omits the map and still saves when no boundaries are returned", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ boundaries: [] }),
    }));

    await downloadVineRegisterPdf(records, "Test Vineyard", "FSA-123", 42, blocks);

    expect(pdfMocks.addImage).not.toHaveBeenCalled();
    expect(pdfMocks.save).toHaveBeenCalledWith("vine-register.pdf");
  });

  it("still saves when the boundary request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Boundary service unavailable")));

    await downloadVineRegisterPdf(records, "Test Vineyard", "FSA-123", 42, blocks);

    expect(pdfMocks.addImage).not.toHaveBeenCalled();
    expect(pdfMocks.save).toHaveBeenCalledWith("vine-register.pdf");
  });
});