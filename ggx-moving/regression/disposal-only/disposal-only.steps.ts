import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { fillWaypoint } from "../../lib/pages/address-picker.js";
import {
  clickWizardNext,
  expectMoveDetailsValidationErrors,
  fillFinalDetailsAndSubmit,
  proceedThroughItemsAndExtras,
  selectMoveTime,
} from "../../lib/pages/wizard.js";
import { movingLabels } from "../../lib/labels.js";
import { fetchOrderRowByOrderId } from "../../lib/sheets/order-sheet.js";
import {
  contactFixture,
  disposalWaypoint,
} from "../../lib/test-data/order-fixture.js";
import { movingTestContext } from "../../lib/test-data/test-context.js";

const { When, Then } = createBdd();

function contact() {
  const fixture = contactFixture(movingTestContext.runId);
  movingTestContext.contactName = fixture.name;
  movingTestContext.contactPhone = `+852${fixture.phone}`;
  movingTestContext.contactEmail = fixture.email;
  return fixture;
}

When("I submit the disposal details step without filling required fields", async ({ page }) => {
  await page.getByRole("heading", { name: /disposal details|棄置詳情/i }).waitFor();
  await clickWizardNext(page);
});

Then("the disposal details validation errors should be shown", async ({ page }) => {
  await expectMoveDetailsValidationErrors(page);
});

When("I fill the disposal moving move details step", async ({ page }) => {
  await fillWaypoint(page, movingLabels.from, disposalWaypoint);
  await selectMoveTime(page);
  await clickWizardNext(page);
  await expect(page).toHaveURL(/items-to-move/);
});

When("I complete the disposal only quote flow", async ({ page }) => {
  test.setTimeout(180_000);
  await fillWaypoint(page, movingLabels.from, disposalWaypoint);
  await selectMoveTime(page);
  await clickWizardNext(page);
  await proceedThroughItemsAndExtras(page);
  movingTestContext.orderId = await fillFinalDetailsAndSubmit(page, contact());
});

Then(
  "the latest Google Sheet row for the order should match the submitted disposal details",
  async () => {
    const orderId = movingTestContext.orderId;
    expect(orderId).toBeTruthy();
    const row = await fetchOrderRowByOrderId(orderId!);
    expect(row.service).toBe("Disposal");
    expect(row.contactName).toBe(movingTestContext.contactName);
    expect(row.fromAddress).toContain(disposalWaypoint.street);
  },
);
