import { expect, type Locator, type Page } from "@playwright/test";
import { setListDateRange } from "./date-range-filter.js";

function orderRow(page: Page, orderLabel: string): Locator {
  return page
    .locator('[data-testid^="table-row-"]')
    .filter({ hasText: orderLabel });
}

async function columnIndex(page: Page, heading: string): Promise<number> {
  const headers = page.locator("thead th");
  const count = await headers.count();
  for (let i = 0; i < count; i++) {
    const text = ((await headers.nth(i).innerText()) ?? "")
      .replace(/\s+/g, " ")
      .trim();
    if (text === heading) return i;
  }
  throw new Error(`Delivery order table column "${heading}" was not found`);
}

async function cellText(row: Locator, index: number): Promise<string> {
  return ((await row.locator("td").nth(index).innerText()) ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function setDeliveryOrderDateRange(
  page: Page,
  start: string,
  end: string,
): Promise<void> {
  await setListDateRange(page, start, end);
}

export async function searchDeliveryOrders(
  page: Page,
  query: string,
): Promise<void> {
  const input = page.locator('[name="deliveryOrderManagementSearchOrder"]');
  await expect(input).toBeVisible({ timeout: 30_000 });
  await input.fill(query);
  const search = page.getByRole("button", { name: "Search", exact: true });
  await expect(search).toBeEnabled();
  await search.click();

  const loadingDialog = page.getByRole("dialog").filter({ hasText: /Loading/i });
  if (await loadingDialog.isVisible().catch(() => false)) {
    await expect(loadingDialog).toBeHidden({ timeout: 30_000 });
  }
}

/**
 * When the browser offset differs from Hong Kong, Shipper already appends the
 * service-zone abbreviation. Status on the same row must do the same.
 * Recipient is checked only when that cell shows a clock time (not "Instant").
 */
export async function expectDeliveryStatusTimeZoneMatchesShipper(
  page: Page,
  orderLabel: string,
  zoneAbbr: string,
): Promise<void> {
  const row = orderRow(page, orderLabel);
  await expect(row).toBeVisible({ timeout: 30_000 });

  const statusText = await cellText(row, await columnIndex(page, "Status"));
  const shipperText = await cellText(row, await columnIndex(page, "Shipper"));
  const recipientText = await cellText(
    row,
    await columnIndex(page, "Recipient"),
  );

  expect(shipperText, `shipper cell: ${shipperText}`).toContain(zoneAbbr);
  expect(statusText, `status cell: ${statusText}`).toContain(zoneAbbr);
  if (/\d{1,2}:\d{2}/.test(recipientText)) {
    expect(recipientText, `recipient cell: ${recipientText}`).toContain(
      zoneAbbr,
    );
  }
}
