import { expect, type Page, type Response } from "@playwright/test";
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

export type TransportOrderIdentity = {
  /** Numeric order_request id required by the d2 status body. */
  id: number;
  uuid: string;
  /** Public id shown in the header, e.g. HK1234567. */
  nid: string;
};

function isB2bTransportOrderDetail(response: Response): boolean {
  if (response.request().method() !== "GET" || !response.ok()) return false;
  let pathname: string;
  try {
    pathname = new URL(response.url()).pathname.replace(/\/$/, "");
  } catch {
    return false;
  }
  const match = pathname.match(/\/b2b\/order_requests\/([^/]+)$/);
  if (!match) return false;
  return !["index", "pdf", "xlsx", "report_data"].includes(match[1]);
}

function unwrapOrder(json: unknown): Record<string, unknown> {
  if (!json || typeof json !== "object" || Array.isArray(json)) return {};
  const record = json as Record<string, unknown>;
  // Detail payload is flat: id, nid, uuid, plus a nested `order` for the driver.
  if (typeof record.uuid === "string" || typeof record.nid === "string") {
    return record;
  }
  for (const key of ["data", "order_request", "order"]) {
    const nested = record[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const inner = nested as Record<string, unknown>;
      if ("uuid" in inner || "nid" in inner || "id" in inner) return inner;
    }
  }
  return record;
}

/**
 * The header only shows the public nid. Reload the open detail so the B2B
 * order payload supplies the numeric id and uuid the driver PATCH needs.
 */
export async function readTransportOrderIdentity(
  page: Page,
): Promise<TransportOrderIdentity> {
  const headerNid = await getTransportOrderId(page);
  const responsePromise = page.waitForResponse(isB2bTransportOrderDetail, {
    timeout: 30_000,
  });
  await page.reload();
  const response = await responsePromise;
  const data = unwrapOrder(await response.json());
  const id = Number(data.id);
  const uuid = typeof data.uuid === "string" ? data.uuid : "";
  const nid =
    typeof data.nid === "string" && data.nid.length > 0 ? data.nid : headerNid;

  if (!Number.isInteger(id) || id <= 0 || !uuid) {
    throw new Error(
      `Transport order ${headerNid} detail missing numeric id or uuid`,
    );
  }

  return { id, uuid, nid };
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
