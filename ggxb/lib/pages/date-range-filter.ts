import { expect, type Page } from "@playwright/test";

/** Fixed visual-smoke window: 2026-01-01 ~ 2026-06-30 (UI format DD/MM/YY). */
export const VISUAL_SMOKE_DATE_START = "01/01/26";
export const VISUAL_SMOKE_DATE_END = "30/06/26";

/**
 * Set the shared GGXB list date-range inputs (`#date-input-start-date` /
 * `#date-input-end-date`) used by transport OM, delivery OM, and billing history.
 */
export async function setListDateRange(
  page: Page,
  start: string = VISUAL_SMOKE_DATE_START,
  end: string = VISUAL_SMOKE_DATE_END,
): Promise<void> {
  const startInput = page.locator("#date-input-start-date");
  const endInput = page.locator("#date-input-end-date");
  await expect(startInput).toBeVisible({ timeout: 30_000 });
  await expect(endInput).toBeVisible({ timeout: 30_000 });

  await startInput.click();
  await startInput.fill("");
  await startInput.pressSequentially(start, { delay: 15 });
  await endInput.click();
  await endInput.fill("");
  await endInput.pressSequentially(end, { delay: 15 });
  await endInput.press("Enter");

  await expect(startInput).toHaveValue(start, { timeout: 10_000 });
  await expect(endInput).toHaveValue(end, { timeout: 10_000 });

  // Wait for list refresh after the range change.
  await page.waitForTimeout(2_000);
  const loadingDialog = page.getByRole("dialog").filter({ hasText: /Loading/i });
  if (await loadingDialog.isVisible().catch(() => false)) {
    await expect(loadingDialog).toBeHidden({ timeout: 30_000 });
  }
}

export function pathNeedsFixedDateRange(path: string): boolean {
  return (
    path.includes("/orders") ||
    path.includes("/delivery/order-management") ||
    path.includes("/billing-history")
  );
}
