import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  clickEnquiryContinue,
  expectMoveDateEmpty,
  expectSelectDateError,
} from "../lib/pages/wizard.js";
import {
  bet4436EnquiryPath,
  parseBet4436Service,
} from "../lib/test-data/bet-4436.js";

const { When, Then } = createBdd();

Then("the preferred move date field should be empty", async ({ page }) => {
  await expectMoveDateEmpty(page);
});

When(
  "I try to continue the enquiry without choosing a move date",
  async ({ page }) => {
    await clickEnquiryContinue(page);
  },
);

Then("the select-a-date validation error should be shown", async ({ page }) => {
  await expectSelectDateError(page);
});

Then(
  "I should still be on the {string} enquiry form",
  async ({ page }, service: string) => {
    const key = parseBet4436Service(service);
    await expect(page).toHaveURL(bet4436EnquiryPath[key]);
    await expect(page).not.toHaveURL(/items-to-move|submitted/);
  },
);
