import { expect, type Page } from "@playwright/test";
import type { WaypointFixture } from "../test-data/order-fixture.js";
import { movingLabels } from "../labels.js";

export async function fillWaypoint(
  page: Page,
  waypointLabel: RegExp,
  data: WaypointFixture,
): Promise<void> {
  await page.getByRole("button", { name: waypointLabel, exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: movingLabels.streetAddress })
    .waitFor({ state: "visible", timeout: 15_000 });

  await dialog.getByRole("button", { name: /District|地區/ }).click();
  await page.getByRole("menuitem", { name: data.district }).click();

  await dialog.getByRole("textbox", { name: movingLabels.streetAddress }).fill(data.street);

  if (data.blockFloor) {
    await dialog
      .getByRole("textbox", { name: /Block, floor & room|樓層及室/ })
      .fill(data.blockFloor);
  }

  await dialog.getByRole("button", { name: data.lift, exact: true }).click();

  await dialog.getByRole("button", { name: /Select|選擇/ }).first().click();
  await page.getByRole("menuitem", { name: data.stairs }).click();

  await dialog.getByRole("button", { name: /Select|選擇/ }).first().click();
  await page.getByRole("menuitem", { name: data.distance }).click();

  await dialog.getByRole("button", { name: movingLabels.confirm }).click();

  // After confirm the waypoint button shows the full address summary, not the label.
  await expect(page.getByRole("button", { name: new RegExp(data.street) })).toBeVisible();
}

export async function fillDistrictStreetPair(
  page: Page,
  pairIndex: 0 | 1,
  data: { district: string; street: string },
): Promise<void> {
  // Filled districts no longer match "District", so always target the next empty picker.
  await page.getByRole("button", { name: /District|地區/ }).first().click();
  await page.getByRole("menuitem", { name: data.district }).click();
  await page
    .getByRole("textbox", { name: movingLabels.streetAddress })
    .nth(pairIndex)
    .fill(data.street);
}
