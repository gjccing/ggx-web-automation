import { expect, type Page } from "@playwright/test";
import {
  bet4396DialogHeading,
  bet4396SearchQuery,
  type Bet4396Locale,
  type Bet4396Region,
} from "../test-data/bet-4396.js";

function regionWarningDialogHeading(
  page: Page,
  region: Bet4396Region,
  locale: Bet4396Locale,
) {
  return page.getByRole("heading", {
    level: 1,
    name: bet4396DialogHeading[region][locale],
  });
}

export async function selectRegionAddressOnTransportOrder(
  page: Page,
  region: Bet4396Region,
  locale: Bet4396Locale,
): Promise<void> {
  const query = bet4396SearchQuery[region][locale];
  const input = page.getByPlaceholder(/Address|地址/).first();
  await input.click();
  await input.fill(query);

  const suggestion = page
    .locator("li")
    .filter({ has: page.getByTestId("location-suggestion-icon") })
    .first();
  await expect(suggestion).toBeVisible({ timeout: 15_000 });
  await suggestion.click();
}

export async function expectRegionWarningDialogVisible(
  page: Page,
  region: Bet4396Region,
  locale: Bet4396Locale,
): Promise<void> {
  await expect(regionWarningDialogHeading(page, region, locale)).toBeVisible({
    timeout: 15_000,
  });
}

export async function readRegionWarningDialogText(
  page: Page,
  region: Bet4396Region,
  locale: Bet4396Locale,
): Promise<string> {
  const heading = regionWarningDialogHeading(page, region, locale);
  await expect(heading).toBeVisible({ timeout: 15_000 });
  const dialog = heading.locator('xpath=ancestor::*[@role="dialog"][1]');
  return (await dialog.textContent()) ?? "";
}
