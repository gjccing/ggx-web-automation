import { expect, type Page } from "@playwright/test";
import { setListDateRange } from "./date-range-filter.js";
import { changeOrderStatusFilter } from "./order-management-download.js";

function orderDetailDrawer(page: Page) {
  return page.getByTestId("order-detail-drawer");
}

function orderHeader(page: Page) {
  return page.locator("h3").filter({ hasText: /Order #/ });
}

export async function expectOnTransportOrderDetail(page: Page): Promise<void> {
  await expect(orderHeader(page)).toBeVisible({ timeout: 30_000 });
}

/**
 * On `/orders`, pin the visual-smoke date window, filter Completed, and open
 * the first order id cell (navigates to `/orders/{id}`).
 */
export async function openFirstCompletedTransportOrder(
  page: Page,
): Promise<void> {
  await setListDateRange(page);
  await changeOrderStatusFilter(
    page,
    "van-order-status-filter-dropdown",
    "Completed",
  );
  await page.waitForTimeout(2_000);
  const loadingDialog = page.getByRole("dialog").filter({ hasText: /Loading/i });
  if (await loadingDialog.isVisible().catch(() => false)) {
    await expect(loadingDialog).toBeHidden({ timeout: 30_000 });
  }

  const orderId = page.getByText(/#[A-Z]{2}\d{7}/).first();
  await expect(orderId).toBeVisible({ timeout: 30_000 });
  await orderId.click();
  await expect(page).toHaveURL(/\/orders\/[A-Z]{2}\d{7}/, { timeout: 30_000 });
  await expectOnTransportOrderDetail(page);
}

export async function getTransportOrderId(page: Page): Promise<string> {
  const text = (await orderHeader(page).textContent()) ?? "";
  const match = text.match(/#([A-Z]{2}\d{7})/);
  if (!match) {
    throw new Error(`Could not parse transport order id from header: ${text}`);
  }
  return match[1];
}

export async function getTransportVehicleType(page: Page): Promise<string> {
  const text = (await orderHeader(page).textContent()) ?? "";
  const parts = text.split("·");
  return parts.length > 1 ? parts[1].trim() : "";
}

export async function getTransportWaypointAddress(
  page: Page,
  waypoint: number,
): Promise<string> {
  const route = page.getByText("Route", { exact: true }).first();
  await expect(route).toBeVisible();

  const address = page.locator(
    `xpath=(//p[normalize-space()="Route"]/following-sibling::div[1]/div)[${waypoint}]//p[contains(normalize-space(.), ",") or contains(., "香港") or contains(., "Singapore")]`,
  );
  await expect(address.first()).toBeVisible({ timeout: 15_000 });
  return (await address.first().textContent())?.trim() ?? "";
}

export async function getTransportOrderStatus(page: Page): Promise<string> {
  const statusText = page.getByTestId("status-text");
  if (await statusText.isVisible().catch(() => false)) {
    return (await statusText.textContent())?.trim() ?? "";
  }

  const drawer = orderDetailDrawer(page);
  const cancelled = drawer.getByText(/Order cancelled/i);
  if (await cancelled.isVisible().catch(() => false)) {
    return (await cancelled.textContent())?.trim() ?? "";
  }

  const placed = drawer.getByText(/Order placed/i);
  await expect(placed).toBeVisible();
  return (await placed.textContent())?.trim() ?? "";
}

export async function getTransportPaymentMethod(page: Page): Promise<string> {
  const drawer = orderDetailDrawer(page);
  const label = drawer.getByText("Payment method", { exact: true });
  await expect(label).toBeVisible();
  const value = label.locator("xpath=following-sibling::p[1]");
  await expect(value).toBeVisible();
  return (await value.textContent())?.trim() ?? "";
}

export async function cancelPlacedTransportOrder(page: Page): Promise<void> {
  const cancelBtn = page.locator('[data-cy="cancel-order-btn"]');
  if (await cancelBtn.isVisible().catch(() => false)) {
    await cancelBtn.click();
  } else {
    await orderDetailDrawer(page).getByText("Cancel order", { exact: true }).click();
  }

  const confirmBtn = page.locator('[data-cy="confirm-canel-btn"]');
  if (await confirmBtn.isVisible().catch(() => false)) {
    await confirmBtn.click();
  } else {
    await page.getByRole("button", { name: /^Confirm$|^確認$/ }).click();
  }

  await expect(page.getByText(/Order cancelled/i)).toBeVisible({
    timeout: 30_000,
  });
}
