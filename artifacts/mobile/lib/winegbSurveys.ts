const winegbSurveys = [
  { key: "bud_burst", label: "Bud Burst", months: [3, 4] },
  { key: "frost_damage", label: "Frost Damage", months: [3, 4, 5] },
  { key: "flowering", label: "Flowering", months: [6, 7] },
  { key: "veraison", label: "Véraison", months: [8, 9] },
  { key: "harvest", label: "Harvest", months: [9, 10] },
] as const;

export type WinegbSurveyKey = (typeof winegbSurveys)[number]["key"];
export interface WinegbSurvey {
  readonly key: WinegbSurveyKey;
  readonly label: string;
  readonly months: readonly number[];
}

export const WINEGB_SURVEYS: readonly WinegbSurvey[] = winegbSurveys;
export const WINEGB_SURVEY_KEYS = WINEGB_SURVEYS.map(({ key }) => key);

// Maps BBCH stage codes to WineGB's seasonal vineyard surveys.
// surveyKey matches the server's WinegbSurveyKey (null = no checklist entry).
export const WINEGB_SURVEY_MAP: Record<
  string,
  { surveyName: string; label: string; surveyKey: WinegbSurveyKey | null }
> = {
  "05": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "07": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "09": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "11": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "13": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "15": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "53": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "55": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "57": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "60": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "65": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "68": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "71": { surveyName: "Fruit Set Survey", label: "fruit set / berry development", surveyKey: null },
  "73": { surveyName: "Fruit Set Survey", label: "fruit set / berry development", surveyKey: null },
  "75": { surveyName: "Fruit Set Survey", label: "fruit set / berry development", surveyKey: null },
  "77": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "81": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "83": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "85": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "89": { surveyName: "Harvest Survey", label: "harvest", surveyKey: "harvest" },
};

export function winegbPrefKey(surveyName: string, year: number): string {
  return `winegb_${surveyName.replace(/\s/g, "_").toLowerCase()}_${year}`;
}

/**
 * The single visibility decision used by Vine Phenology's save flow.
 *
 * Keeping the migration and preference checks together prevents a fast save
 * from showing a survey prompt before the legacy preference migration settles.
 */
export function shouldOfferWinegbSurvey(params: {
  stageCode: string;
  year: number;
  prefsReady: boolean;
  migrationChecked: boolean;
  isHintDismissed: (key: string) => boolean;
}): boolean {
  const survey = WINEGB_SURVEY_MAP[params.stageCode];
  return Boolean(
    survey &&
      params.prefsReady &&
      params.migrationChecked &&
      !params.isHintDismissed(winegbPrefKey(survey.surveyName, params.year)),
  );
}