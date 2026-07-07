import { expect, type Page } from "@playwright/test";
import {
  bet4376AirportSearchQuery,
  bet4376DialogHeading,
  type Bet4376Locale,
} from "../test-data/bet-4376.js";

function airportExtraFeeDialogHeading(page: Page, locale: Bet4376Locale) {
  return page.getByRole("heading", {
    level: 1,
    name: bet4376DialogHeading[locale],
  });
}

export async function selectHongKongAirportOnTransportOrder(
  page: Page,
  locale: Bet4376Locale,
): Promise<void> {
  const query = bet4376AirportSearchQuery[locale];
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

export async function expectAirportExtraFeeDialogVisible(
  page: Page,
  locale: Bet4376Locale,
): Promise<void> {
  await expect(airportExtraFeeDialogHeading(page, locale)).toBeVisible({
    timeout: 15_000,
  });
}

export async function readAirportExtraFeeDialogText(
  page: Page,
  locale: Bet4376Locale,
): Promise<string> {
  const heading = airportExtraFeeDialogHeading(page, locale);
  await expect(heading).toBeVisible({ timeout: 15_000 });
  const dialog = heading.locator('xpath=ancestor::*[@role="dialog"][1]');
  return (await dialog.textContent()) ?? "";
}
