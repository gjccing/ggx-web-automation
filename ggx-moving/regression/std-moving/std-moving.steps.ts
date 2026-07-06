import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  clickWizardNext,
  expectMoveDetailsValidationErrors,
  expectWizardStepGuardRedirect,
  fillFinalDetailsAndSubmit,
  fillMoveDetailsStep,
  proceedThroughItemsAndExtras,
} from "../../lib/pages/wizard.js";
import { fetchOrderRowByOrderId } from "../../lib/sheets/order-sheet.js";
import {
  contactFixture,
  ORDER_ID_PATTERN,
  stdMovingWaypoints,
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

When("I submit the move details step without filling required fields", async ({ page }) => {
  await clickWizardNext(page);
});

Then("the move details validation errors should be shown", async ({ page }) => {
  await expectMoveDetailsValidationErrors(page);
});

When("I fill the standard moving move details step", async ({ page }) => {
  test.setTimeout(120_000);
  await fillMoveDetailsStep(page, stdMovingWaypoints.from, stdMovingWaypoints.to);
  await clickWizardNext(page);
  await expect(page).toHaveURL(/items-to-move/);
});

When(
  "I try to open wizard step {string} without completing move details",
  async ({ page }, step: string) => {
    await expectWizardStepGuardRedirect(page, "std-moving", step);
  },
);

Then(
  "I should be redirected to the standard moving move details step",
  async ({ page }) => {
    await expect(page).toHaveURL(/std-moving\/move-details/);
  },
);

When("I complete the standard moving quote flow", async ({ page }) => {
  test.setTimeout(180_000);
  await fillMoveDetailsStep(page, stdMovingWaypoints.from, stdMovingWaypoints.to);
  await clickWizardNext(page);
  await proceedThroughItemsAndExtras(page);
  movingTestContext.orderId = await fillFinalDetailsAndSubmit(page, contact());
  expect(movingTestContext.orderId).toMatch(ORDER_ID_PATTERN);
});

Then(
  "the latest Google Sheet row for the order should match the submitted standard moving details",
  async () => {
    const orderId = movingTestContext.orderId;
    expect(orderId).toBeTruthy();
    const row = await fetchOrderRowByOrderId(orderId!);

    expect(row.service).toBe("Standard");
    expect(row.orderId).toBe(orderId);
    expect(row.contactName).toBe(movingTestContext.contactName);
    expect(row.phone).toBe(movingTestContext.contactPhone);
    expect(row.email).toBe(movingTestContext.contactEmail);
    expect(row.fromAddress).toContain(stdMovingWaypoints.from.street);
    expect(row.toAddress).toContain(stdMovingWaypoints.to.street);
    expect(row.utmMedium).toBe("e2e");
    expect(row.utmSource).toBe("automation");
    expect(row.utmCampaign).toBe("std-moving");
    expect(row.utmContent).toBe("submit");
  },
);
