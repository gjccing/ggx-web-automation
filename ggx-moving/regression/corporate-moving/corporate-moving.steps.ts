import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { fillDistrictStreetPair } from "../../lib/pages/address-picker.js";
import { fillSinglePageContactAndSubmit } from "../../lib/pages/wizard.js";
import { movingLabels } from "../../lib/labels.js";
import { fetchOrderRowByOrderId } from "../../lib/sheets/order-sheet.js";
import {
  contactFixture,
  corporateAddresses,
} from "../../lib/test-data/order-fixture.js";
import { movingTestContext } from "../../lib/test-data/test-context.js";

const { When, Then } = createBdd();

function contact() {
  const fixture = contactFixture(movingTestContext.runId);
  movingTestContext.contactName = fixture.name;
  movingTestContext.contactPhone = fixture.phone;
  movingTestContext.contactEmail = fixture.email;
  return fixture;
}

When("I submit the corporate moving form without filling required fields", async ({ page }) => {
  await page.getByRole("button", { name: movingLabels.getQuote }).click();
});

Then("the corporate moving validation errors should be shown", async ({ page }) => {
  await expect(page.getByText(/enter the district.*street address|輸入.*地區.*地址/i)).toHaveCount(2);
  await expect(page.getByText(/enter.*name|輸入.*名稱/i)).toBeVisible();
  await expect(page.getByText(/enter.*phone|輸入.*電話/i)).toBeVisible();
  await expect(page.getByText(/enter.*email|輸入.*電郵/i)).toBeVisible();
});

When("I fill the corporate moving form except contact fields", async ({ page }) => {
  await fillDistrictStreetPair(page, 0, corporateAddresses.from);
  await fillDistrictStreetPair(page, 1, corporateAddresses.to);
});

When("I complete the corporate moving quote flow", async ({ page }) => {
  // Sheets POST/PUT can exceed the default 60s when the form fill is slow.
  test.setTimeout(120_000);
  await fillDistrictStreetPair(page, 0, corporateAddresses.from);
  await fillDistrictStreetPair(page, 1, corporateAddresses.to);
  movingTestContext.orderId = await fillSinglePageContactAndSubmit(page, contact());
});

Then(
  "the latest Google Sheet row for the order should match the submitted corporate moving details",
  async () => {
    const orderId = movingTestContext.orderId;
    expect(orderId).toBeTruthy();
    const row = await fetchOrderRowByOrderId(orderId!);
    expect(row.service).toBe("Corporate");
    expect(row.contactName).toBe(movingTestContext.contactName);
    expect(row.phone).toBe(movingTestContext.contactPhone);
    expect(row.email).toBe(movingTestContext.contactEmail);
    expect(row.fromAddress).toContain(corporateAddresses.from.street);
    expect(row.toAddress).toContain(corporateAddresses.to.street);
  },
);
