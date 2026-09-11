import fixture from "../../../test-fixtures/irrigation-calculations.json";
import {
  CROP_PROFILES,
  computeScenarios,
  computeSMD,
  getKc,
  getSmdStatus,
} from "../lib/irrigationCalculations";

const profileTuple = (profile: (typeof CROP_PROFILES)[string]) => [
  profile.label, profile.Kc_ini, profile.Kc_mid, profile.Kc_end,
  profile.fracDev, profile.fracMid, profile.fracLate,
  profile.Ky, profile.criticalSmdMm, profile.typicalYieldTha,
];

const scenarioTuple = (result: ReturnType<typeof computeScenarios>["skip"]) => [
  result.irrigationMm, result.irrigationCostPerHa, result.irrigationCostTotal,
  result.projectedSmdAfterMm, result.projectedSmd14Mm, result.etaEtmRatio,
  result.yieldLossFraction, result.yieldLossTha, result.yieldLossRevenueLoss,
  result.irrigationRevenueSaved, result.netBenefit,
];

function expectNumbers(actual: unknown[], expected: unknown[]) {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, index) => {
    if (typeof expected[index] === "number") expect(value).toBeCloseTo(expected[index] as number, 10);
    else expect(value).toBe(expected[index]);
  });
}

describe("mobile irrigation calculations match shared fixtures", () => {
  it("keeps every crop profile constant in parity", () => {
    expect(Object.keys(CROP_PROFILES).sort()).toEqual(Object.keys(fixture.cropProfiles).sort());
    for (const [key, expected] of Object.entries(fixture.cropProfiles)) {
      expectNumbers(profileTuple(CROP_PROFILES[key]), expected);
    }
  });

  it("matches crop-coefficient interpolation", () => {
    const input = fixture.cropCoefficient;
    for (const [date, expected] of input.expected) {
      expect(getKc(CROP_PROFILES[input.crop], input.plantingDate, input.harvestDate, date as string)).toBeCloseTo(expected as number, 10);
    }
  });

  it("matches SMD history including station and fallback ET0", () => {
    const input = fixture.smdHistory;
    const actual = computeSMD(input.readings, CROP_PROFILES[input.crop], input.fieldCapacityMm, input.plantingDate, input.harvestDate);
    actual.forEach((day, index) => expectNumbers(
      [day.date, day.et0, day.etC, day.rainfall, day.smd, day.kc, day.stationData],
      input.expected[index],
    ));
  });

  it("matches every status boundary", () => {
    for (const [smd, status] of fixture.statuses.expected) {
      expect(getSmdStatus(smd as number, fixture.statuses.criticalSmdMm)).toBe(status);
    }
  });

  it("matches all 14-day scenario outputs", () => {
    const actual = computeScenarios(fixture.scenario.input);
    for (const key of ["irrigateNow", "wait7", "skip"] as const) {
      expectNumbers(scenarioTuple(actual[key]), fixture.scenario.expected[key]);
    }
  });
});