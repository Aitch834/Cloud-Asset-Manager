import {
  getWinegbSurveyStatus,
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

describe("WineGB survey collection-window status", () => {
  const seasonYear = 2026;
  const frostDamage = WINEGB_SURVEYS.find(survey => survey.key === "frost_damage")!;
  const flowering = WINEGB_SURVEYS.find(survey => survey.key === "flowering")!;

  afterEach(() => {
    jest.useRealTimers();
  });

  function freezeDate(isoDate: string): void {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(`${isoDate}T12:00:00.000Z`));
  }

  it("is pending before the collection window opens", () => {
    freezeDate("2026-05-31");

    expect(getWinegbSurveyStatus({
      survey: flowering,
      seasonYear,
      submitted: false,
    })).toEqual({ isOverdue: false, isInSeason: false });
  });

  it.each(["2026-06-01", "2026-07-31"])(
    "is in season on the collection-window boundary %s",
    (date) => {
      freezeDate(date);

      expect(getWinegbSurveyStatus({
        survey: flowering,
        seasonYear,
        submitted: false,
      })).toEqual({ isOverdue: false, isInSeason: true });
    },
  );

  it("becomes overdue in the month after the collection window closes", () => {
    freezeDate("2026-08-01");

    expect(getWinegbSurveyStatus({
      survey: flowering,
      seasonYear,
      submitted: false,
    })).toEqual({ isOverdue: true, isInSeason: false });
  });

  it("never marks a submitted survey overdue", () => {
    freezeDate("2026-08-01");

    expect(getWinegbSurveyStatus({
      survey: flowering,
      seasonYear,
      submitted: true,
    })).toEqual({ isOverdue: false, isInSeason: false });
  });

  it.each([
    ["past", seasonYear - 1],
    ["future", seasonYear + 1],
  ])(
    "does not apply current-season badges to a %s season selection",
    (_season, selectedSeasonYear) => {
      freezeDate("2026-07-15");

      expect(getWinegbSurveyStatus({
        survey: frostDamage,
        seasonYear: selectedSeasonYear,
        submitted: false,
      })).toEqual({ isOverdue: false, isInSeason: false });
      expect(getWinegbSurveyStatus({
        survey: flowering,
        seasonYear: selectedSeasonYear,
        submitted: false,
      })).toEqual({ isOverdue: false, isInSeason: false });
    },
  );
});
