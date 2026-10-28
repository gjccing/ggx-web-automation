import { expect, type Page } from "@playwright/test";
import {
  bet4367InsufficientBalanceWithTip,
  bet4367TipLabels,
  type Bet4367Locale,
} from "../test-data/bet-4367.js";

function labelsFor(locale: Bet4367Locale) {
  return bet4367TipLabels[locale];
}

export async function openDeliveryTipModal(
  page: Page,
  locale: Bet4367Locale,
): Promise<void> {
  const labels = labelsFor(locale);
  const addTip = page.getByText(labels.addTip).first();
  await expect(addTip).toBeVisible({ timeout: 15_000 });
  await addTip.click();
  await expect(
    page.getByRole("heading", { name: labels.modalHeader }),
  ).toBeVisible({ timeout: 15_000 });
}

/**
 * Submit the maximum preset tip ($100). With a low-wallet account + an open
 * order hold, this should surface `prepaid_wallet_insufficient_balance`.
 */
export async function submitMaxDeliveryTip(
  page: Page,
  locale: Bet4367Locale,
): Promise<void> {
  const labels = labelsFor(locale);
  await page.getByTestId("radio-button-custom-tip").click();
  const input = page.locator('input[type="number"]').last();
  await expect(input).toBeVisible({ timeout: 10_000 });
  await input.click();
  await input.fill("100");

  const maxTipError = page.getByText(
    /Please add maximum|急單費金額不可超過/i,
  );
  if (await maxTipError.isVisible().catch(() => false)) {
    // Cap is below 100 — use the largest allowed preset instead.
    await page.getByTestId("radio-button-50.0-tip").click();
  }

  const save = page.getByRole("button", { name: labels.save });
  await expect(save).toBeEnabled({ timeout: 5_000 });
  await save.click();
}

export async function expectInsufficientBalanceWithTipAlert(
  page: Page,
  locale: Bet4367Locale,
): Promise<void> {
  const expected = bet4367InsufficientBalanceWithTip[locale];
  const toast = page.locator(".Toastify__toast-body").filter({
    hasText: expected,
  });
  await expect(toast.first()).toBeVisible({ timeout: 15_000 });
  await expect(toast.first()).toHaveText(expected);
}
