import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { movingLabels } from "../lib/labels.js";
import {
  cancelDiscardTextDialog,
  clickSelectFromList,
  confirmDiscardTextDialog,
  expectDiscardTextDialogVisible,
  manualItemsTextbox,
  switchToManualItemList,
  typeManualItemList,
} from "../lib/pages/items-to-move.js";

const { When, Then } = createBdd();

When(
  "I switch to the manual item list and type {string}",
  async ({ page }, text: string) => {
    await switchToManualItemList(page);
    await typeManualItemList(page, text);
  },
);

When("I choose Select from list", async ({ page }) => {
  await clickSelectFromList(page);
});

Then("the Discard text content dialog should be shown", async ({ page }) => {
  await expectDiscardTextDialogVisible(page);
});

When("I cancel the Discard text content dialog", async ({ page }) => {
  await cancelDiscardTextDialog(page);
});

Then(
  "I should still be on the manual item list with text {string}",
  async ({ page }, text: string) => {
    await expect(manualItemsTextbox(page)).toBeVisible();
    await expect(manualItemsTextbox(page)).toHaveValue(text);
    await expect(
      page.getByRole("button", { name: movingLabels.selectFromList }),
    ).toBeVisible();
  },
);

When("I confirm discarding text content", async ({ page }) => {
  await confirmDiscardTextDialog(page);
});

Then("I should be back on the item picker list", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: movingLabels.alreadyHaveAList }),
  ).toBeVisible();
  await expect(manualItemsTextbox(page)).toHaveCount(0);
  await expect(
    page.getByRole("tab", { name: /Common|常見/i }).first(),
  ).toBeVisible();
});
