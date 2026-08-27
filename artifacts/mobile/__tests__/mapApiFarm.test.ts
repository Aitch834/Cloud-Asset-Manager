import { mapApiFarm } from "../lib/utils/mapApiFarm";

describe("mapApiFarm", () => {
  it("retains every report identity reference returned by /api/my-farms", () => {
    const farm = mapApiFarm({
      id: 42,
      name: "Vine Farm",
      tenantSlug: "vine-farm",
      sectorArable: false,
      sectorBeef: false,
      sectorDairy: false,
      sectorPigs: false,
      sectorPoultry: false,
      sectorViticulture: true,
      cphNumber: "12/345/6789",
      sbiNumber: "106789012",
      redTractorId: "RT-123",
      wineGbMembershipNumber: "WGB-456",
      aphaRegistrationNumber: "APHA-789",
      fsaWineRegistrationNumber: "FSA-WINE-101",
      vineyardRegisterNumber: "FSA-VINE-112",
    });

    expect(farm).toMatchObject({
      id: "42",
      cphNumber: "12/345/6789",
      sbiNumber: "106789012",
      redTractorId: "RT-123",
      wineGbMembershipNumber: "WGB-456",
      aphaRegistrationNumber: "APHA-789",
      fsaWineRegistrationNumber: "FSA-WINE-101",
      vineyardRegisterNumber: "FSA-VINE-112",
    });
  });

  it("does not fabricate text references for missing or invalid API values", () => {
    const farm = mapApiFarm({
      id: 42,
      name: "Vine Farm",
      tenantSlug: "vine-farm",
      sectorArable: false,
      sectorBeef: false,
      sectorDairy: false,
      sectorPigs: false,
      sectorPoultry: false,
      sectorViticulture: true,
      cphNumber: null,
      sbiNumber: 123,
    });

    expect(farm.cphNumber).toBeNull();
    expect(farm.sbiNumber).toBeUndefined();
    expect(farm.wineGbMembershipNumber).toBeUndefined();
  });
});