import { expect, type Page } from "@playwright/test";
import { ggxbBaseUrl, type GgxbRegion } from "../../env.js";
import { ensureEnglish } from "../navigation/side-menu.js";
import { setListDateRange } from "./date-range-filter.js";

function transactionTypeControl(page: Page) {
  return page
    .getByText("Transaction type", { exact: true })
    .locator("xpath=following-sibling::*[1]");
}

function transactionTypeDropdown(page: Page) {
  return transactionTypeControl(page).getByTestId("dropdown-wrapper");
}

export function transactionHistoryRow(page: Page, orderIdDisplay: string) {
  return page.locator("tbody tr").filter({ hasText: orderIdDisplay });
}

async function waitForTransactionHistorySettled(page: Page): Promise<void> {
  const loadingDialog = page.getByRole("dialog").filter({ hasText: /Loading/i });
  if (await loadingDialog.isVisible().catch(() => false)) {
    await expect(loadingDialog).toBeHidden({ timeout: 30_000 });
  }
}

export async function navigateToTransactionHistory(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  if (region === "hk") {
    await ensureEnglish(page);
  }

  const base = ggxbBaseUrl(region).replace(/\/$/, "");
  const nav = page.getByTestId("navigation-bar-transaction-history");
  if (await nav.isVisible().catch(() => false)) {
    await nav.click();
  } else {
    await page.goto(`${base}/billing-history`);
  }

  await expect(page).toHaveURL(/\/billing-history(?:\/|$|\?|#)/, {
    timeout: 30_000,
  });
  await expect(
    page.getByRole("heading", { name: "Transaction history" }),
  ).toBeVisible({ timeout: 30_000 });
  await waitForTransactionHistorySettled(page);
}

export async function setTransactionHistoryDateRange(
  page: Page,
  start: string,
  end: string,
): Promise<void> {
  await setListDateRange(page, start, end);
  await waitForTransactionHistorySettled(page);
}

export async function expectTransactionTypeOption(
  page: Page,
  optionLabel: string,
): Promise<void> {
  await transactionTypeDropdown(page).click();
  await expect(page.getByTestId("dropdown-menu")).toBeVisible();
  const option = page.getByTestId("dropdown-option").filter({
    hasText: new RegExp(`^${optionLabel}$`),
  });
  await option.scrollIntoViewIfNeeded();
  await expect(option).toBeVisible();
}

export async function filterTransactionHistoryByType(
  page: Page,
  optionLabel: string,
  optionValue: string,
): Promise<void> {
  const menu = page.getByTestId("dropdown-menu");
  if (!(await menu.isVisible().catch(() => false))) {
    await transactionTypeDropdown(page).click();
    await expect(menu).toBeVisible();
  }

  const responsePromise = page.waitForResponse((response) => {
    if (response.request().method() !== "GET" || !response.ok()) return false;
    if (!response.url().includes("/transaction_history")) return false;
    return (
      new URL(response.url()).searchParams.get("transaction_type") ===
      optionValue
    );
  });

  const option = page.getByTestId("dropdown-option").filter({
    hasText: new RegExp(`^${optionLabel}$`),
  });
  await option.scrollIntoViewIfNeeded();
  await option.click();
  await responsePromise;
  await waitForTransactionHistorySettled(page);
}

export async function expectAdditionalChargeRow(
  page: Page,
  orderIdDisplay: string,
  typeLabel: string,
  dateLabel: string,
): Promise<void> {
  const row = transactionHistoryRow(page, orderIdDisplay).filter({
    hasText: typeLabel,
  });
  await expect(row).toBeVisible({ timeout: 30_000 });
  await expect(row).toContainText(dateLabel);
  await expect(
    transactionHistoryRow(page, orderIdDisplay).filter({
      hasText: "Order payment",
    }),
  ).toHaveCount(0);
}
