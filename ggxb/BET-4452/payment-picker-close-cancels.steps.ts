import { test } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import {
  closePaymentPickerViaX,
  confirmPaymentPicker,
  ensureSavedCardForPaymentPicker,
  expectSummaryPaymentMethodCard,
  expectSummaryPaymentMethodWallet,
  openTransportSummaryPaymentPicker,
  selectCreditCardInPaymentPicker,
} from "../lib/pages/transport-order-payment.js";

const { Given, When, Then } = createBdd();

Given(
  "a saved credit card is available for the transport payment picker",
  async ({ page }) => {
    test.setTimeout(180_000);
    await ensureSavedCardForPaymentPicker(page);
  },
);

Then("the transport summary payment method should be Wallet", async ({ page }) => {
  await expectSummaryPaymentMethodWallet(page);
});

When("I open the transport summary payment method picker", async ({ page }) => {
  await openTransportSummaryPaymentPicker(page);
});

When(
  "I select the saved credit card in the payment method picker",
  async ({ page }) => {
    await selectCreditCardInPaymentPicker(page);
  },
);

When("I close the payment method picker with the X button", async ({ page }) => {
  await closePaymentPickerViaX(page);
});

When("I confirm the payment method picker", async ({ page }) => {
  await confirmPaymentPicker(page);
});

Then(
  "the transport summary payment method should be the saved credit card",
  async ({ page }) => {
    await expectSummaryPaymentMethodCard(page);
  },
);
