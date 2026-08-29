import {
  WINEGB_SURVEY_KEYS,
  WINEGB_SURVEY_MAP,
  WINEGB_SURVEYS,
} from "@/lib/winegbSurveys";

describe("WineGB survey definitions", () => {
  it("keeps the home-screen keys identical to the checklist entries", () => {
    expect(WINEGB_SURVEY_KEYS).toEqual(WINEGB_SURVEYS.map(survey => survey.key));
    expect(WINEGB_SURVEY_KEYS).toEqual([
      "bud_burst",
      "frost_damage",
      "flowering",
      "veraison",
      "harvest",
    ]);
  });

  it("preserves the checklist seasonal metadata", () => {
    expect(WINEGB_SURVEYS).toEqual([
      { key: "bud_burst", label: "Bud Burst", months: [3, 4] },
      { key: "frost_damage", label: "Frost Damage", months: [3, 4, 5] },
      { key: "flowering", label: "Flowering", months: [6, 7] },
      { key: "veraison", label: "Véraison", months: [8, 9] },
      { key: "harvest", label: "Harvest", months: [9, 10] },
    ]);
  });

  it("only maps BBCH stages to surveys in the shared checklist", () => {
    const mappedSurveyKeys = [
      ...new Set(
        Object.values(WINEGB_SURVEY_MAP)
          .map(({ surveyKey }) => surveyKey)
          .filter((surveyKey): surveyKey is (typeof WINEGB_SURVEY_KEYS)[number] => surveyKey !== null),
      ),
    ];

    expect(mappedSurveyKeys.every(key => WINEGB_SURVEY_KEYS.includes(key))).toBe(true);
  });
});