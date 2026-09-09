import { test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  expectPaymentMethodCardNumberError,
  expectSavedCardOnPaymentMethodPage,
  fillPaymentMethodAddCardForm,
  navigateToPaymentMethodPage,
  openPaymentMethodAddCardDialog,
  removeSavedCardOnPaymentMethodPage,
  removeSavedCardOnPaymentMethodPageIfPresent,
  submitPaymentMethodAddCard,
} from "../lib/pages/payment-method.js";
import {
  bet4450CardNickname,
  bet4450InvalidCard,
  bet4450SuccessCard,
} from "../lib/test-data/bet-4450.js";

const { When, Then } = createBdd();

When("I open the add card dialog on the payment method page", async ({ page }) => {
  test.setTimeout(120_000);
  await navigateToPaymentMethodPage(page, "hk");
  await removeSavedCardOnPaymentMethodPageIfPresent(page, bet4450CardNickname);
  await removeSavedCardOnPaymentMethodPageIfPresent(page, "BET-4450 fail");
  await openPaymentMethodAddCardDialog(page);
});

When(
  "I submit the invalid BET-4450 card in the add card dialog",
  async ({ page }) => {
    await fillPaymentMethodAddCardForm(page, bet4450InvalidCard, "BET-4450 fail");
    await submitPaymentMethodAddCard(page);
  },
);

Then(
  "the add card dialog should show that the card number is incorrect",
  async ({ page }) => {
    await expectPaymentMethodCardNumberError(page);
  },
);

When(
  "I correct the card number to a Stripe test card and submit again",
  async ({ page }) => {
    await fillPaymentMethodAddCardForm(
      page,
      bet4450SuccessCard,
      bet4450CardNickname,
    );
    await submitPaymentMethodAddCard(page);
  },
);

Then(
  "the saved card {string} should be visible on the payment method page",
  async ({ page }, nickname: string) => {
    await expectSavedCardOnPaymentMethodPage(page, nickname);
  },
);

Then(
  "I remove the saved card {string} from the payment method page",
  async ({ page }, nickname: string) => {
    await removeSavedCardOnPaymentMethodPage(page, nickname);
  },
);
