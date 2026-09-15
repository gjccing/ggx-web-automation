import { expect, test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  expectNoPhotoPreview,
  expectUploadLoadingHidden,
  selectOverLimitPhotoOnExtraServices,
  selectPhotoOnExtraServices,
} from "../lib/pages/upload-photos.js";
import {
  bet4416MaxSizeDialogBody,
  bet4416MaxSizeDialogTitle,
  bet4416MaxSupportedPhotoPath,
  bet4416OverLimitPhotoPath,
} from "../lib/test-data/bet-4416.js";
import { movingLabels } from "../lib/labels.js";

const { When, Then } = createBdd();

When("I select an over-limit photo on the extra services step", async ({ page }) => {
  test.setTimeout(120_000);
  await selectOverLimitPhotoOnExtraServices(page, bet4416OverLimitPhotoPath);
});

When("I select a 4.5MB photo on the extra services step", async ({ page }) => {
  test.setTimeout(180_000);
  await selectPhotoOnExtraServices(page, bet4416MaxSupportedPhotoPath);
});

Then("the max file size dialog should be shown", async ({ page }) => {
  // Headless UI wraps the panel in a role=dialog node that Playwright treats as
  // hidden (opacity-0 on the closed/enter transition). Assert the visible copy.
  await expect(
    page.getByRole("heading", { name: bet4416MaxSizeDialogTitle }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(bet4416MaxSizeDialogBody)).toBeVisible();
  await expect(
    page.getByText("bet-4416-over-limit.png", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: movingLabels.gotIt }),
  ).toBeVisible();
});

Then("the extra services upload should not stay loading", async ({ page }) => {
  await expectUploadLoadingHidden(page);
});

Then("no photo preview should be visible", async ({ page }) => {
  await expectNoPhotoPreview(page);
});
