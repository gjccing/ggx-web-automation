import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { automationCardNickname } from "../../lib/test-data/stripe.js";
import {
  closeTopUpModal,
  openTopUpModal,
  readSidebarWalletBalance,
} from "../../lib/navigation/side-menu.js";
import {
  addCreditCardFromTopUpModal,
  confirmTopUpPayment,
  deleteAutomationCardIfPresent,
  ensureSingleAutomationCard,
  selectPaymentCardInTopUpModal,
  selectTopUpAmountOption,
} from "../../lib/pages/payment-method.js";

const { When, Then } = createBdd();

let walletBeforeTopUp = 0;
let topUpCreditsAdded = 0;

When("I add a Stripe test credit card via the top-up modal", async ({ page }) => {
  await openTopUpModal(page);
  await deleteAutomationCardIfPresent(page);
  await addCreditCardFromTopUpModal(page);
});

When(
  "I top up the wallet using the $100 tier via the top-up modal",
  async ({ page }) => {
    walletBeforeTopUp = await readSidebarWalletBalance(page);
    await openTopUpModal(page);
    await ensureSingleAutomationCard(page);
    await selectPaymentCardInTopUpModal(page, automationCardNickname);
    topUpCreditsAdded = await selectTopUpAmountOption(page, 4);
    await confirmTopUpPayment(page);
  },
);

When(
  "I delete the Stripe test credit card from the top-up modal",
  async ({ page }) => {
    await openTopUpModal(page);
    await deleteAutomationCardIfPresent(page, { closeAfter: true });
  },
);

Then(
  "the saved card {string} should be visible in the top-up modal",
  async ({ page }, nickname: string) => {
    if (!(await page.getByTestId("top-up-modal-wrapper").isVisible().catch(() => false))) {
      await openTopUpModal(page);
    }
    await expect(
      page.getByTestId("top-up-modal-wrapper").getByText(nickname, { exact: true }),
    ).toBeVisible();
  },
);

Then(
  "the saved card {string} should not be visible in the top-up modal",
  async ({ page }, nickname: string) => {
    if (!(await page.getByTestId("top-up-modal-wrapper").isVisible().catch(() => false))) {
      await openTopUpModal(page);
    }
    await expect(
      page.getByTestId("top-up-modal-wrapper").getByText(nickname, { exact: true }),
    ).toHaveCount(0);
  },
);

Then(
  "the sidebar wallet balance should have increased by the top-up amount",
  async ({ page }) => {
    const walletAfter = await readSidebarWalletBalance(page);
    expect(walletAfter).toBe(walletBeforeTopUp + topUpCreditsAdded);
  },
);

Then("I close the top-up wallet modal", async ({ page }) => {
  await closeTopUpModal(page);
});
