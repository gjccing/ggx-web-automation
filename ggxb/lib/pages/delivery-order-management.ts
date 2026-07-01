import { expect, type Page } from "@playwright/test";

function orderIdHeader(page: Page) {
  return page.getByRole("heading", { name: /Order ID/i });
}

export async function expectOnDeliveryOrderDetail(page: Page): Promise<void> {
  await expect(orderIdHeader(page)).toBeVisible({ timeout: 30_000 });
}

export async function getDeliveryOrderId(page: Page): Promise<string> {
  const text = (await orderIdHeader(page).textContent()) ?? "";
  const match = text.match(/#([a-zA-Z0-9]{6})/);
  if (!match) {
    throw new Error(`Could not parse delivery order id from header: ${text}`);
  }
  return match[1];
}

export async function getDeliveryPickUpCode(page: Page): Promise<string> {
  const drawer = page.getByTestId("order-detail-drawer");
  const label = drawer.getByText("Pick-up code", { exact: true });
  await expect(label).toBeVisible();
  const value = (await label.locator("xpath=following-sibling::*[1]").textContent())?.trim() ?? "";
  if (!/^\d{6}$/.test(value)) {
    throw new Error(`Could not parse pick-up code from: ${value}`);
  }
  return value;
}

export async function getDeliveryWaypointAddress(
  page: Page,
  waypoint: number,
): Promise<string> {
  const section = page.getByRole("heading", { name: /Pick-up & drop-off/i });
  await expect(section).toBeVisible();

  const address = page.locator(
    `xpath=//h4[contains(normalize-space(.), "Pick-up") and contains(normalize-space(.), "drop-off")]/following-sibling::div[${waypoint}]//p[2]`,
  );
  await expect(address.first()).toBeVisible({ timeout: 15_000 });
  return (await address.first().textContent())?.trim() ?? "";
}

export async function getDeliveryOrderStatus(page: Page): Promise<string> {
  const statusHeading = page.getByRole("heading", { name: /^Status$/i });
  if (await statusHeading.isVisible().catch(() => false)) {
    const status = statusHeading
      .locator("xpath=../section//span")
      .first();
    if (await status.isVisible().catch(() => false)) {
      return (await status.textContent())?.trim() ?? "";
    }
  }

  const cancelled = page.getByText(/Order cancelled/i);
  if (await cancelled.isVisible().catch(() => false)) {
    return (await cancelled.textContent())?.trim() ?? "";
  }

  const placed = page.getByText(/Order placed/i);
  await expect(placed).toBeVisible();
  return (await placed.textContent())?.trim() ?? "";
}

export async function getDeliveryPaymentMethod(page: Page): Promise<string> {
  const drawer = page.getByTestId("order-detail-drawer");
  const label = drawer.getByText("Payment method", { exact: true });
  await expect(label).toBeVisible();
  const value = label.locator("xpath=following-sibling::p[1]");
  await expect(value).toBeVisible();
  return (await value.textContent())?.trim() ?? "";
}

export async function cancelPlacedDeliveryOrder(page: Page): Promise<void> {
  const cancelBtn = page.locator('[data-cy="cancel-order-btn"]');
  if (await cancelBtn.isVisible().catch(() => false)) {
    await cancelBtn.click();
  } else {
    await page.getByText("Cancel order", { exact: true }).click();
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
