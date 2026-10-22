import { expect, type Page } from "@playwright/test";
import { ggxbBaseUrl, type GgxbRegion } from "../../env.js";

/** Close the post-place-order toast if present. */
export async function dismissNotifications(page: Page): Promise<void> {
  const dismissAll = page.getByRole("button", {
    name: /DISMISS ALL|全部關閉|全部清除/i,
  });
  if (await dismissAll.isVisible().catch(() => false)) {
    await dismissAll.click();
    return;
  }

  const close = page.locator("button").filter({ has: page.locator("span", { hasText: "X" }) });
  if (await close.first().isVisible().catch(() => false)) {
    await close.first().click();
  }
}

/** Force the browser zone before the app boots. Playwright must already be on a page. */
export async function overrideBrowserTimeZone(
  page: Page,
  timeZone: string,
): Promise<void> {
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setTimezoneOverride", { timezoneId: timeZone });
  const resolved = await page.evaluate(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  expect(resolved, "browser time zone override").toBe(timeZone);
}

export async function openNotificationPanel(page: Page): Promise<void> {
  const panel = page.getByTestId("notification-center");
  const title = panel.getByText(/^NOTIFICATIONS$|^通知$/);
  if (!(await title.isVisible().catch(() => false))) {
    await page.getByTestId("navigation-bar-notification-switch").click();
  }
  await expect(title).toBeVisible({ timeout: 15_000 });
}

export type CreatedOrderNotification = {
  orderId: string;
  timeText: string;
};

/**
 * First "order created" row whose order id is a transport nid.
 * Scrolls the panel and loads more pages when the row is below the first screen.
 */
export async function findCreatedOrderNotification(
  page: Page,
  createdLabel: string,
): Promise<CreatedOrderNotification> {
  const panel = page.getByTestId("notification-center");
  const loadMore = panel.getByRole("button", {
    name: /LOAD MORE NOTIFICATIONS|載入更多通知/i,
  });

  for (let pageIndex = 0; pageIndex < 4; pageIndex += 1) {
    const item = panel
      .locator("li")
      .filter({ hasText: createdLabel })
      .filter({ has: page.getByRole("button", { name: /#[A-Z]{2}\d{7}/ }) })
      .first();

    if (await item.isVisible().catch(() => false)) {
      const orderButton = item.getByRole("button", { name: /#[A-Z]{2}\d{7}/ });
      const orderId = ((await orderButton.innerText()) ?? "").replace("#", "").trim();
      const timeText = (
        (await orderButton.locator("xpath=preceding-sibling::p[1]").innerText()) ?? ""
      ).replace(/\s+/g, " ").trim();
      return { orderId, timeText };
    }

    if (!(await loadMore.isVisible().catch(() => false))) break;
    await loadMore.click();
    await page.waitForTimeout(1_000);
  }

  throw new Error(
    `No "${createdLabel}" notification with a transport order id was found`,
  );
}

export async function readOrderPlacedTime(
  page: Page,
  region: GgxbRegion,
  orderId: string,
): Promise<string> {
  const base = ggxbBaseUrl(region).replace(/\/$/, "");
  await page.goto(`${base}/orders/${orderId}`, { waitUntil: "domcontentloaded" });
  const drawer = page.getByTestId("order-detail-drawer");
  const placed = drawer.getByTestId("status-text").filter({
    hasText: /^Order placed$/,
  });
  await expect(placed).toBeVisible({ timeout: 30_000 });
  const time = placed.locator("xpath=following-sibling::*[1]");
  await expect(time).toBeVisible();
  return ((await time.innerText()) ?? "").replace(/\s+/g, " ").trim();
}
