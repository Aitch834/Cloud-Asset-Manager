import { expect, test, type Page } from "@playwright/test";
import { signInMobile } from "./auth";
import { VITICULTURE_FARM_ID } from "./global-setup";

const CURRENT_FARM_STORAGE_KEY = "bde_current_farm";
const FARM_LIST_STORAGE_KEY = "bde_farm_list";
const OBSERVATION_SHORTCUT_TEST_ID = "record-option-vine-phenology";
const HISTORY_SHORTCUT_TEST_ID = "record-option-vine-phenology-history";

function requiredMobileEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Mobile release check configuration is missing ${name}. ` +
        "Use the focused package command so the Expo runtime and API URLs are provided.",
    );
  }
  return value;
}

async function selectViticultureFarm(
  page: Page,
  mobileApiBaseUrl: string,
): Promise<{ id: string; name: string }> {
  const selectedFarm = await page.evaluate(
    async ({ apiBaseUrl, farmId }) => {
      const clerk = (
        window as Window & {
          Clerk?: { session?: { getToken: () => Promise<string | null> } };
        }
      ).Clerk;
      const token = await clerk?.session?.getToken();
      if (!token) {
        throw new Error("signed-in Clerk session did not issue an API token");
      }

      const response = await fetch(new URL("/api/my-farms", apiBaseUrl), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`farm fixture request failed with HTTP ${response.status}`);
      }

      const payload = (await response.json()) as {
        farms?: Array<{
          id?: number;
          name?: string;
          sectorViticulture?: boolean;
          [key: string]: unknown;
        }>;
      };
      const farm = payload.farms?.find(
        candidate => Number(candidate.id) === farmId,
      );
      if (!farm) {
        throw new Error(`Viticulture fixture farm ${farmId} is unavailable`);
      }
      if (farm.sectorViticulture !== true) {
        throw new Error(`Farm ${farmId} is not marked as Viticulture-enabled`);
      }

      return {
        ...farm,
        id: String(farm.id),
        name: typeof farm.name === "string" ? farm.name : `Farm ${farm.id}`,
      };
    },
    { apiBaseUrl: mobileApiBaseUrl, farmId: VITICULTURE_FARM_ID },
  );

  await page.addInitScript(
    ({ farm, currentFarmKey, farmListKey }) => {
      // Expo web uses AsyncStorage backed by localStorage. Seed the fixture
      // before the next app load so FarmContext selects it from fresh API data.
      window.localStorage.setItem(currentFarmKey, JSON.stringify(farm));
      window.localStorage.setItem(farmListKey, JSON.stringify([farm]));
    },
    {
      farm: selectedFarm,
      currentFarmKey: CURRENT_FARM_STORAGE_KEY,
      farmListKey: FARM_LIST_STORAGE_KEY,
    },
  );

  return { id: selectedFarm.id, name: selectedFarm.name };
}

test("opens Phenology History from the Viticulture Record shortcuts", async ({
  page,
}) => {
  const mobileBaseUrl = requiredMobileEnvironment("PLAYWRIGHT_MOBILE_BASE_URL");
  const mobileApiBaseUrl = requiredMobileEnvironment(
    "PLAYWRIGHT_MOBILE_API_BASE_URL",
  );

  await signInMobile(page, mobileBaseUrl, mobileApiBaseUrl);
  const farm = await selectViticultureFarm(page, mobileApiBaseUrl);
  expect(farm.id).toBe(String(VITICULTURE_FARM_ID));

  await page.goto(new URL("/record", mobileBaseUrl).toString(), {
    waitUntil: "domcontentloaded",
  });

  const observationShortcut = page.getByTestId(OBSERVATION_SHORTCUT_TEST_ID);
  const historyShortcut = page.getByTestId(HISTORY_SHORTCUT_TEST_ID);
  await expect(observationShortcut).toBeVisible({ timeout: 20_000 });
  await expect(historyShortcut).toBeVisible({ timeout: 20_000 });

  await expect
    .poll(
      async () => {
        const shortcutOrder = await page
          .locator("[data-testid^='record-option-']")
          .evaluateAll(cards =>
            cards
              .map(card => card.getAttribute("data-testid"))
              .filter((id): id is string => id !== null),
          );
        const observationIndex = shortcutOrder.indexOf(
          OBSERVATION_SHORTCUT_TEST_ID,
        );
        return shortcutOrder.slice(observationIndex, observationIndex + 2);
      },
      {
        message:
          "Phenology History must appear immediately after Vine Phenology Observation in the Viticulture Record list",
        timeout: 20_000,
      },
    )
    .toEqual([OBSERVATION_SHORTCUT_TEST_ID, HISTORY_SHORTCUT_TEST_ID]);

  await historyShortcut.scrollIntoViewIfNeeded();
  await historyShortcut.click();

  await expect(page).toHaveURL(/\/vine-phenology-history(?:[/?#]|$)/);
  // Expo Router keeps the Record tab mounted under the pushed screen, so the
  // topmost matching text is the header belonging to the history destination.
  await expect(
    page.getByText("Phenology History", { exact: true }).last(),
  ).toBeVisible({ timeout: 20_000 });
});