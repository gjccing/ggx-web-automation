import { expect, type Page, type Response } from "@playwright/test";
import { ggxbBaseUrl, type GgxbRegion } from "../../env.js";
import { setListDateRange } from "./date-range-filter.js";
import { changeOrderStatusFilter } from "./order-management-download.js";

export type DeliveryOrderCodes = {
  uuid?: string;
  tid?: string;
  referenceCode: string;
  dropOffCode: string;
};

function isC3OrderDetailResponse(response: Response): boolean {
  if (response.request().method() === "OPTIONS") return false;
  if (!response.ok()) return false;
  // Detail: /api/c3/orders/<uuid> — not list index.
  return /\/api\/c3\/orders\/[^/?]+\/?(?:\?|$)/.test(response.url());
}

/**
 * Read pick-up (`reference_code`) + drop-off codes from the next C3 order-detail
 * JSON response (triggered by place-order redirect or opening the drawer).
 */
export async function waitForDeliveryOrderCodesFromC3(
  page: Page,
  action: () => Promise<void>,
  timeoutMs = 30_000,
): Promise<DeliveryOrderCodes> {
  const responsePromise = page.waitForResponse(isC3OrderDetailResponse, {
    timeout: timeoutMs,
  });
  await action();
  const response = await responsePromise;
  const json = (await response.json()) as {
    data?: {
      uuid?: string;
      tid?: string;
      reference_code?: string;
      drop_off_code?: string;
    };
    uuid?: string;
    tid?: string;
    reference_code?: string;
    drop_off_code?: string;
  };
  const data = json.data ?? json;
  const referenceCode = data.reference_code ?? "";
  const dropOffCode = data.drop_off_code ?? "";
  if (!/^\d{6}$/.test(referenceCode) || !/^\d{6}$/.test(dropOffCode)) {
    throw new Error(
      `C3 order detail missing codes: ${JSON.stringify({
        reference_code: referenceCode,
        drop_off_code: dropOffCode,
      })}`,
    );
  }
  return {
    uuid: data.uuid,
    tid: data.tid,
    referenceCode,
    dropOffCode,
  };
}

function orderIdHeader(page: Page) {
  return page.getByRole("heading", { name: /Order ID|柯打/i });
}

export async function expectOnDeliveryOrderDetail(page: Page): Promise<void> {
  await expect(orderIdHeader(page)).toBeVisible({ timeout: 30_000 });
}

/**
 * On `/delivery/order-management`, pin the visual-smoke date window, filter
 * Completed, and open the first order id (opens order-detail drawer).
 */
export async function openFirstCompletedDeliveryOrder(
  page: Page,
): Promise<void> {
  await setListDateRange(page);
  await changeOrderStatusFilter(
    page,
    "delivery-order-filter-dropdown",
    "Completed",
  );
  await page.waitForTimeout(2_000);
  const loadingDialog = page.getByRole("dialog").filter({ hasText: /Loading/i });
  if (await loadingDialog.isVisible().catch(() => false)) {
    await expect(loadingDialog).toBeHidden({ timeout: 30_000 });
  }

  // Delivery ids look like `#dMywdg` / `#y4yR_g` (not SI-style).
  const orderId = page.getByText(/^#[A-Za-z0-9_-]{5,10}$/).first();
  await expect(orderId).toBeVisible({ timeout: 30_000 });
  await orderId.click();
  await expectOnDeliveryOrderDetail(page);
}

export async function getDeliveryOrderId(page: Page): Promise<string> {
  const text = (await orderIdHeader(page).textContent()) ?? "";
  // Merchant tids look like `nRuyEA` / `_eWhxQ` / `7dfE-w` (alphanumeric, underscore, hyphen).
  const match = text.match(/#([A-Za-z0-9_-]{5,10})/);
  if (!match) {
    throw new Error(`Could not parse delivery order id from header: ${text}`);
  }
  return match[1];
}

export async function getDeliveryPickUpCode(page: Page): Promise<string> {
  const drawer = page.getByTestId("order-detail-drawer");
  const label = drawer.getByText(/Pick-up code|取件碼|提貨碼/i).first();
  await expect(label).toBeVisible();
  const value =
    (await label.locator("xpath=following-sibling::*[1]").textContent())?.trim() ??
    "";
  if (!/^\d{6}$/.test(value)) {
    throw new Error(`Could not parse pick-up code from: ${value}`);
  }
  return value;
}

/** Reveal and read the 6-digit drop-off code from the order-detail drawer. */
export async function getDeliveryDropOffCode(page: Page): Promise<string> {
  const drawer = page.getByTestId("order-detail-drawer");
  // UI uses an <a>Show</a>, not a button.
  const show = drawer.locator("a").filter({ hasText: /^Show$|^顯示$/ }).first();
  if (await show.isVisible().catch(() => false)) {
    await show.click();
  }

  let code = "";
  await expect
    .poll(
      async () => {
        const block = drawer
          .locator("div")
          .filter({ hasText: /Drop-off code|送件碼|交收碼/i })
          .filter({ hasNotText: /Pick-up code|取件碼/i })
          .first();
        const text = (await block.textContent().catch(() => "")) ?? "";
        code = (text.match(/\d{6}/) || [])[0] ?? "";
        return code;
      },
      { timeout: 10_000 },
    )
    .toMatch(/^\d{6}$/);
  return code;
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
  const drawer = page.getByTestId("order-detail-drawer");
  // Docked MUI drawer root often stays `hidden` to Playwright — use content instead.
  const openHeading = drawer.getByRole("heading", { name: /Order ID|柯打/i });
  await expect(openHeading).toBeVisible({ timeout: 15_000 });

  // Prefer the newest timeline label (do not use a fragile Status-heading xpath —
  // historical "Order placed" nodes stay in the DOM after websocket updates).
  const cancelled = drawer.getByText(/Order cancelled|訂單已取消/i).first();
  if (await cancelled.isVisible().catch(() => false)) {
    return (await cancelled.textContent())?.trim() ?? "";
  }

  const completed = drawer
    .getByText(
      /Package delivered|Completed|已完成|運送完成|已送達|Delivery completed/i,
    )
    .first();
  if (await completed.isVisible().catch(() => false)) {
    return (await completed.textContent())?.trim() ?? "";
  }

  const pickedUp = drawer
    .getByText(/Package picked up|已取件|Picked up/i)
    .first();
  if (await pickedUp.isVisible().catch(() => false)) {
    return (await pickedUp.textContent())?.trim() ?? "";
  }

  const accepted = drawer
    .getByText(/Accepted by a courier|Accepted by driver|已被司機接單|已接單/i)
    .first();
  if (await accepted.isVisible().catch(() => false)) {
    return (await accepted.textContent())?.trim() ?? "";
  }

  const placed = drawer.getByText(/Order placed|已落柯打/i).first();
  await expect(placed).toBeVisible();
  return (await placed.textContent())?.trim() ?? "";
}

/** Close the docked order-detail drawer if it is covering list filters. */
export async function closeDeliveryOrderDrawerIfOpen(page: Page): Promise<void> {
  const drawer = page.getByTestId("order-detail-drawer");
  const openHeading = drawer.getByRole("heading", { name: /Order ID|柯打/i });
  if (!(await openHeading.isVisible().catch(() => false))) return;

  // Docked MUI drawers often ignore Escape — click the header X (last icon button).
  const headerButtons = drawer.locator("button");
  const count = await headerButtons.count();
  for (let i = count - 1; i >= 0; i -= 1) {
    const btn = headerButtons.nth(i);
    const label = ((await btn.textContent()) ?? "").trim();
    // Skip labeled actions (Print / Share / Cancel / Add tip / …).
    if (label.length > 0) continue;
    await btn.click({ force: true });
    break;
  }

  if (await openHeading.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
  }
  await expect(openHeading).toBeHidden({ timeout: 10_000 });
}

/**
 * Wait on the open order-detail drawer until status text matches `pattern`.
 * Prefer this after DA accept/complete so we observe live detail updates.
 */
export async function waitForDeliveryOrderStatus(
  page: Page,
  pattern: string | RegExp,
  timeoutMs = 90_000,
): Promise<string> {
  const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;
  let last = "";
  await expect
    .poll(
      async () => {
        try {
          last = await getDeliveryOrderStatus(page);
        } catch {
          last = "";
        }
        return last;
      },
      { timeout: timeoutMs, intervals: [1_000, 2_000, 3_000, 5_000] },
    )
    .toMatch(regex);
  return last;
}

/** Reload order management and reopen the order drawer by merchant tid. */
export async function reopenDeliveryOrderByTid(
  page: Page,
  region: GgxbRegion,
  tid: string,
): Promise<void> {
  await closeDeliveryOrderDrawerIfOpen(page);

  const orderLink = page.getByText(new RegExp(`^#${tid}$`)).first();
  if (await orderLink.isVisible().catch(() => false)) {
    await orderLink.click();
    await expectOnDeliveryOrderDetail(page);
    return;
  }

  const base = ggxbBaseUrl(region).replace(/\/$/, "");
  await page.goto(`${base}/delivery/order-management`);
  await expect(page).toHaveURL(/\/delivery\/order-management(?:\/|$|\?|#)/, {
    timeout: 30_000,
  });
  await closeDeliveryOrderDrawerIfOpen(page);
  await setListDateRange(page, "01/07/26", "31/12/26");

  const orderId = page.getByText(new RegExp(`^#${tid}$`)).first();
  await expect(orderId).toBeVisible({ timeout: 30_000 });
  await orderId.click();
  await expectOnDeliveryOrderDetail(page);
}

/**
 * Click Cancel on an accepted DP order. Expects the cancellation-instruction
 * `window.alert` (call CS) instead of the pending-order confirm modal / cancel API.
 */
export async function cancelAcceptedDeliveryOrderExpectInstruction(
  page: Page,
): Promise<string> {
  const cancelBtn = page.locator('[data-cy="cancel-order-btn"]');
  const trigger = (await cancelBtn.isVisible().catch(() => false))
    ? cancelBtn
    : page.getByText(/Cancel order|取消訂單|取消柯打/i).first();

  await expect(trigger).toBeVisible({ timeout: 15_000 });

  // Native `window.alert` stalls Playwright's click actionability wait — use a DOM
  // click and handle the dialog via the page event.
  const messagePromise = new Promise<string>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Timed out waiting for cancel instruction alert")),
      15_000,
    );
    page.once("dialog", async (dialog) => {
      try {
        const message = dialog.message();
        await dialog.accept();
        clearTimeout(timer);
        resolve(message);
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });
  });

  await trigger.evaluate((el) => (el as HTMLElement).click());
  return messagePromise;
}

export async function getDeliveryPaymentMethod(page: Page): Promise<string> {
  const drawer = page.getByTestId("order-detail-drawer");
  const label = drawer.getByText(/Payment method|付款方式/i).first();
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
    await page.getByText(/Cancel order|取消訂單|取消柯打/i).first().click();
  }

  const confirmBtn = page.locator('[data-cy="confirm-canel-btn"]');
  if (await confirmBtn.isVisible().catch(() => false)) {
    await confirmBtn.click();
  } else {
    await page.getByRole("button", { name: /^Confirm$|^確認$/ }).click();
  }

  await expect(page.getByText(/Order cancelled|訂單已取消|已取消/i)).toBeVisible({
    timeout: 30_000,
  });
}

/**
 * Open the first pending DP order (wallet holds from prior place-order runs).
 * Uses a date window that includes today so July staging orders are visible.
 */
export async function openFirstPendingDeliveryOrder(
  page: Page,
  region: GgxbRegion,
): Promise<void> {
  const base = ggxbBaseUrl(region).replace(/\/$/, "");
  await page.goto(`${base}/delivery/order-management`);
  await expect(page).toHaveURL(/\/delivery\/order-management(?:\/|$|\?|#)/, {
    timeout: 30_000,
  });
  await setListDateRange(page, "01/07/26", "31/12/26");

  const pending = page.getByText(/^Pending$|^待接單$|^配對中$/).first();
  if (await pending.isVisible().catch(() => false)) {
    // Prefer clicking the order id in the same row when possible.
  }

  const orderId = page.getByText(/^#[A-Za-z0-9_-]{5,10}$/).first();
  await expect(orderId).toBeVisible({ timeout: 30_000 });
  await orderId.click();
  await expectOnDeliveryOrderDetail(page);
}
