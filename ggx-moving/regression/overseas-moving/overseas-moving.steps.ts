import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { fillSinglePageContactAndSubmit } from "../../lib/pages/wizard.js";
import { movingLabels } from "../../lib/labels.js";
import { fetchOrderRowByOrderId } from "../../lib/sheets/order-sheet.js";
import {
  contactFixture,
  overseasCountries,
  overseasHongKongDetail,
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

async function selectOverseasCountries(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: movingLabels.select }).first().click();
  await page.getByRole("menuitem", { name: overseasCountries.from }).click();

  if (overseasCountries.from === "Hong Kong") {
    await page.getByRole("button", { name: /District|地區/ }).click();
    await page.getByRole("menuitem", { name: overseasHongKongDetail.district }).click();
    await page
      .getByRole("textbox", { name: /Specify more|進一步說明/ })
      .fill(overseasHongKongDetail.street);
  }

  await page.getByRole("button", { name: movingLabels.select }).first().click();
  await page.getByRole("menuitem", { name: overseasCountries.to }).click();
}

When("I submit the overseas moving form without filling required fields", async ({ page }) => {
  await page.getByRole("button", { name: movingLabels.getQuote }).click();
});

Then("the overseas moving validation errors should be shown", async ({ page }) => {
  await expect(page.getByText(/select a location|選擇地點/i)).toHaveCount(2);
  await expect(page.getByText(/enter.*name|輸入.*名稱/i)).toBeVisible();
  await expect(page.getByText(/enter.*phone|輸入.*電話/i)).toBeVisible();
  await expect(page.getByText(/enter.*email|輸入.*電郵/i)).toBeVisible();
});

When("I fill the overseas moving form except contact fields", async ({ page }) => {
  await selectOverseasCountries(page);
});

When("I complete the overseas moving quote flow", async ({ page }) => {
  test.setTimeout(120_000);
  await selectOverseasCountries(page);
  movingTestContext.orderId = await fillSinglePageContactAndSubmit(page, contact());
});

Then(
  "the latest Google Sheet row for the order should match the submitted overseas moving details",
  async () => {
    const orderId = movingTestContext.orderId;
    expect(orderId).toBeTruthy();
    const row = await fetchOrderRowByOrderId(orderId!);
    expect(row.service).toBe("Overseas");
    expect(row.contactName).toBe(movingTestContext.contactName);
    expect(row.fromAddress).toBe(overseasCountries.from);
    expect(row.raw[4] ?? "").toContain(overseasHongKongDetail.district);
    expect(row.raw[4] ?? "").toContain(overseasHongKongDetail.street);
    expect(row.toAddress).toBe(overseasCountries.to);
  },
);
