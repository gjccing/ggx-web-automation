import { expect, type Page } from "@playwright/test";
import {
  couponRedeemNotEligibleMessage,
  couponRedeemSuccessMessage,
} from "../test-data/bet-4372.js";
import { couponAppliedSuccessToast } from "../test-data/bet-4403.js";
import { couponAppliedFeedbackToast } from "../test-data/bet-4451.js";
import type { CouponAppliedToastWatch } from "../test-data/bet-4451-context.js";

function couponModal(page: Page) {
  return page
    .getByRole("dialog")
    .filter({ has: page.getByRole("heading", { name: /^Coupons$/i }) });
}

function summaryContainer(page: Page) {
  return page.getByTestId("vanbooking-sidebar-summary-container");
}

export async function openTransportCouponModal(page: Page): Promise<void> {
  const summary = summaryContainer(page);
  await expect(summary).toBeVisible({ timeout: 15_000 });

  const couponSectionTrigger = summary
    .getByText(/Apply to get discount/i)
    .locator("xpath=preceding-sibling::*[1]");

  if (await couponSectionTrigger.isVisible().catch(() => false)) {
    await couponSectionTrigger.click();
  } else {
    await summary.getByText(/^Add$/i).last().click();
  }

  await expect(page.getByRole("heading", { name: /^Coupons$/i })).toBeVisible({
    timeout: 15_000,
  });
}

/** Opens Coupons only via the top Coupon entry (not the price-breakdown Add link). */
export async function openTransportCouponModalViaTopEntry(
  page: Page,
): Promise<void> {
  const summary = summaryContainer(page);
  await expect(summary).toBeVisible({ timeout: 15_000 });

  const topEntryHint = summary.getByText(/Apply to get discount/i);
  await expect(topEntryHint).toBeVisible({ timeout: 15_000 });

  const couponSectionTrigger = topEntryHint.locator(
    "xpath=preceding-sibling::*[1]",
  );
  if (await couponSectionTrigger.isVisible().catch(() => false)) {
    await couponSectionTrigger.click();
  } else {
    await topEntryHint.click();
  }

  await expect(page.getByRole("heading", { name: /^Coupons$/i })).toBeVisible({
    timeout: 15_000,
  });
}

export async function redeemCouponCodeInModal(
  page: Page,
  code: string,
): Promise<void> {
  const modal = couponModal(page);
  await modal.locator("#coupon").fill(code);
  await modal.getByRole("button", { name: /^Add$/i }).click();
}

export async function expectCouponRedeemSuccessMessage(
  page: Page,
): Promise<void> {
  const toast = page.locator(".Toastify__toast-body").last();
  await expect(toast).toBeVisible({ timeout: 15_000 });
  await expect(toast).toHaveText(couponRedeemSuccessMessage);
  await expect(toast).not.toHaveText(couponRedeemNotEligibleMessage);
}

export async function expectCouponRedeemNotEligibleMessage(
  page: Page,
): Promise<void> {
  const toast = page.locator(".Toastify__toast-body").last();
  await expect(toast).toBeVisible({ timeout: 15_000 });
  await expect(toast).toHaveText(couponRedeemNotEligibleMessage);
  await expect(toast).not.toHaveText(couponRedeemSuccessMessage);
}

export async function applySelectedCouponInModal(page: Page): Promise<void> {
  const modal = couponModal(page);
  const applyButton = modal.getByRole("button", { name: /^Apply$/i });
  await expect(applyButton).toBeEnabled({ timeout: 15_000 });
  await applyButton.click();
  await expect(modal).toBeHidden({ timeout: 15_000 });
}

export async function expectTransportCouponAppliedOnSummary(
  page: Page,
  voucherTitle: string,
): Promise<void> {
  await expect(
    summaryContainer(page).getByText("Coupon applied", { exact: true }),
  ).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    summaryContainer(page).getByText(voucherTitle, { exact: true }),
  ).toBeVisible();
}

export async function expectCouponAppliedSuccessToast(
  page: Page,
): Promise<void> {
  const toast = page.locator(".Toastify__toast-body").filter({
    hasText: couponAppliedSuccessToast,
  });
  await expect(toast.first()).toBeVisible({ timeout: 15_000 });
  await expect(toast.first()).toHaveText(couponAppliedSuccessToast);
}

export async function waitForTransportToastsToClear(page: Page): Promise<void> {
  await expect(page.locator(".Toastify__toast")).toHaveCount(0, {
    timeout: 20_000,
  });
}

function couponAppliedFeedbackToastLocator(page: Page) {
  return page.locator(".Toastify__toast-body").filter({
    hasText: couponAppliedFeedbackToast,
  });
}

/**
 * Start watching for `feedback__coupon_applied` before navigating to a new
 * order — the toast auto-closes, so a late assertion misses it.
 */
export function watchCouponAppliedFeedbackToast(
  page: Page,
): CouponAppliedToastWatch {
  let appeared = false;
  let text: string | undefined;
  const toast = couponAppliedFeedbackToastLocator(page);

  void toast
    .first()
    .waitFor({ state: "visible", timeout: 180_000 })
    .then(async () => {
      appeared = true;
      text = (await toast.first().textContent())?.trim();
    })
    .catch(() => {});

  return {
    appeared: () => appeared,
    text: () => text,
  };
}

export async function expectCouponAppliedFeedbackToastDidNotAppear(
  page: Page,
  watch: CouponAppliedToastWatch,
): Promise<void> {
  await expect(summaryContainer(page)).toBeVisible({ timeout: 15_000 });
  await page
    .getByRole("dialog")
    .filter({ hasText: /Loading/i })
    .waitFor({ state: "hidden", timeout: 15_000 })
    .catch(() => {});
  await page.waitForTimeout(5_000);

  expect(
    watch.appeared(),
    `unexpected feedback__coupon_applied toast: ${watch.text() ?? "(none)"}`,
  ).toBe(false);
  await expect(couponAppliedFeedbackToastLocator(page)).toHaveCount(0);
}

export async function expectNoCouponAppliedOnSummary(
  page: Page,
  voucherTitle: string,
): Promise<void> {
  const summary = summaryContainer(page);
  await expect(summary.getByText("Coupon applied", { exact: true })).toHaveCount(
    0,
  );
  await expect(summary.getByText(voucherTitle, { exact: true })).toHaveCount(0);
  await expect(summary.getByText(/Apply to get discount/i)).toBeVisible();
}
