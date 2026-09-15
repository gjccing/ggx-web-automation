import { expect, type Page } from "@playwright/test";
import { closeTopUpModal, openTopUpModal } from "../navigation/side-menu.js";
import { automationCardNickname } from "../test-data/stripe.js";
import { bet4452Labels } from "../test-data/bet-4452.js";
import { ensureSingleAutomationCard } from "./payment-method.js";
import { transportOrderLabels } from "./transport-order.js";

function payWithModal(page: Page) {
  return page.getByTestId("pay-with-modal-wrapper");
}

/** Footer that holds Pay with + Estimated total + Back / Place order. */
function summaryPaymentFooter(page: Page) {
  return page
    .getByRole("button", { name: transportOrderLabels.placeOrderButton })
    .locator("xpath=ancestor::*[.//*[normalize-space()='Estimated total']][1]");
}

export async function ensureSavedCardForPaymentPicker(
  page: Page,
): Promise<void> {
  await openTopUpModal(page);
  await ensureSingleAutomationCard(page);
  await closeTopUpModal(page);
}

export async function openTransportSummaryPaymentPicker(
  page: Page,
): Promise<void> {
  const footer = summaryPaymentFooter(page);
  await expect(footer.getByText(bet4452Labels.estimatedTotal)).toBeVisible({
    timeout: 15_000,
  });

  const wallet = footer.getByText(bet4452Labels.wallet);
  if (await wallet.isVisible().catch(() => false)) {
    await wallet.click();
  } else {
    await footer.getByText(/⋅⋅⋅⋅/).first().click();
  }

  await expect(payWithModal(page)).toBeVisible({ timeout: 15_000 });
  await expect(
    payWithModal(page).getByRole("heading", { name: bet4452Labels.payWithHeading }),
  ).toBeVisible();
}

export async function selectCreditCardInPaymentPicker(
  page: Page,
  nickname: string = automationCardNickname,
): Promise<void> {
  const modal = payWithModal(page);
  await expect(modal).toBeVisible({ timeout: 15_000 });
  const card = modal.getByText(nickname, { exact: true });
  await expect(card).toBeVisible({ timeout: 15_000 });
  await card.click();
}

export async function closePaymentPickerViaX(page: Page): Promise<void> {
  const modal = payWithModal(page);
  await modal.locator('[data-cy="modal-close-btn"]').click();
  await expect(modal).toHaveCount(0, { timeout: 15_000 });
}

export async function confirmPaymentPicker(page: Page): Promise<void> {
  const modal = payWithModal(page);
  await modal.getByRole("button", { name: bet4452Labels.okButton }).click();
  await expect(modal).toHaveCount(0, { timeout: 15_000 });
}

export async function expectSummaryPaymentMethodWallet(
  page: Page,
): Promise<void> {
  const footer = summaryPaymentFooter(page);
  await expect(
    footer.getByText(bet4452Labels.wallet),
    "Pay with X should cancel; summary must stay on Wallet (BET-4452)",
  ).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    footer.getByText(automationCardNickname, { exact: true }),
  ).toHaveCount(0);
}

export async function expectSummaryPaymentMethodCard(
  page: Page,
  nickname: string = automationCardNickname,
): Promise<void> {
  const footer = summaryPaymentFooter(page);
  await expect(footer.getByText(nickname, { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(footer.getByText(bet4452Labels.wallet)).toHaveCount(0);
}
